import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { Referral, ReferralDocument } from './schemas/referral.schema';
import {
  ReferralCode,
  ReferralCodeDocument,
} from './schemas/referral-code.schema';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(ReferralCode.name)
    private readonly referralCodeModel: Model<ReferralCodeDocument>,
    @InjectModel(Referral.name)
    private readonly referralModel: Model<ReferralDocument>
  ) {}

  async getOrCreateReferralCodeForUser(userId: string): Promise<string> {
    const existing = await this.referralCodeModel.findOne({ userId }).lean();
    if (existing?.code) {
      return existing.code;
    }
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidateCode = randomBytes(8)
        .toString('hex')
        .slice(0, 10)
        .toUpperCase();
      if (candidateCode.length < 8) {
        continue;
      }
      try {
        await this.referralCodeModel.create({
          userId,
          code: candidateCode,
        });
        return candidateCode;
      } catch {
        continue;
      }
    }
    throw new Error('Não foi possível gerar código de indicação.');
  }

  async getReferralStatsForUser(userId: string) {
    const [pendingCount, convertedCount] = await Promise.all([
      this.referralModel.countDocuments({
        referrerUserId: userId,
        status: 'pending',
      }),
      this.referralModel.countDocuments({
        referrerUserId: userId,
        status: 'converted',
      }),
    ]);
    return {
      pendingReferrals: pendingCount,
      convertedReferrals: convertedCount,
    };
  }

  async recordReferralFromRegistration(
    referralCode: string | undefined,
    newUserId: string,
    newUserEmail: string
  ) {
    const normalizedCode = referralCode?.trim();
    if (!normalizedCode) {
      return;
    }
    const link = await this.referralCodeModel.findOne({
      code: normalizedCode.toUpperCase(),
    });
    if (!link || link.userId === newUserId) {
      return;
    }
    const existingForReferredUser = await this.referralModel
      .findOne({ referredUserId: newUserId })
      .lean();
    if (existingForReferredUser) {
      return;
    }
    await this.referralModel.create({
      referrerUserId: link.userId,
      referredUserId: newUserId,
      referredEmail: newUserEmail.trim().toLowerCase(),
      status: 'pending',
      rewardApplied: false,
    });
  }

  async recordReferralConversionWhenReferredUserSubscribesToPlan(
    referredUserId: string
  ): Promise<void> {
    const normalizedReferredUserId = referredUserId?.trim();
    if (!normalizedReferredUserId) {
      return;
    }
    try {
      await this.referralModel.updateMany(
        {
          referredUserId: normalizedReferredUserId,
          status: 'pending',
        },
        { $set: { status: 'converted' } }
      );
    } catch {
      return;
    }
  }
}
