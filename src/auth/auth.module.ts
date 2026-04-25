import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { ReferralModule } from '../referral/referral.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        EmailModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        forwardRef(() => ReferralModule),
        PassportModule.register({ session: false }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configurationService: ConfigService) => ({
                secret:
                    configurationService.get<string>('JWT_SECRET') ||
                    'radar-do-simples-secret-dev',
                signOptions: { expiresIn: '7d' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthCookieService,
        JwtStrategy,
        GoogleStrategy,
        GoogleAuthGuard,
    ],
})
export class AuthModule {}
