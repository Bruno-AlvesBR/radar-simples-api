import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class FiscalReminder {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: [Number], default: [7] })
  diasAntecedencia: number[];

  @Prop({ default: true })
  ativo: boolean;

  @Prop({ type: Date, default: null })
  ultimoEnvioEm?: Date | null;
}

export const FiscalReminderSchema =
  SchemaFactory.createForClass(FiscalReminder);
export type FiscalReminderDocument = HydratedDocument<FiscalReminder>;
