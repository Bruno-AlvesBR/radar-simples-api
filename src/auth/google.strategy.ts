import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  nome: string;
  avatarUrl: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) {
    const verifiedEmail = profile.emails?.find(
      (emailValue) => emailValue.verified
    );
    const primaryEmail = verifiedEmail ?? profile.emails?.[0];

    if (!primaryEmail?.value) {
      throw new UnauthorizedException('Google account without email');
    }

    const normalizedEmail = primaryEmail.value.trim().toLowerCase();
    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email: normalizedEmail,
      emailVerified: primaryEmail.verified === true,
      nome: profile.displayName || normalizedEmail,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };

    done(null, googleProfile);
  }
}
