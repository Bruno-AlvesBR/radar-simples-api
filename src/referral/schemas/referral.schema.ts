import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'referrals' })
export class Referral {
    @Prop({ required: true })
    referrerUserId: string;

    @Prop()
    referredUserId?: string;

    @Prop({ required: true })
    referredEmail: string;

    @Prop({ default: 'pending' })
    status: 'pending' | 'converted';

    @Prop({ default: false })
    rewardApplied: boolean;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
export type ReferralDocument = HydratedDocument<Referral>;
