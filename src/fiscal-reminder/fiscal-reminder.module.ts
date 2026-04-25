import { Module } from '@nestjs/common';
import { FiscalReminderController } from './fiscal-reminder.controller';
import { FiscalReminderService } from './fiscal-reminder.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [FiscalReminderController],
  providers: [FiscalReminderService],
})
export class FiscalReminderModule {}
