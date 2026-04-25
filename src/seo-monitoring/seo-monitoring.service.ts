import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeoMetric, SeoMetricDocument } from './schemas/seo-metric.schema';

interface UpsertSeoMetricInput {
  pageUrl: string;
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  metricDate: string;
}

@Injectable()
export class SeoMonitoringService {
  constructor(
    @InjectModel(SeoMetric.name)
    private readonly seoMetricModel: Model<SeoMetricDocument>
  ) {}

  async upsertMetrics(payload: UpsertSeoMetricInput[]) {
    await Promise.all(
      payload.map((metric) =>
        this.seoMetricModel.updateOne(
          {
            pageUrl: metric.pageUrl,
            keyword: metric.keyword,
            metricDate: metric.metricDate,
          },
          { $set: metric },
          { upsert: true }
        )
      )
    );
    return { totalUpserted: payload.length };
  }

  async listDashboardMetrics() {
    const latestMetrics = await this.seoMetricModel
      .find({})
      .sort({ metricDate: -1, impressions: -1 })
      .limit(200)
      .lean();

    const topArticlesByClicks = [...latestMetrics]
      .sort((leftMetric, rightMetric) => rightMetric.clicks - leftMetric.clicks)
      .slice(0, 10);

    const keywordBuckets = {
      top1To3: latestMetrics.filter(
        (metric) => metric.position > 0 && metric.position <= 3
      ).length,
      top4To10: latestMetrics.filter(
        (metric) => metric.position > 3 && metric.position <= 10
      ).length,
      top11To20: latestMetrics.filter(
        (metric) => metric.position > 10 && metric.position <= 20
      ).length,
      top21To50: latestMetrics.filter(
        (metric) => metric.position > 20 && metric.position <= 50
      ).length,
    };

    const opportunities = latestMetrics
      .filter((metric) => metric.position > 3 && metric.position <= 10)
      .sort(
        (leftMetric, rightMetric) =>
          rightMetric.impressions - leftMetric.impressions
      )
      .slice(0, 20);

    return {
      totalTrackedRows: latestMetrics.length,
      topArticlesByClicks,
      keywordBuckets,
      opportunities,
    };
  }
}
