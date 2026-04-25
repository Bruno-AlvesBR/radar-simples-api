import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateArticleReferenceDto {
  @IsString()
  label: string;

  @IsString()
  url: string;
}

class CreateArticleSectionDto {
  @IsEnum(['h2', 'p', 'ul', 'ol', 'ref'])
  type: 'h2' | 'p' | 'ul' | 'ol' | 'ref';

  @IsString({ each: false })
  @IsOptional()
  contentAsText?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contentAsList?: string[];
}

export class CreateArticleDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  focusKeyword: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsArray()
  @IsString({ each: true })
  summaryParagraphs: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleSectionDto)
  contentSections: CreateArticleSectionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleReferenceDto)
  references: CreateArticleReferenceDto[];

  @IsOptional()
  @IsEnum(['draft', 'scheduled', 'published'])
  status?: 'draft' | 'scheduled' | 'published';

  @IsOptional()
  @IsDateString()
  scheduledPublishDate?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  seoScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wordCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readingTimeMinutes?: number;

  @IsOptional()
  generatedByArtificialIntelligence?: boolean;

  @IsOptional()
  @IsString()
  sourceKeywordId?: string;
}
