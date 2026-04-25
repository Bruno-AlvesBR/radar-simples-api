import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { FiscalReminderController } from './fiscal-reminder.controller';
import {
  FiscalReminder,
  FiscalReminderSchema,
} from './schemas/fiscal-reminder.schema';
import { FiscalReminderService } from './fiscal-reminder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FiscalReminder.name,
        schema: FiscalReminderSchema,
      },
    ]),
    forwardRef(() => UserModule),
    EmailModule,
  ],
  controllers: [FiscalReminderController],
  providers: [FiscalReminderService],
  exports: [FiscalReminderService],
})
export class FiscalReminderModule {}
