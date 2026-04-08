import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: 'desconhecida' })
  origemCaptura: string;

  @Prop({ default: false })
  convertidoEmUsuario: boolean;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ email: 1 }, { unique: true });

export type LeadDocument = HydratedDocument<Lead>;
