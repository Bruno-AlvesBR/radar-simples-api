import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BlogService } from '../blog/blog.service';
import { ContentGenerationService } from '../content-generation/content-generation.service';
import { KeywordResearchService } from '../keyword-research/keyword-research.service';

@Injectable()
export class SeoAutopilotService {
  constructor(
    private readonly keywordResearchService: KeywordResearchService,
    private readonly contentGenerationService: ContentGenerationService,
    private readonly blogService: BlogService
  ) {}

  @Cron('0 3 * * 1')
  async collectWeeklyKeywordResearch() {
    await this.keywordResearchService.collectKeywordOpportunities();
  }

  @Cron('0 22 * * *')
  async generateNextDayDraftArticle() {
    await this.contentGenerationService.generateDraftArticleFromBestKeyword();
  }

  @Cron('0 7 * * *')
  async publishScheduledArticles() {
    await this.blogService.publishScheduledArticles(new Date());
  }

  @Cron('0 8 * * *')
  async notifyIndexNow() {
    const indexNowKey = process.env.INDEXNOW_KEY;
    if (!indexNowKey) {
      return;
    }

    const latestArticles =
      await this.blogService.getPublishedSlugsWithLastModification();
    const latestUrls = latestArticles.slice(0, 20).map((item) => {
      return `https://radardosimples.com.br/blog/${item.slug}`;
    });

    if (latestUrls.length === 0) {
      return;
    }

    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'radardosimples.com.br',
        key: indexNowKey,
        urlList: latestUrls,
      }),
    }).catch(() => undefined);
  }
}
