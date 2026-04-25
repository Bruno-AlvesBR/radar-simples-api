import { Body, Controller, Get, Post } from '@nestjs/common';
import { SeoMonitoringService } from './seo-monitoring.service';

@Controller('seo-monitoring')
export class SeoMonitoringController {
  constructor(private readonly seoMonitoringService: SeoMonitoringService) {}

  @Post('metrics')
  upsertMetrics(@Body() payload: any[]) {
    return this.seoMonitoringService.upsertMetrics(payload);
  }

  @Get('dashboard')
  listDashboardMetrics() {
    return this.seoMonitoringService.listDashboardMetrics();
  }
}
