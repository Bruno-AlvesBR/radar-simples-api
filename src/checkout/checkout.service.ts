import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { EmailService } from '../email/email.service';
import {
  getPlanDefinition,
  normalizePlanSlug,
  PlanCycle,
} from '../plans/plan.constants';
import {
  PlanoAssinatura,
  User,
  UserDocument,
} from '../user/schemas/user.schema';
import {
  buildCheckoutPlanSummary,
  ChangePlanResult,
  determinePlanChangeType,
  getFeaturesGained,
  getFeaturesLost,
  getPlanIntervalInSeconds,
  UpgradePreviewResponse,
} from './plan-change.utils';
import { ReferralService } from '../referral/referral.service';

interface UserSubscriptionRecord {
  _id: unknown;
  email: string;
  nome: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plano?: {
    titulo: string;
    slug: string;
    valor: number;
    ciclo: PlanCycle;
    dataAdmissao: Date | string;
    dataVencimento: Date | string;
    pausadoAte?: Date | string;
    subscriptionFreeTrialPhaseEndsAt?: Date | string;
  };
}

interface SubscriptionContext {
  user: UserSubscriptionRecord;
  subscription: Stripe.Subscription;
  subscriptionItem: Stripe.SubscriptionItem;
  currentPlanSlug: string;
  currentCycle: PlanCycle;
  stripe: Stripe;
}

interface UpgradePreparation {
  context: SubscriptionContext;
  nextPlanDefinition: NonNullable<ReturnType<typeof getPlanDefinition>>;
  price: Stripe.Price;
  preview: UpgradePreviewResponse;
}

export interface UpgradeCheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionActionResult {
  ok: boolean;
  message?: string;
  pausadoAte?: string;
  subscriptionAccessEndsAtIso?: string;
}

const PERIODOS_DE_TESTE_DIAS = 7;
const DIAS_DE_PAUSA_DA_ASSINATURA = 30;

function buildPlanFromSubscription(
  subscription: Stripe.Subscription,
  planSlug: string,
  cycle: PlanCycle
): PlanoAssinatura {
  const normalizedPlanSlug = normalizePlanSlug(planSlug);
  const planDefinition = getPlanDefinition(normalizedPlanSlug);
  const amount =
    cycle === 'anual'
      ? planDefinition?.annualPrice ?? 0
      : planDefinition?.monthlyPrice ?? 0;
  const item = subscription.items?.data?.[0];
  const unitAmount = item?.price?.unit_amount ?? Math.round(amount * 100);
  const amountReal = unitAmount / 100;
  const start =
    item?.current_period_start ??
    subscription.created ??
    Math.floor(Date.now() / 1000);
  const end =
    item?.current_period_end ??
    start + (cycle === 'anual' ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60);

  const planFromStripeSubscription: PlanoAssinatura = {
    titulo: planDefinition?.name ?? planSlug,
    slug: normalizedPlanSlug ?? planSlug,
    valor: amountReal,
    ciclo: cycle,
    dataAdmissao: new Date(start * 1000),
    dataVencimento: new Date(end * 1000),
    pausadoAte: subscription.pause_collection?.resumes_at
      ? new Date(subscription.pause_collection.resumes_at * 1000)
      : undefined,
  };

  if (subscription.status === 'trialing' && subscription.trial_end) {
    planFromStripeSubscription.subscriptionFreeTrialPhaseEndsAt = new Date(
      subscription.trial_end * 1000
    );
  }

  return planFromStripeSubscription;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly referralService: ReferralService
  ) {}

  private getStripeClient() {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error(
        'Pagamento não configurado. Entre em contato com o suporte.'
      );
    }

    return new Stripe(stripeKey);
  }

  private async getUserSubscriptionContext(userId: string) {
    const user = (await this.userModel
      .findById(userId)
      .lean()) as UserSubscriptionRecord | null;

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (!user.stripeSubscriptionId) {
      throw new Error('Nenhuma assinatura ativa encontrada.');
    }

    const stripe = this.getStripeClient();
    const subscription = (await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
      {
        expand: ['items'],
      }
    )) as Stripe.Subscription;

    if (!subscription.items?.data?.length) {
      throw new Error('Assinatura sem itens válidos.');
    }

    if (!['active', 'trialing'].includes(subscription.status)) {
      throw new Error('A assinatura atual não está ativa.');
    }

    const currentPlanSlug =
      normalizePlanSlug(user.plano?.slug) ??
      normalizePlanSlug(subscription.metadata?.planId) ??
      normalizePlanSlug(subscription.items.data[0].price?.metadata?.planId) ??
      null;

    if (!currentPlanSlug) {
      throw new Error('Plano atual inválido.');
    }

    const currentCycle =
      (user.plano?.ciclo as PlanCycle | undefined) ??
      (subscription.metadata?.cycle as PlanCycle | undefined) ??
      (subscription.items.data[0].price?.metadata?.cycle as
        | PlanCycle
        | undefined) ??
      'mensal';

    return {
      user,
      subscription,
      subscriptionItem: subscription.items.data[0],
      currentPlanSlug,
      currentCycle,
      stripe,
    };
  }

  private async buildUpgradePreparation(
    userId: string,
    newPlanId: string,
    newCycle: PlanCycle,
    prorationDate: number
  ): Promise<UpgradePreparation> {
    const context = await this.getUserSubscriptionContext(userId);
    const nextPlanSlug = normalizePlanSlug(newPlanId);
    const nextPlanDefinition = getPlanDefinition(nextPlanSlug);

    if (!nextPlanSlug || !nextPlanDefinition) {
      throw new Error('Plano inválido.');
    }

    if (
      context.currentPlanSlug === nextPlanSlug &&
      context.currentCycle === newCycle
    ) {
      throw new Error('Você já está neste plano e ciclo.');
    }

    this.ensurePlanChangeIsUpgradeOnly(
      context.currentPlanSlug,
      nextPlanSlug,
      context.currentCycle,
      newCycle
    );

    const price = await this.getOrCreatePrice(
      context.stripe,
      nextPlanDefinition,
      newCycle
    );

    let creditoNaoUtilizado = 0;
    let valorProrateado = 0;

    if (context.subscription.status === 'active') {
      const upcomingInvoice = await context.stripe.invoices.createPreview({
        subscription: context.subscription.id,
        subscription_details: {
          proration_date: prorationDate,
          items: [
            {
              id: context.subscriptionItem.id,
              price: price.id,
            },
          ],
        },
      });

      const prorationLines = upcomingInvoice.lines.data.filter(
        (line: Stripe.InvoiceLineItem) =>
          line.parent?.subscription_item_details?.proration === true
      );

      creditoNaoUtilizado =
        Math.round(
          prorationLines
            .filter((line: Stripe.InvoiceLineItem) => line.amount < 0)
            .reduce(
              (sum: number, line: Stripe.InvoiceLineItem) =>
                sum + Math.abs(line.amount),
              0
            )
        ) / 100;

      const valorProrateadoCalculado = prorationLines.reduce(
        (sum: number, line: Stripe.InvoiceLineItem) => sum + line.amount,
        0
      );

      valorProrateado =
        Math.round(Math.max(valorProrateadoCalculado, 0)) / 100 ||
        Math.round(Math.max(upcomingInvoice.total, 0)) / 100;
    }

    return {
      context,
      nextPlanDefinition,
      price,
      preview: this.buildChangePlanResponse(
        context.subscription,
        context.currentPlanSlug,
        context.currentCycle,
        nextPlanDefinition.slug,
        newCycle,
        context.subscription.status === 'trialing' ? 'trialing' : 'active',
        prorationDate,
        creditoNaoUtilizado,
        valorProrateado
      ),
    };
  }

  private async persistUpgradedSubscription(
    userId: string,
    context: SubscriptionContext,
    nextPlanDefinition: NonNullable<ReturnType<typeof getPlanDefinition>>,
    newCycle: PlanCycle,
    shouldProrate: boolean,
    prorationDate?: number,
    upgradeValue?: number
  ): Promise<ChangePlanResult> {
    const shouldResetBillingCycle =
      context.subscription.status === 'active' &&
      context.currentCycle !== newCycle;

    const subscriptionUpdatePayload: Stripe.SubscriptionUpdateParams = {
      cancel_at_period_end: false,
      items: [
        {
          id: context.subscriptionItem.id,
          price: (
            await this.getOrCreatePrice(
              context.stripe,
              nextPlanDefinition,
              newCycle
            )
          ).id,
        },
      ],
      metadata: {
        planId: nextPlanDefinition.slug,
        cycle: newCycle,
        userId,
      },
      proration_behavior: shouldProrate ? 'create_prorations' : 'none',
      billing_cycle_anchor: shouldResetBillingCycle ? 'now' : undefined,
    };

    if (shouldProrate && typeof prorationDate === 'number') {
      subscriptionUpdatePayload.proration_date = prorationDate;
    }

    const updatedSubscription = await context.stripe.subscriptions.update(
      context.subscription.id,
      subscriptionUpdatePayload
    );

    const refreshedSubscription = (await context.stripe.subscriptions.retrieve(
      updatedSubscription.id,
      {
        expand: ['items'],
      }
    )) as Stripe.Subscription;

    const planObj = buildPlanFromSubscription(
      refreshedSubscription,
      nextPlanDefinition.slug,
      newCycle
    );

    const updatedUser = (await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          plano: planObj,
          stripeCustomerId:
            typeof refreshedSubscription.customer === 'string'
              ? refreshedSubscription.customer
              : refreshedSubscription.customer?.id,
          stripeSubscriptionId: refreshedSubscription.id,
          automaticSubscriptionRenewalCancelledAtPeriodEnd:
            refreshedSubscription.cancel_at_period_end === true,
          subscriptionFreeTrialPreviouslyUsed: true,
        },
        { new: true }
      )
      .select('-password')
      .lean()) as UserSubscriptionRecord | null;

    if (!updatedUser) {
      throw new Error('Não foi possível atualizar o plano do usuário.');
    }

    await this.referralService.recordReferralConversionWhenReferredUserSubscribesToPlan(
      userId
    );

    await this.sendPlanUpgradeEmail({
      recipientEmail: updatedUser.email,
      recipientName: updatedUser.nome,
      currentPlanName:
        getPlanDefinition(context.currentPlanSlug)?.name ??
        context.currentPlanSlug,
      nextPlanName: nextPlanDefinition.name,
      cycle: newCycle,
      planValue: planObj.valor,
      upgradeValue,
      dashboardUrl: this.getDashboardUrl(),
    });

    return {
      id: String(updatedUser._id),
      email: updatedUser.email,
      nome: updatedUser.nome,
      plano: updatedUser.plano
        ? {
            titulo: updatedUser.plano.titulo,
            slug:
              normalizePlanSlug(updatedUser.plano.slug) ??
              updatedUser.plano.slug,
            valor: updatedUser.plano.valor,
            ciclo: updatedUser.plano.ciclo,
            dataAdmissao: new Date(updatedUser.plano.dataAdmissao),
            dataVencimento: new Date(updatedUser.plano.dataVencimento),
            ...(updatedUser.plano.subscriptionFreeTrialPhaseEndsAt
              ? {
                  subscriptionFreeTrialPhaseEndsAt:
                    updatedUser.plano.subscriptionFreeTrialPhaseEndsAt,
                }
              : {}),
          }
        : null,
    };
  }

  private ensurePlanChangeIsUpgradeOnly(
    currentPlanSlug: string,
    nextPlanSlug: string,
    currentCycle: PlanCycle,
    nextCycle: PlanCycle
  ) {
    const normalizedCurrentPlanSlug = normalizePlanSlug(currentPlanSlug);
    const normalizedNextPlanSlug = normalizePlanSlug(nextPlanSlug);

    if (!normalizedCurrentPlanSlug || !normalizedNextPlanSlug) {
      throw new Error('Plano atual inválido.');
    }

    const changeType = determinePlanChangeType(
      normalizedCurrentPlanSlug,
      normalizedNextPlanSlug,
      currentCycle,
      nextCycle
    );

    if (changeType === 'downgrade') {
      throw new Error(
        'Não é possível fazer downgrade de plano. Selecione um plano superior ao atual.'
      );
    }
  }

  private async hasActiveSubscription(userId: string) {
    const user = (await this.userModel
      .findById(userId)
      .lean()) as UserSubscriptionRecord | null;

    if (user?.plano && !user.stripeSubscriptionId) {
      return true;
    }

    if (!user?.stripeSubscriptionId) {
      return false;
    }

    const stripe = this.getStripeClient();
    const subscription = (await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    )) as Stripe.Subscription;

    return ['active', 'trialing'].includes(subscription.status);
  }

  private async getOrCreateProduct(
    stripe: Stripe,
    planDefinition: ReturnType<typeof getPlanDefinition>
  ) {
    if (!planDefinition) {
      throw new Error('Plano inválido.');
    }

    const existingProducts = await stripe.products.list({
      active: true,
      limit: 100,
    });
    const existingProduct = existingProducts.data.find(
      (product) =>
        normalizePlanSlug(product.metadata?.planId) === planDefinition.slug
    );

    if (existingProduct) {
      return existingProduct;
    }

    return stripe.products.create({
      name: planDefinition.name,
      metadata: {
        planId: planDefinition.slug,
      },
    });
  }

  private async getOrCreatePrice(
    stripe: Stripe,
    planDefinition: NonNullable<ReturnType<typeof getPlanDefinition>>,
    cycle: PlanCycle
  ) {
    const product = await this.getOrCreateProduct(stripe, planDefinition);
    const amount =
      cycle === 'anual'
        ? planDefinition.annualPrice
        : planDefinition.monthlyPrice;
    const unitAmount = Math.round(amount * 100);
    const recurringInterval = cycle === 'anual' ? 'year' : 'month';

    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });

    const existingPrice = existingPrices.data.find(
      (price) =>
        price.unit_amount === unitAmount &&
        price.recurring?.interval === recurringInterval &&
        normalizePlanSlug(price.metadata?.planId) === planDefinition.slug &&
        price.metadata?.cycle === cycle
    );

    if (existingPrice) {
      return existingPrice;
    }

    return stripe.prices.create({
      product: product.id,
      currency: 'brl',
      unit_amount: unitAmount,
      recurring: {
        interval: recurringInterval,
      },
      metadata: {
        planId: planDefinition.slug,
        cycle,
      },
    });
  }

  private getPlanNextBillingDate(
    subscription: Stripe.Subscription,
    currentCycle: PlanCycle,
    nextCycle: PlanCycle,
    prorationDate: number,
    status: 'trialing' | 'active'
  ) {
    if (status === 'trialing') {
      const trialEnd =
        subscription.trial_end ?? subscription.items.data[0].current_period_end;
      return trialEnd
        ? new Date(trialEnd * 1000)
        : new Date(prorationDate * 1000);
    }

    if (currentCycle !== nextCycle) {
      return new Date(
        (prorationDate + getPlanIntervalInSeconds(nextCycle)) * 1000
      );
    }

    return new Date(
      (subscription.items.data[0].current_period_end ?? prorationDate) * 1000
    );
  }

  private buildChangePlanResponse(
    subscription: Stripe.Subscription,
    currentPlanSlug: string,
    currentCycle: PlanCycle,
    nextPlanSlug: string,
    nextCycle: PlanCycle,
    status: 'trialing' | 'active',
    prorationDate: number,
    creditoNaoUtilizado: number,
    valorProrateado: number
  ): UpgradePreviewResponse {
    const nextPlanDefinition = getPlanDefinition(nextPlanSlug);
    const normalizedCurrentPlanSlug = normalizePlanSlug(currentPlanSlug);
    const normalizedNextPlanSlug = normalizePlanSlug(nextPlanSlug);

    if (!normalizedCurrentPlanSlug || !normalizedNextPlanSlug) {
      throw new Error('Plano atual inválido.');
    }

    const currentPlanValue =
      (subscription.items.data[0].price?.unit_amount ?? 0) / 100;
    const currentPlan = buildCheckoutPlanSummary(
      normalizedCurrentPlanSlug,
      currentCycle,
      currentPlanValue
    );
    const nextPlan = buildCheckoutPlanSummary(
      normalizedNextPlanSlug,
      nextCycle
    );
    const changeType = determinePlanChangeType(
      normalizedCurrentPlanSlug,
      normalizedNextPlanSlug,
      currentCycle,
      nextCycle
    );
    const featuresGanhas = getFeaturesGained(
      normalizedCurrentPlanSlug,
      normalizedNextPlanSlug
    );
    const featuresPerdidas = getFeaturesLost(
      normalizedCurrentPlanSlug,
      normalizedNextPlanSlug
    );
    const dataProximaCobranca = this.getPlanNextBillingDate(
      subscription,
      currentCycle,
      nextCycle,
      prorationDate,
      status
    );

    return {
      planoAtual: currentPlan,
      planoNovo: nextPlan,
      tipoMudanca: changeType,
      statusAssinatura: status,
      diasRestantesTrial:
        status === 'trialing' && subscription.trial_end
          ? Math.max(
              0,
              Math.ceil(
                (subscription.trial_end * 1000 - Date.now()) /
                  (24 * 60 * 60 * 1000)
              )
            )
          : null,
      featuresGanhas,
      featuresPerdidas,
      valorProximaCobranca: nextPlan.valor,
      dataProximaCobranca: dataProximaCobranca.toISOString(),
      creditoNaoUtilizado,
      valorProrateado,
      prorationDate,
      mensagemResumo:
        status === 'trialing'
          ? `Você está no período de teste. A mudança para ${
              nextPlanDefinition?.name ?? nextPlanSlug
            } mantém o trial com os dias restantes.`
          : changeType === 'downgrade'
          ? `A mudança para ${
              nextPlanDefinition?.name ?? nextPlanSlug
            } será aplicada com crédito proporcional do período não utilizado.`
          : `A mudança para ${
              nextPlanDefinition?.name ?? nextPlanSlug
            } será aplicada com prorrogação proporcional imediata.`,
    };
  }

  async createSession(
    userId: string,
    userEmail: string,
    planId: string,
    cycle: PlanCycle
  ): Promise<{ url: string; sessionId: string }> {
    const normalizedPlanSlug = normalizePlanSlug(planId);
    const planDefinition = getPlanDefinition(normalizedPlanSlug);
    if (!planDefinition) {
      throw new Error('Plano inválido.');
    }

    if (await this.hasActiveSubscription(userId)) {
      throw new Error(
        'Você já possui uma assinatura ativa. Use a alteração de plano para atualizar sua assinatura.'
      );
    }

    const accountEligibleForCheckoutSession = await this.userModel
      .findById(userId)
      .select('stripeCustomerId subscriptionFreeTrialPreviouslyUsed')
      .lean();
    const returningCustomerShouldSkipStripeTrialPeriod =
      Boolean(accountEligibleForCheckoutSession?.stripeCustomerId) ||
      accountEligibleForCheckoutSession?.subscriptionFreeTrialPreviouslyUsed ===
        true;

    const amount =
      cycle === 'anual'
        ? planDefinition.annualPrice
        : planDefinition.monthlyPrice;
    const unitAmountCentavos = Math.round(amount * 100);
    const stripe = this.getStripeClient();
    const successUrl =
      this.configService.get('FRONTEND_URL', 'http://localhost:4200') +
      '/app/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl =
      this.configService.get('FRONTEND_URL', 'http://localhost:4200') +
      '/checkout?plano=' +
      planDefinition.slug +
      '&ciclo=' +
      cycle;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      locale: 'pt-BR',
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        planId: planDefinition.slug,
        cycle,
        userId,
      },
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: planDefinition.name,
              description:
                cycle === 'anual'
                  ? 'Assinatura anual (2 meses grátis)'
                  : 'Assinatura mensal',
            },
            unit_amount: unitAmountCentavos,
            recurring: {
              interval: cycle === 'anual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        ...(!returningCustomerShouldSkipStripeTrialPeriod
          ? { trial_period_days: PERIODOS_DE_TESTE_DIAS }
          : {}),
        metadata: {
          planId: planDefinition.slug,
          cycle,
          userId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error('Erro ao criar sessão de pagamento.');
    }

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async previewUpgrade(
    userId: string,
    newPlanId: string,
    newCycle: PlanCycle
  ): Promise<UpgradePreviewResponse> {
    return (
      await this.buildUpgradePreparation(
        userId,
        newPlanId,
        newCycle,
        Math.floor(Date.now() / 1000)
      )
    ).preview;
  }

  async upgradeSubscription(
    userId: string,
    newPlanId: string,
    newCycle: PlanCycle,
    prorationDateInput?: number
  ): Promise<ChangePlanResult> {
    const preparation = await this.buildUpgradePreparation(
      userId,
      newPlanId,
      newCycle,
      typeof prorationDateInput === 'number'
        ? prorationDateInput
        : Math.floor(Date.now() / 1000)
    );

    const shouldProrate =
      preparation.context.subscription.status !== 'trialing';

    return this.persistUpgradedSubscription(
      userId,
      preparation.context,
      preparation.nextPlanDefinition,
      newCycle,
      shouldProrate,
      prorationDateInput,
      preparation.preview.valorProrateado
    );
  }

  async createUpgradeCheckoutSession(
    userId: string,
    newPlanId: string,
    newCycle: PlanCycle,
    prorationDateInput?: number
  ): Promise<UpgradeCheckoutSessionResponse> {
    const prorationDate =
      typeof prorationDateInput === 'number'
        ? prorationDateInput
        : Math.floor(Date.now() / 1000);

    const preparation = await this.buildUpgradePreparation(
      userId,
      newPlanId,
      newCycle,
      prorationDate
    );

    if (preparation.preview.valorProrateado <= 0) {
      throw new Error('Não há valor para pagamento neste upgrade.');
    }

    const stripe = preparation.context.stripe;
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:4200'
    );
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'pt-BR',
      client_reference_id: userId,
      customer_email: preparation.context.user.email,
      metadata: {
        action: 'plan_upgrade',
        planId: preparation.nextPlanDefinition.slug,
        cycle: newCycle,
        userId,
        prorationDate: String(prorationDate),
      },
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Diferença do upgrade para ${preparation.nextPlanDefinition.name}`,
              description: preparation.preview.mensagemResumo,
            },
            unit_amount: Math.round(preparation.preview.valorProrateado * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/app/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/app/planos`,
    });

    if (!session.url) {
      throw new Error('Erro ao criar sessão de pagamento do upgrade.');
    }

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async confirmSession(
    sessionId: string,
    userId: string
  ): Promise<{
    id: string;
    email: string;
    nome: string;
    plano: unknown;
  } | null> {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return null;
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.client_reference_id !== userId) {
      return null;
    }

    if (session.status !== 'complete') {
      return null;
    }

    const planId =
      (session.metadata?.planId as string) ?? session.metadata?.planoId;
    const cycle =
      (session.metadata?.cycle as PlanCycle) ??
      (session.metadata?.ciclo as PlanCycle) ??
      'mensal';
    if (!normalizePlanSlug(planId)) {
      return null;
    }

    if (
      session.mode === 'payment' &&
      session.metadata?.action === 'plan_upgrade'
    ) {
      if (session.payment_status !== 'paid') {
        return null;
      }

      const currentUser = (await this.userModel
        .findById(userId)
        .select('-password')
        .lean()) as UserSubscriptionRecord | null;
      if (
        currentUser?.plano &&
        normalizePlanSlug(currentUser.plano.slug) ===
          normalizePlanSlug(planId) &&
        currentUser.plano.ciclo === cycle
      ) {
        return {
          id: String(currentUser._id),
          email: currentUser.email,
          nome: currentUser.nome,
          plano: {
            titulo: currentUser.plano.titulo,
            slug:
              normalizePlanSlug(currentUser.plano.slug) ??
              currentUser.plano.slug,
            valor: currentUser.plano.valor,
            ciclo: currentUser.plano.ciclo,
            dataAdmissao: new Date(currentUser.plano.dataAdmissao),
            dataVencimento: new Date(currentUser.plano.dataVencimento),
          },
        };
      }

      const prorationDate = Number(session.metadata?.prorationDate);
      const preparation = await this.buildUpgradePreparation(
        userId,
        planId,
        cycle,
        Number.isFinite(prorationDate)
          ? prorationDate
          : Math.floor(Date.now() / 1000)
      );

      const expectedAmount = Math.round(
        preparation.preview.valorProrateado * 100
      );
      if (expectedAmount !== (session.amount_total ?? 0)) {
        return null;
      }

      return this.persistUpgradedSubscription(
        userId,
        preparation.context,
        preparation.nextPlanDefinition,
        cycle,
        false,
        Number.isFinite(prorationDate)
          ? prorationDate
          : Math.floor(Date.now() / 1000),
        preparation.preview.valorProrateado
      );
    }

    let planObj: PlanoAssinatura | null = null;
    if (session.subscription) {
      const subscription =
        typeof session.subscription === 'object'
          ? session.subscription
          : await stripe.subscriptions.retrieve(String(session.subscription));
      planObj = buildPlanFromSubscription(subscription, planId, cycle);
    }

    const subscriptionId = session.subscription
      ? typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription).id
      : undefined;
    const customerId = session.customer
      ? typeof session.customer === 'string'
        ? session.customer
        : (session.customer as Stripe.Customer).id
      : undefined;

    const updatePayload: Record<string, unknown> = {
      plano: planObj,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      automaticSubscriptionRenewalCancelledAtPeriodEnd: false,
      subscriptionFreeTrialPreviouslyUsed: true,
    };

    if (!planObj) {
      delete updatePayload.plano;
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, updatePayload, { new: true })
      .select('-password')
      .lean();

    if (!user) {
      return null;
    }

    if (user.plano) {
      await this.referralService.recordReferralConversionWhenReferredUserSubscribesToPlan(
        userId
      );
    }

    return {
      id: String(user._id),
      email: user.email,
      nome: user.nome,
      plano: user.plano
        ? {
            titulo: user.plano.titulo,
            slug: normalizePlanSlug(user.plano.slug) ?? user.plano.slug,
            valor: user.plano.valor,
            ciclo: user.plano.ciclo,
            dataAdmissao: user.plano.dataAdmissao,
            dataVencimento: user.plano.dataVencimento,
            ...(user.plano.subscriptionFreeTrialPhaseEndsAt
              ? {
                  subscriptionFreeTrialPhaseEndsAt:
                    user.plano.subscriptionFreeTrialPhaseEndsAt,
                }
              : {}),
          }
        : null,
    };
  }

  async verifyWebhook(
    webhookSecret: string,
    rawBody: Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY não configurado.');
    }

    const stripe = new Stripe(stripeKey);
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    ) as Stripe.Event;
  }

  async cancelSubscription(userId: string): Promise<SubscriptionActionResult> {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return { ok: false, message: 'Pagamento não configurado.' };
    }

    const user = await this.userModel.findById(userId).lean();
    if (!user?.stripeSubscriptionId || !user?.plano) {
      return {
        ok: false,
        message: 'Nenhuma assinatura ativa para cancelar.',
      };
    }

    const stripe = new Stripe(stripeKey);
    try {
      const subscriptionBeforeUpdate = (await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      )) as Stripe.Subscription;

      if (
        ['canceled', 'incomplete_expired'].includes(
          subscriptionBeforeUpdate.status
        )
      ) {
        return {
          ok: false,
          message: 'Esta assinatura não está mais ativa.',
        };
      }

      let subscriptionAfterUpdate = subscriptionBeforeUpdate;

      if (!subscriptionBeforeUpdate.cancel_at_period_end) {
        subscriptionAfterUpdate = (await stripe.subscriptions.update(
          user.stripeSubscriptionId,
          { cancel_at_period_end: true }
        )) as Stripe.Subscription;
      }

      const subscriptionBillingItemAfterUpdate =
        subscriptionAfterUpdate.items?.data?.[0];
      const currentPeriodEndUnixSeconds =
        subscriptionBillingItemAfterUpdate?.current_period_end ?? null;
      const subscriptionAccessEndsAtDate = currentPeriodEndUnixSeconds
        ? new Date(currentPeriodEndUnixSeconds * 1000)
        : null;

      const userUpdateAfterSchedulingCancellation: Record<string, unknown> = {
        automaticSubscriptionRenewalCancelledAtPeriodEnd: true,
      };
      if (subscriptionAccessEndsAtDate) {
        userUpdateAfterSchedulingCancellation['plano.dataVencimento'] =
          subscriptionAccessEndsAtDate;
      }
      await this.userModel.findByIdAndUpdate(
        userId,
        userUpdateAfterSchedulingCancellation
      );

      const renewalWasAlreadyCancelledInStripe =
        subscriptionBeforeUpdate.cancel_at_period_end === true;

      if (!renewalWasAlreadyCancelledInStripe) {
        await this.sendPlanCancellationEmail({
          recipientEmail: user.email,
          recipientName: user.nome,
          planName: user.plano.titulo,
          canceledAt: new Date(),
          plansUrl: this.getPlansUrl(),
          subscriptionAccessRemainsThroughDate:
            subscriptionAccessEndsAtDate ?? undefined,
        });
      }

      return {
        ok: true,
        subscriptionAccessEndsAtIso:
          subscriptionAccessEndsAtDate?.toISOString() ?? undefined,
        message: renewalWasAlreadyCancelledInStripe
          ? 'A renovação automática já estava desativada.'
          : undefined,
      };
    } catch (error) {
      const messageFromError =
        error instanceof Error ? error.message : 'Erro ao cancelar assinatura.';
      return { ok: false, message: messageFromError };
    }
  }

  async pauseSubscription(userId: string): Promise<SubscriptionActionResult> {
    try {
      const context = await this.getUserSubscriptionContext(userId);
      const dataRetornoAssinatura = new Date();
      dataRetornoAssinatura.setDate(
        dataRetornoAssinatura.getDate() + DIAS_DE_PAUSA_DA_ASSINATURA
      );
      const resumeAt = Math.floor(dataRetornoAssinatura.getTime() / 1000);

      const updatedSubscription = await context.stripe.subscriptions.update(
        context.subscription.id,
        {
          pause_collection: {
            behavior: 'void',
            resumes_at: resumeAt,
          },
        }
      );

      const resumeAtTimestamp =
        updatedSubscription.pause_collection?.resumes_at ?? resumeAt;
      const pausadoAte = new Date(resumeAtTimestamp * 1000);

      await this.userModel.findByIdAndUpdate(userId, {
        $set: {
          'plano.pausadoAte': pausadoAte,
        },
      });

      return {
        ok: true,
        pausadoAte: pausadoAte.toISOString(),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao pausar assinatura.';
      return { ok: false, message };
    }
  }

  async processEvent(event: Stripe.Event): Promise<void> {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return;
    }

    const stripe = new Stripe(stripeKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const planId =
          (session.metadata?.planId as string) ?? session.metadata?.planoId;
        const cycle =
          (session.metadata?.cycle as PlanCycle) ??
          (session.metadata?.ciclo as PlanCycle) ??
          'mensal';
        const normalizedPlanSlug = normalizePlanSlug(planId);

        if (userId && normalizedPlanSlug) {
          let planObj: PlanoAssinatura | null = null;
          if (session.subscription) {
            const subscriptionId =
              typeof session.subscription === 'string'
                ? session.subscription
                : (session.subscription as Stripe.Subscription).id;
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            planObj = buildPlanFromSubscription(
              subscription,
              normalizedPlanSlug,
              cycle
            );
          }

          const subscriptionId = session.subscription
            ? typeof session.subscription === 'string'
              ? session.subscription
              : (session.subscription as Stripe.Subscription).id
            : undefined;
          const customerId = session.customer
            ? typeof session.customer === 'string'
              ? session.customer
              : (session.customer as Stripe.Customer).id
            : undefined;

          const updatePayload: Record<string, unknown> = {
            plano: planObj,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            automaticSubscriptionRenewalCancelledAtPeriodEnd: false,
            subscriptionFreeTrialPreviouslyUsed: true,
          };

          if (!planObj) {
            delete updatePayload.plano;
          }

          const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, updatePayload, { new: true })
            .select('-password')
            .lean();

          if (updatedUser?.email) {
            const planDefinition = getPlanDefinition(normalizedPlanSlug);
            await this.sendActivationEmail(
              updatedUser.email,
              updatedUser.nome,
              planObj?.titulo ?? planDefinition?.name ?? normalizedPlanSlug,
              cycle,
              planObj?.valor ??
                (cycle === 'anual'
                  ? planDefinition?.annualPrice
                  : planDefinition?.monthlyPrice) ??
                0
            );
          }

          if (planObj && updatedUser) {
            await this.referralService.recordReferralConversionWhenReferredUserSubscribesToPlan(
              userId
            );
          }
        }

        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.removePlanBySubscriptionId(subscription.id);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const planId =
          (subscription.metadata?.planId as string) ??
          subscription.metadata?.planoId;
        const cycle =
          (subscription.metadata?.cycle as PlanCycle) ??
          (subscription.metadata?.ciclo as PlanCycle) ??
          'mensal';
        const normalizedPlanSlug = normalizePlanSlug(planId);

        if (normalizedPlanSlug) {
          if (['active', 'trialing'].includes(subscription.status)) {
            const planObj = buildPlanFromSubscription(
              subscription,
              normalizedPlanSlug,
              cycle
            );
            await this.userModel.updateOne(
              { stripeSubscriptionId: subscription.id },
              {
                plano: planObj,
                automaticSubscriptionRenewalCancelledAtPeriodEnd:
                  subscription.cancel_at_period_end === true,
              }
            );
            const referredUserIdentifierFromStripeMetadata =
              typeof subscription.metadata?.userId === 'string'
                ? subscription.metadata.userId
                : null;
            let referredUserIdentifierForReferralConversion =
              referredUserIdentifierFromStripeMetadata;
            if (!referredUserIdentifierForReferralConversion) {
              const referredUserDocumentFromDatabase = await this.userModel
                .findOne({ stripeSubscriptionId: subscription.id })
                .select('_id')
                .lean();
              referredUserIdentifierForReferralConversion =
                referredUserDocumentFromDatabase?._id
                  ? String(referredUserDocumentFromDatabase._id)
                  : null;
            }
            if (referredUserIdentifierForReferralConversion) {
              await this.referralService.recordReferralConversionWhenReferredUserSubscribesToPlan(
                referredUserIdentifierForReferralConversion
              );
            }
          } else {
            await this.removePlanBySubscriptionId(subscription.id);
          }
        }

        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          invoice.parent?.subscription_details?.subscription;
        if (subscriptionId) {
          const subscription =
            typeof subscriptionId === 'string'
              ? await stripe.subscriptions.retrieve(subscriptionId)
              : subscriptionId;
          if (
            ['past_due', 'unpaid', 'canceled', 'incomplete_expired'].includes(
              subscription.status
            )
          ) {
            await this.removePlanBySubscriptionId(subscription.id);
          }
        }

        break;
      }
    }
  }

  private async removePlanBySubscriptionId(subscriptionId: string) {
    await this.userModel.updateOne(
      { stripeSubscriptionId: subscriptionId },
      {
        $unset: {
          plano: 1,
          stripeSubscriptionId: 1,
          automaticSubscriptionRenewalCancelledAtPeriodEnd: 1,
        },
      }
    );
  }

  private async sendActivationEmail(
    recipientEmail: string,
    recipientName: string | undefined,
    planName: string,
    cycle: PlanCycle,
    planValue: number
  ) {
    try {
      await this.emailService.sendCheckoutConfirmation({
        recipientEmail,
        recipientName,
        planName,
        cycle,
        planValue,
        dashboardUrl: this.getDashboardUrl(),
      });
    } catch {
      return;
    }
  }

  private async sendPlanCancellationEmail(payload: {
    recipientEmail: string;
    recipientName?: string;
    planName: string;
    canceledAt: Date;
    plansUrl: string;
    subscriptionAccessRemainsThroughDate?: Date;
  }) {
    try {
      await this.emailService.sendPlanCancellationConfirmation(payload);
    } catch {
      return;
    }
  }

  private async sendPlanUpgradeEmail(payload: {
    recipientEmail: string;
    recipientName?: string;
    currentPlanName: string;
    nextPlanName: string;
    cycle: PlanCycle;
    planValue: number;
    upgradeValue?: number;
    dashboardUrl: string;
  }) {
    try {
      await this.emailService.sendPlanUpgradeConfirmation(payload);
    } catch {
      return;
    }
  }

  private getFrontendUrl() {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:4200'
    );
  }

  private getDashboardUrl() {
    return `${this.getFrontendUrl()}/app/dashboard`;
  }

  private getPlansUrl() {
    return `${this.getFrontendUrl()}/planos`;
  }
}
