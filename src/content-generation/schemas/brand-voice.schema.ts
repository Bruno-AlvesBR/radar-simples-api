import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BrandVoiceDocument = HydratedDocument<BrandVoice>;

@Schema({ timestamps: true })
export class BrandVoice {
  @Prop({ required: true, unique: true, default: 'default' })
  profileIdentifier: string;

  @Prop({ required: true, default: 'profissional-acessivel' })
  toneOfVoice: string;

  @Prop({ required: true, default: 'PJs e microempresas do Simples Nacional' })
  targetAudience: string;

  @Prop({ type: [String], default: [] })
  preferredTerms: string[];

  @Prop({ type: [String], default: [] })
  forbiddenTerms: string[];

  @Prop({ required: true, default: 'informativo e direto' })
  writingStyle: string;
}

export const BrandVoiceSchema = SchemaFactory.createForClass(BrandVoice);
