import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CnpjModule } from './cnpj/cnpj.module';
import { SimulateModule } from './simulate/simulate.module';
import { SupportModule } from './support/support.module';
import { UserModule } from './user/user.module';
import { StatsModule } from './stats/stats.module';
import { LeadsModule } from './leads/leads.module';
import { BlogModule } from './blog/blog.module';
import { KeywordResearchModule } from './keyword-research/keyword-research.module';
import { ContentGenerationModule } from './content-generation/content-generation.module';
import { SeoAutopilotModule } from './seo-autopilot/seo-autopilot.module';
import { SeoMonitoringModule } from './seo-monitoring/seo-monitoring.module';
import { FiscalReminderModule } from './fiscal-reminder/fiscal-reminder.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/radar-do-simples'
    ),
    AuthModule,
    CheckoutModule,
    CnpjModule,
    UserModule,
    SimulateModule,
    SupportModule,
    StatsModule,
    LeadsModule,
    BlogModule,
    KeywordResearchModule,
    ContentGenerationModule,
    SeoAutopilotModule,
    SeoMonitoringModule,
    FiscalReminderModule,
  ],
})
export class AppModule {}
