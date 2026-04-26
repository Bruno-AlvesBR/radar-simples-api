import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('monthly')
    getMonthlyReport(
        @CurrentUser() user: { sub: string },
        @Query('year') year?: string,
        @Query('month') month?: string
    ) {
        return this.reportsService.getMonthlyReport(
            user.sub,
            year ? Number(year) : undefined,
            month ? Number(month) : undefined
        );
    }
}

