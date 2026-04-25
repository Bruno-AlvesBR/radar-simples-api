import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import {
    ReferralCode,
    ReferralCodeSchema,
} from './schemas/referral-code.schema';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Referral.name, schema: ReferralSchema },
            { name: ReferralCode.name, schema: ReferralCodeSchema },
        ]),
        forwardRef(() => AuthModule),
    ],
    controllers: [ReferralController],
    providers: [ReferralService],
    exports: [ReferralService],
})
export class ReferralModule {}
