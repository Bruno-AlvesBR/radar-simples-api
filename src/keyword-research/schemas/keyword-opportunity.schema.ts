import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KeywordOpportunityDocument = HydratedDocument<KeywordOpportunity>;

@Schema({ timestamps: true })
export class KeywordOpportunity {
  @Prop({ required: true, unique: true, index: true })
  keyword: string;

  @Prop({ required: true })
  intent: 'informational' | 'commercial' | 'transactional';

  @Prop({ required: true, default: 0 })
  searchVolume: number;

  @Prop({ required: true, default: 0 })
  competitionDifficulty: number;

  @Prop({ required: true, default: 0 })
  intentScore: number;

  @Prop({ required: true, default: 0 })
  opportunityScore: number;

  @Prop({ required: true, default: false })
  alreadyUsedForArticle: boolean;
}

export const KeywordOpportunitySchema =
  SchemaFactory.createForClass(KeywordOpportunity);
