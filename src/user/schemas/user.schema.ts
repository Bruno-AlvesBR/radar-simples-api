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
}

export const PlanoAssinaturaSchema = SchemaFactory.createForClass(PlanoAssinatura);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  nome: string;

  @Prop({ type: EmpresaSchema })
  empresa: Empresa;

  @Prop({ type: PlanoAssinaturaSchema })
  plano?: PlanoAssinatura;

  @Prop()
  stripeCustomerId?: string;

  @Prop()
  stripeSubscriptionId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
