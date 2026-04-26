import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReferralService } from './referral.service';

@Controller('referral')
@UseGuards(JwtAuthGuard)
export class ReferralController {
    constructor(private readonly referralService: ReferralService) {}

    @Get('code')
    async getReferralCode(@CurrentUser() user: { sub: string }) {
        const referralCode = await this.referralService.getOrCreateReferralCodeForUser(
            user.sub
        );
        return { referralCode };
    }

    @Get('stats')
    async getReferralStats(@CurrentUser() user: { sub: string }) {
        return this.referralService.getReferralStatsForUser(user.sub);
    }
}
