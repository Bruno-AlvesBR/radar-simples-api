import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class InvoiceRecord {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, index: true })
  competenceMonth: string;

  @Prop()
  sourceFileName?: string;
}

export const InvoiceRecordSchema = SchemaFactory.createForClass(InvoiceRecord);
export type InvoiceRecordDocument = HydratedDocument<InvoiceRecord>;
