import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SeoMetricDocument = HydratedDocument<SeoMetric>;

@Schema({ timestamps: true })
export class SeoMetric {
  @Prop({ required: true, index: true })
  pageUrl: string;

  @Prop({ required: true, index: true })
  keyword: string;

  @Prop({ required: true, default: 0 })
  clicks: number;

  @Prop({ required: true, default: 0 })
  impressions: number;

  @Prop({ required: true, default: 0 })
  ctr: number;

  @Prop({ required: true, default: 0 })
  position: number;

  @Prop({ required: true })
  metricDate: string;
}

export const SeoMetricSchema = SchemaFactory.createForClass(SeoMetric);
