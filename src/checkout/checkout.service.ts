import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Stripe from "stripe";
import {
 PlanoAssinatura,
 User,
 UserDocument,
} from "../user/schemas/user.schema";

const PLANOS: Record<
 string,
 { nome: string; precoMensal: number; precoAnual: number }
> = {
 pro: { nome: "PRO", precoMensal: 49, precoAnual: 490 },
};

function buildPlanoFromSubscription(
 subscription: Stripe.Subscription,
 planoId: string,
 ciclo: "mensal" | "anual"
): PlanoAssinatura {
 const plano = PLANOS[planoId];
 const valor =
  ciclo === "anual" ? plano?.precoAnual ?? 0 : plano?.precoMensal ?? 0;
 const item = subscription.items?.data?.[0];
 const unitAmount = item?.price?.unit_amount ?? Math.round(valor * 100);
 const valorReal = unitAmount / 100;

 const start =
  item?.current_period_start ??
  subscription.created ??
  Math.floor(Date.now() / 1000);
 const end =
  item?.current_period_end ??
  start + (ciclo === "anual" ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60);

 return {
  titulo: plano?.nome ?? planoId,
  slug: planoId,
  valor: valorReal,
  ciclo,
  dataAdmissao: new Date(start * 1000),
  dataVencimento: new Date(end * 1000),
 };
}

@Injectable()
export class CheckoutService {
 constructor(
  private config: ConfigService,
  @InjectModel(User.name) private userModel: Model<UserDocument>
 ) {}

 async criarSessao(
  userId: string,
  userEmail: string,
  planoId: string,
  ciclo: "mensal" | "anual"
 ): Promise<{ url: string; sessionId: string }> {
  const stripeKey = this.config.get<string>("STRIPE_SECRET_KEY");
  if (!stripeKey) {
   throw new Error(
    "Pagamento não configurado. Entre em contato com o suporte."
   );
  }

  const plano = PLANOS[planoId];
  if (!plano) {
   throw new Error("Plano inválido.");
  }

  const valor = ciclo === "anual" ? plano.precoAnual : plano.precoMensal;
  const unitAmount = Math.round(valor * 100); // BRL em centavos

  const stripe = new Stripe(stripeKey);

  const successUrl =
   this.config.get("FRONTEND_URL", "http://localhost:4200") +
   "/app/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}";
  const cancelUrl =
   this.config.get("FRONTEND_URL", "http://localhost:4200") +
   "/checkout?plano=" +
   planoId +
   "&ciclo=" +
   ciclo;

  const session = await stripe.checkout.sessions.create({
   mode: "subscription",
   locale: "pt-BR",
   customer_email: userEmail,
   client_reference_id: userId,
   metadata: { planoId, ciclo },
   allow_promotion_codes: true,
   line_items: [
    {
     price_data: {
      currency: "brl",
      product_data: {
       name: plano.nome,
       description:
        ciclo === "anual"
         ? "Assinatura anual (2 meses grátis)"
         : "Assinatura mensal",
      },
      unit_amount: unitAmount,
      recurring: {
       interval: ciclo === "anual" ? "year" : "month",
      },
     },
     quantity: 1,
    },
   ],
   subscription_data: {
    trial_period_days: 7,
    metadata: { planoId, ciclo, userId },
   },
   success_url: successUrl,
   cancel_url: cancelUrl,
  });

  if (!session.url) {
   throw new Error("Erro ao criar sessão de pagamento.");
  }

  return { url: session.url, sessionId: session.id };
 }

 async confirmarSessao(
  sessionId: string,
  userId: string
 ): Promise<{
  id: string;
  email: string;
  nome: string;
  plano: unknown;
 } | null> {
  const stripeKey = this.config.get<string>("STRIPE_SECRET_KEY");
  if (!stripeKey) return null;

  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
   expand: ["subscription"],
  });

  if (session.client_reference_id !== userId) return null;
  if (session.status !== "complete") return null;

  const planoId = session.metadata?.planoId;
  const ciclo = (session.metadata?.ciclo as "mensal" | "anual") ?? "mensal";
  if (!planoId || !["essencial", "pro", "growth"].includes(planoId))
   return null;

  let planoObj: PlanoAssinatura | null = null;
  if (session.subscription) {
   const sub =
    typeof session.subscription === "object"
     ? session.subscription
     : await stripe.subscriptions.retrieve(String(session.subscription));
   planoObj = buildPlanoFromSubscription(sub, planoId, ciclo);
  }

  const subId = session.subscription
   ? typeof session.subscription === "string"
     ? session.subscription
     : (session.subscription as Stripe.Subscription).id
   : undefined;
  const custId = session.customer
   ? typeof session.customer === "string"
     ? session.customer
     : (session.customer as Stripe.Customer).id
   : undefined;

  const update: Record<string, unknown> = {
   plano: planoObj,
   stripeCustomerId: custId,
   stripeSubscriptionId: subId,
  };
  if (!planoObj) delete update.plano;

  const user = await this.userModel
   .findByIdAndUpdate(userId, update, { new: true })
   .select("-password")
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

 async verificarWebhook(
  webhookSecret: string,
  rawBody: Buffer,
  signature: string
 ): Promise<Stripe.Event> {
  const stripeKey = this.config.get<string>("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurado.");
  const stripe = new Stripe(stripeKey);
  return stripe.webhooks.constructEvent(
   rawBody,
   signature,
   webhookSecret
  ) as Stripe.Event;
 }

 async cancelarAssinatura(
  userId: string
 ): Promise<{ ok: boolean; message?: string }> {
  const stripeKey = this.config.get<string>("STRIPE_SECRET_KEY");
  if (!stripeKey) {
   return { ok: false, message: "Pagamento não configurado." };
  }

  const user = await this.userModel.findById(userId).lean();

  if (!user?.stripeSubscriptionId || !user?.plano) {
   return { ok: false, message: "Nenhuma assinatura ativa para cancelar." };
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
     "O período de teste gratuito já acabou. Entre em contato com o suporte para cancelar.",
   };
  }

  const stripe = new Stripe(stripeKey);
  await stripe.subscriptions.cancel(user.stripeSubscriptionId);

  await this.userModel.findByIdAndUpdate(userId, {
   $unset: { plano: 1, stripeSubscriptionId: 1 },
  });

  return { ok: true };
 }

 async processarEvento(event: Stripe.Event): Promise<void> {
  const stripeKey = this.config.get<string>("STRIPE_SECRET_KEY");
  if (!stripeKey) return;
  const stripe = new Stripe(stripeKey);

  switch (event.type) {
   case "checkout.session.completed": {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const planoId = session.metadata?.planoId;
    const ciclo = (session.metadata?.ciclo as "mensal" | "anual") ?? "mensal";
    if (userId && planoId && planoId === "pro") {
     let planoObj: PlanoAssinatura | null = null;
     if (session.subscription) {
      const subId =
       typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as Stripe.Subscription).id;
      const sub = await stripe.subscriptions.retrieve(subId);
      planoObj = buildPlanoFromSubscription(sub, planoId, ciclo);
     }
     const subId = session.subscription
      ? typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as Stripe.Subscription).id
      : undefined;
     const custId = session.customer
      ? typeof session.customer === "string"
        ? session.customer
        : (session.customer as Stripe.Customer).id
      : undefined;
     const update: Record<string, unknown> = {
      plano: planoObj,
      stripeCustomerId: custId,
      stripeSubscriptionId: subId,
     };
     if (!planoObj) delete update.plano;
     await this.userModel.findByIdAndUpdate(userId, update);
    }
    break;
   }
   case "customer.subscription.deleted": {
    const subscription = event.data.object as Stripe.Subscription;
    await this.userModel.updateOne(
     { stripeSubscriptionId: subscription.id },
     { $unset: { plano: 1, stripeSubscriptionId: 1 } }
    );
    break;
   }
   case "customer.subscription.updated": {
    const subscription = event.data.object as Stripe.Subscription;
    const planoId = subscription.metadata?.planoId;
    const ciclo =
     (subscription.metadata?.ciclo as "mensal" | "anual") ?? "mensal";
    if (planoId && planoId === "pro") {
     if (["active", "trialing"].includes(subscription.status)) {
      const planoObj = buildPlanoFromSubscription(subscription, planoId, ciclo);
      await this.userModel.updateOne(
       { stripeSubscriptionId: subscription.id },
       { plano: planoObj }
      );
     } else if (
      ["canceled", "unpaid", "past_due"].includes(subscription.status)
     ) {
      await this.userModel.updateOne(
       { stripeSubscriptionId: subscription.id },
       { $unset: { plano: 1, stripeSubscriptionId: 1 } }
      );
     }
    }
    break;
   }
  }
 }
}
