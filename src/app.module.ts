import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CnpjModule } from './cnpj/cnpj.module';
import { ContentGenerationModule } from './content-generation/content-generation.module';
import { EngineModule } from './engine/engine.module';
import { FiscalReminderModule } from './fiscal-reminder/fiscal-reminder.module';
import { InvoiceImportModule } from './invoice-import/invoice-import.module';
import { KeywordResearchModule } from './keyword-research/keyword-research.module';
import { LeadsModule } from './leads/leads.module';
import { ReferralModule } from './referral/referral.module';
import { ReportsModule } from './reports/reports.module';
import { SeoAutopilotModule } from './seo-autopilot/seo-autopilot.module';
import { SeoMonitoringModule } from './seo-monitoring/seo-monitoring.module';
import { SimulateModule } from './simulate/simulate.module';
import { StatsModule } from './stats/stats.module';
import { SupportModule } from './support/support.module';
import { UserModule } from './user/user.module';

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
    ReportsModule,
    InvoiceImportModule,
    EngineModule,
    ReferralModule,
  ],
})
export class AppModule {}
