import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'referral_codes' })
export class ReferralCode {
    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ required: true, unique: true })
    code: string;
}

export const ReferralCodeSchema = SchemaFactory.createForClass(ReferralCode);
export type ReferralCodeDocument = HydratedDocument<ReferralCode>;
