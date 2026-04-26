import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: 'desconhecida' })
  origemCaptura: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;

  @Prop({ default: false })
  convertidoEmUsuario: boolean;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ email: 1 }, { unique: true });

export type LeadDocument = HydratedDocument<Lead>;
