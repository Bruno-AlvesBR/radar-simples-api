import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class Empresa {
  @Prop()
  cnpj: string;

  @Prop()
  razaoSocial: string;

  @Prop()
  nomeFantasia: string;

  @Prop()
  situacao: string;

  @Prop()
  dataAbertura: string;

  @Prop()
  porte: string;

  @Prop()
  atividadePrincipal: string;

  @Prop()
  simples: boolean;

  @Prop()
  dataOpcaoSimples: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  dadosCompletos: Record<string, unknown>;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);

@Schema({ _id: false })
export class PlanoAssinatura {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  valor: number;

  @Prop({ required: true })
  ciclo: 'mensal' | 'anual';

  @Prop({ required: true })
  dataAdmissao: Date;

  @Prop({ required: true })
  dataVencimento: Date;

  @Prop()
  pausadoAte?: Date;

  @Prop()
  subscriptionFreeTrialPhaseEndsAt?: Date;
}

export const PlanoAssinaturaSchema =
  SchemaFactory.createForClass(PlanoAssinatura);

@Schema({ _id: false })
export class FiscalReminderPreferences {
    @Prop({ type: [Number], default: [3, 7, 15] })
    diasAntecedencia: number[];

    @Prop({ default: false })
    ativo: boolean;
}

export const FiscalReminderPreferencesSchema = SchemaFactory.createForClass(
    FiscalReminderPreferences
);

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    nome: string;

    @Prop({
        enum: ['local', 'google'],
        default: 'local',
    })
    authenticationProvider: 'local' | 'google';

    @Prop({ unique: true, sparse: true })
    googleId?: string;

    @Prop({ default: false })
    emailVerified?: boolean;

    @Prop()
    avatarUrl?: string;

    @Prop({ type: EmpresaSchema })
    empresa: Empresa;

    @Prop({ type: PlanoAssinaturaSchema })
    plano?: PlanoAssinatura;

    @Prop()
    stripeCustomerId?: string;

    @Prop()
    stripeSubscriptionId?: string;

    @Prop({
        type: FiscalReminderPreferencesSchema,
        default: {
            diasAntecedencia: [3, 7, 15],
            ativo: false,
        },
    })
    fiscalReminderPreferences?: FiscalReminderPreferences;

    @Prop()
    automaticSubscriptionRenewalCancelledAtPeriodEnd?: boolean;

    @Prop()
    subscriptionFreeTrialPreviouslyUsed?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
