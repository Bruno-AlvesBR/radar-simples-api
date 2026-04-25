import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ _id: false })
export class ArticleReference {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  url: string;
}

@Schema({ _id: false })
export class ArticleSection {
  @Prop({
    required: true,
    enum: ['h2', 'p', 'ul', 'ol', 'ref'],
  })
  type: 'h2' | 'p' | 'ul' | 'ol' | 'ref';

  @Prop({ required: true, type: Object })
  content: string | string[];
}

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  focusKeyword: string;

  @Prop({ required: true, type: [String] })
  keywords: string[];

  @Prop({ required: true, type: [String] })
  summaryParagraphs: string[];

  @Prop({ required: true, type: [ArticleSection] })
  contentSections: ArticleSection[];

  @Prop({ required: true, type: [ArticleReference] })
  references: ArticleReference[];

  @Prop({
    required: true,
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft',
  })
  status: 'draft' | 'scheduled' | 'published';

  @Prop()
  scheduledPublishDate?: Date;

  @Prop()
  publishedAt?: Date;

  @Prop({ required: true, default: 0 })
  seoScore: number;

  @Prop({ required: true, default: 0 })
  wordCount: number;

  @Prop({ required: true, default: 0 })
  readingTimeMinutes: number;

  @Prop({ required: true, default: false })
  generatedByArtificialIntelligence: boolean;

  @Prop()
  sourceKeywordId?: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
