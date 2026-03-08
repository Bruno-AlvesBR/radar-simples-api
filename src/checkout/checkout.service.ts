import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import {
  PlanoAssinatura,
  User,
  UserDocument,
} from '../user/schemas/user.schema';

const PLANS: Record<
  string,
  { name: string; monthlyPrice: number; annualPrice: number }
> = {
  pro: { name: 'PRO', monthlyPrice: 24.9, annualPrice: 249 },
};

function buildPlanFromSubscription(
  subscription: Stripe.Subscription,
  planId: string,
  cycle: 'mensal' | 'anual',
): PlanoAssinatura {
  const plan = PLANS[planId];
  const amount =
    cycle === 'anual' ? plan?.annualPrice ?? 0 : plan?.monthlyPrice ?? 0;
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

  return {
    titulo: plan?.name ?? planId,
    slug: planId,
    valor: amountReal,
    ciclo: cycle,
    dataAdmissao: new Date(start * 1000),
    dataVencimento: new Date(end * 1000),
  };
}

@Injectable()
export class CheckoutService {
  constructor(
    private config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createSession(
    userId: string,
    userEmail: string,
    planId: string,
    cycle: 'mensal' | 'anual',
  ): Promise<{ url: string; sessionId: string }> {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error(
        'Pagamento não configurado. Entre em contato com o suporte.',
      );
    }

    const plan = PLANS[planId];
    if (!plan) {
      throw new Error('Plano inválido.');
    }

    const amount = cycle === 'anual' ? plan.annualPrice : plan.monthlyPrice;
    const unitAmountCentavos = Math.round(amount * 100);

    const stripe = new Stripe(stripeKey);

    const successUrl =
      this.config.get('FRONTEND_URL', 'http://localhost:4200') +
      '/app/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl =
      this.config.get('FRONTEND_URL', 'http://localhost:4200') +
      '/checkout?plano=' +
      planId +
      '&ciclo=' +
      cycle;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      locale: 'pt-BR',
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: { planId, cycle, userId },
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
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
        trial_period_days: 7,
        metadata: { planId, cycle, userId },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error('Erro ao criar sessão de pagamento.');
    }

    return { url: session.url, sessionId: session.id };
  }

  async confirmSession(
    sessionId: string,
    userId: string,
  ): Promise<{
    id: string;
    email: string;
    nome: string;
    plano: unknown;
  } | null> {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) return null;

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.client_reference_id !== userId) return null;
    if (session.status !== 'complete') return null;

    const planId =
      (session.metadata?.planId as string) ?? session.metadata?.planoId;
    const cycle =
      (session.metadata?.cycle as 'mensal' | 'anual') ??
      (session.metadata?.ciclo as 'mensal' | 'anual') ??
      'mensal';
    if (!planId || !['essencial', 'pro', 'growth'].includes(planId))
      return null;

    let planObj: PlanoAssinatura | null = null;
    if (session.subscription) {
      const sub =
        typeof session.subscription === 'object'
          ? session.subscription
          : await stripe.subscriptions.retrieve(String(session.subscription));
      planObj = buildPlanFromSubscription(sub, planId, cycle);
    }

    const subId = session.subscription
      ? typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription).id
      : undefined;
    const custId = session.customer
      ? typeof session.customer === 'string'
        ? session.customer
        : (session.customer as Stripe.Customer).id
      : undefined;

    const update: Record<string, unknown> = {
      plano: planObj,
      stripeCustomerId: custId,
      stripeSubscriptionId: subId,
    };
    if (!planObj) delete update.plano;

    const user = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select('-password')
      .lean();

    if (!user) return null;
    return {
      id: String(user._id),
      email: user.email,
      nome: user.nome,
      plano: user.plano
        ? {
            titulo: user.plano.titulo,
            slug: user.plano.slug,
            valor: user.plano.valor,
            ciclo: user.plano.ciclo,
            dataAdmissao: user.plano.dataAdmissao,
            dataVencimento: user.plano.dataVencimento,
          }
        : null,
    };
  }

  async verifyWebhook(
    webhookSecret: string,
    rawBody: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY não configurado.');
    const stripe = new Stripe(stripeKey);
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    ) as Stripe.Event;
  }

  async cancelSubscription(
    userId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return { ok: false, message: 'Pagamento não configurado.' };
    }

    const user = await this.userModel.findById(userId).lean();

    if (!user?.stripeSubscriptionId || !user?.plano) {
      return { ok: false, message: 'Nenhuma assinatura ativa para cancelar.' };
    }

    const dataAdmissao =
      user.plano.dataAdmissao instanceof Date
        ? user.plano.dataAdmissao
        : new Date(user.plano.dataAdmissao);
    const trialEnd = new Date(dataAdmissao);
    trialEnd.setDate(trialEnd.getDate() + 7);

    if (new Date() >= trialEnd) {
      return {
        ok: false,
        message:
          'O período de teste gratuito já acabou. Entre em contato com o suporte para cancelar.',
      };
    }

    const stripe = new Stripe(stripeKey);
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { plano: 1, stripeSubscriptionId: 1 },
    });

    return { ok: true };
  }

  async processEvent(event: Stripe.Event): Promise<void> {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) return;
    const stripe = new Stripe(stripeKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const planId =
          (session.metadata?.planId as string) ?? session.metadata?.planoId;
        const cycle =
          (session.metadata?.cycle as 'mensal' | 'anual') ??
          (session.metadata?.ciclo as 'mensal' | 'anual') ??
          'mensal';
        if (userId && planId && planId === 'pro') {
          let planObj: PlanoAssinatura | null = null;
          if (session.subscription) {
            const subId =
              typeof session.subscription === 'string'
                ? session.subscription
                : (session.subscription as Stripe.Subscription).id;
            const sub = await stripe.subscriptions.retrieve(subId);
            planObj = buildPlanFromSubscription(sub, planId, cycle);
          }
          const subId = session.subscription
            ? typeof session.subscription === 'string'
              ? session.subscription
              : (session.subscription as Stripe.Subscription).id
            : undefined;
          const custId = session.customer
            ? typeof session.customer === 'string'
              ? session.customer
              : (session.customer as Stripe.Customer).id
            : undefined;
          const update: Record<string, unknown> = {
            plano: planObj,
            stripeCustomerId: custId,
            stripeSubscriptionId: subId,
          };
          if (!planObj) delete update.plano;
          await this.userModel.findByIdAndUpdate(userId, update);
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
          (subscription.metadata?.cycle as 'mensal' | 'anual') ??
          (subscription.metadata?.ciclo as 'mensal' | 'anual') ??
          'mensal';
        if (planId && planId === 'pro') {
          if (['active', 'trialing'].includes(subscription.status)) {
            const planObj = buildPlanFromSubscription(
              subscription,
              planId,
              cycle,
            );
            await this.userModel.updateOne(
              { stripeSubscriptionId: subscription.id },
              { plano: planObj },
            );
          } else {
            await this.removePlanBySubscriptionId(subscription.id);
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.parent?.subscription_details?.subscription;
        if (subId) {
          const sub =
            typeof subId === 'string'
              ? await stripe.subscriptions.retrieve(subId)
              : subId;
          if (
            ['past_due', 'unpaid', 'canceled', 'incomplete_expired'].includes(
              sub.status,
            )
          ) {
            await this.removePlanBySubscriptionId(sub.id);
          }
        }
        break;
      }
    }
  }

  private async removePlanBySubscriptionId(subscriptionId: string) {
    await this.userModel.updateOne(
      { stripeSubscriptionId: subscriptionId },
      { $unset: { plano: 1, stripeSubscriptionId: 1 } },
    );
  }
}
