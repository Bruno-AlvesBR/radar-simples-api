import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { ReferralModule } from '../referral/referral.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { CheckoutController } from './checkout.controller';
import { CheckoutWebhookController } from './checkout-webhook.controller';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [
    AuthModule,
    EmailModule,
    ReferralModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [CheckoutController, CheckoutWebhookController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
