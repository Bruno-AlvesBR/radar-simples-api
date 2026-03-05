import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Simulacao {
  @Prop()
  userId: string;

  @Prop()
  faturamentoMensal: number;

  @Prop()
  folhaPagamento: number;

  @Prop()
  proLabore: number;

  @Prop()
  rbt12: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  resultado: Record<string, unknown>;
}

export const SimulacaoSchema = SchemaFactory.createForClass(Simulacao);
export type SimulacaoDocument = HydratedDocument<Simulacao>;
