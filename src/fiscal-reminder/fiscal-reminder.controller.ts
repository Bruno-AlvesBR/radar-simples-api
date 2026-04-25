import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateFiscalReminderDto } from './dto/update-fiscal-reminder.dto';
import { FiscalReminderService } from './fiscal-reminder.service';

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
        @Body() updateFiscalReminderData: UpdateFiscalReminderDto
    ) {
        return this.fiscalReminderService.updateSummary(
            user.sub,
            updateFiscalReminderData
        );
    }
}
