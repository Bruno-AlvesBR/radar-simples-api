import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CnpjModule } from './cnpj/cnpj.module';
import { SimulateModule } from './simulate/simulate.module';
import { SupportModule } from './support/support.module';
import { UserModule } from './user/user.module';
import { StatsModule } from './stats/stats.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
