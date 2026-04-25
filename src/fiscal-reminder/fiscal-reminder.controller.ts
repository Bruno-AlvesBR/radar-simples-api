import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FiscalReminderService } from './fiscal-reminder.service';
import { UpdateFiscalReminderDto } from './dto/update-fiscal-reminder.dto';

@Controller('fiscal-reminders')
@UseGuards(JwtAuthGuard)
export class FiscalReminderController {
  constructor(private readonly fiscalReminderService: FiscalReminderService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: { sub: string }) {
    return this.fiscalReminderService.getSummary(user.sub);
  }

  @Put('summary')
  updateSummary(
    @CurrentUser() user: { sub: string },
    @Body() body: UpdateFiscalReminderDto
  ) {
    return this.fiscalReminderService.updateSummary(user.sub, body);
  }
}
