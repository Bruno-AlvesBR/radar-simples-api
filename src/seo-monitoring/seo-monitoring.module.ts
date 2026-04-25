import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoMonitoringController } from './seo-monitoring.controller';
import { SeoMonitoringService } from './seo-monitoring.service';
import { SeoMetric, SeoMetricSchema } from './schemas/seo-metric.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeoMetric.name, schema: SeoMetricSchema },
    ]),
  ],
  controllers: [SeoMonitoringController],
  providers: [SeoMonitoringService],
})
export class SeoMonitoringModule {}
