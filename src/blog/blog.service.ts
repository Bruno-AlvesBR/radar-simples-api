import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArticleDto } from './dto/create-article.dto';
import {
  Article,
  ArticleDocument,
  ArticleSection,
} from './schemas/article.schema';

interface ListArticlesInput {
  page: number;
  pageSize: number;
  search?: string;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<ArticleDocument>
  ) {}

  async listPublishedArticles(input: ListArticlesInput) {
    const safePage = Math.max(1, input.page);
    const safePageSize = Math.min(50, Math.max(1, input.pageSize));
    const skip = (safePage - 1) * safePageSize;

    const searchFilter = input.search?.trim()
      ? {
          $or: [
            { title: { $regex: input.search.trim(), $options: 'i' } },
            { description: { $regex: input.search.trim(), $options: 'i' } },
            {
              keywords: {
                $elemMatch: { $regex: input.search.trim(), $options: 'i' },
              },
            },
          ],
        }
      : {};

    const filter = { status: 'published', ...searchFilter };
    const [items, totalItems] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .lean(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / safePageSize) || 1,
      items,
    };
  }

  async getPublishedArticleBySlug(slug: string) {
    const article = await this.articleModel
      .findOne({ slug, status: 'published' })
      .lean();
    if (!article) {
      throw new NotFoundException('Artigo não encontrado');
    }
    return article;
  }

  async findArticleBySlug(slug: string) {
    return this.articleModel.findOne({ slug }).lean();
  }

  async createArticle(payload: CreateArticleDto) {
    const contentSections: ArticleSection[] = payload.contentSections.map(
      (section) => ({
        type: section.type,
        content: section.contentAsList ?? section.contentAsText ?? '',
      })
    );
    const status = this.resolveCreatedArticleStatus(payload.status);
    const scheduledPublishDate =
      status === 'scheduled'
        ? payload.scheduledPublishDate
          ? new Date(payload.scheduledPublishDate)
          : new Date()
        : payload.scheduledPublishDate
        ? new Date(payload.scheduledPublishDate)
        : undefined;

    const article = await this.articleModel.create({
      slug: payload.slug,
      title: payload.title,
      description: payload.description,
      focusKeyword: payload.focusKeyword,
      keywords: payload.keywords,
      summaryParagraphs: payload.summaryParagraphs,
      contentSections,
      references: payload.references,
      status,
      scheduledPublishDate,
      publishedAt: payload.publishedAt
        ? new Date(payload.publishedAt)
        : undefined,
      seoScore: payload.seoScore ?? 0,
      wordCount: payload.wordCount ?? 0,
      readingTimeMinutes: payload.readingTimeMinutes ?? 0,
      generatedByArtificialIntelligence:
        payload.generatedByArtificialIntelligence ?? false,
      sourceKeywordId: payload.sourceKeywordId,
    });

    return article.toObject();
  }

  async publishScheduledArticles(referenceDate: Date) {
    const updated = await this.articleModel.updateMany(
      {
        status: 'scheduled',
        scheduledPublishDate: { $lte: referenceDate },
      },
      {
        $set: {
          status: 'published',
          publishedAt: referenceDate,
        },
      }
    );

    return { publishedCount: updated.modifiedCount };
  }

  async getPublishedSlugsWithLastModification() {
    return this.articleModel
      .find(
        { status: 'published' },
        {
          slug: 1,
          updatedAt: 1,
          publishedAt: 1,
          _id: 0,
        }
      )
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean<Array<{ slug: string; updatedAt?: Date; publishedAt?: Date }>>();
  }

  private resolveCreatedArticleStatus(
    requestedStatus?: CreateArticleDto['status']
  ) {
    if (!requestedStatus || requestedStatus === 'draft') {
      return 'scheduled';
    }

    return requestedStatus;
  }
}
