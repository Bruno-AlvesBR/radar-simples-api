import * as bcrypt from 'bcrypt';
import {
    Inject,
    Injectable,
    UnauthorizedException,
    forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from '../email/email.service';
import { ReferralService } from '../referral/referral.service';
import { getPlanDefinition, normalizePlanSlug } from '../plans/plan.constants';
import { User, UserDocument } from '../user/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleProfile } from './google.strategy';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly configurationService: ConfigService,
        @Inject(forwardRef(() => ReferralService))
        private readonly referralService: ReferralService
    ) {}

    async register(registerData: RegisterDto) {
        const normalizedEmail = this.normalizeEmail(registerData.email);
        const existingUser = await this.userModel.findOne({ email: normalizedEmail });

        if (existingUser) {
            throw new UnauthorizedException('Email já cadastrado');
        }

        const passwordHash = await bcrypt.hash(registerData.password, 10);
        const createdUser = await this.userModel.create({
            email: normalizedEmail,
            password: passwordHash,
            nome: registerData.nome,
            authenticationProvider: 'local',
        });

        void this.sendWelcomeEmail(createdUser.email, createdUser.nome);
        void this.referralService.recordReferralFromRegistration(
            registerData.referralCode,
            createdUser._id.toString(),
            createdUser.email
        );

        return this.gerarToken(createdUser);
    }

    async login(loginData: LoginDto) {
        const normalizedEmail = this.normalizeEmail(loginData.email);
        const existingUser = await this.userModel.findOne({ email: normalizedEmail });

        if (!existingUser || !(await bcrypt.compare(loginData.password, existingUser.password))) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        return this.gerarToken(existingUser);
    }

    async loginOrRegisterWithGoogle(profile: GoogleProfile) {
        if (!profile.emailVerified) {
            throw new UnauthorizedException('Google email is not verified');
        }

        const normalizedEmail = this.normalizeEmail(profile.email);
        const userWithGoogleAccount = await this.userModel.findOne({
            googleId: profile.googleId,
        });

        if (userWithGoogleAccount) {
            return this.gerarToken(userWithGoogleAccount);
        }

        const userWithSameEmail = await this.userModel.findOne({
            email: normalizedEmail,
        });

        if (userWithSameEmail) {
            userWithSameEmail.googleId = profile.googleId;
            userWithSameEmail.emailVerified = true;
            userWithSameEmail.avatarUrl =
                profile.avatarUrl ?? userWithSameEmail.avatarUrl;

            if (!userWithSameEmail.nome && profile.nome) {
                userWithSameEmail.nome = profile.nome;
            }

            await userWithSameEmail.save();

            return this.gerarToken(userWithSameEmail);
        }

        const generatedPassword = await bcrypt.hash(
            this.generateRandomPassword(),
            10
        );

        const createdUser = await this.userModel.create({
            email: normalizedEmail,
            password: generatedPassword,
            nome: profile.nome,
            googleId: profile.googleId,
            emailVerified: true,
            avatarUrl: profile.avatarUrl,
            authenticationProvider: 'google',
        });

        return this.gerarToken(createdUser);
    }

    private gerarToken(user: UserDocument) {
        const payload = { sub: user._id.toString(), email: user.email };
        const normalizedPlanSlug = normalizePlanSlug(user.plano?.slug);
        const plano = user.plano
            ? {
                  titulo:
                      getPlanDefinition(normalizedPlanSlug)?.name ??
                      user.plano.titulo,
                  slug: normalizedPlanSlug ?? user.plano.slug,
                  valor: user.plano.valor,
                  ciclo: user.plano.ciclo,
                  dataAdmissao: user.plano.dataAdmissao,
                  dataVencimento: user.plano.dataVencimento,
                  ...(user.plano.pausadoAte
                      ? { pausadoAte: user.plano.pausadoAte }
                      : {}),
                  ...(user.plano.subscriptionFreeTrialPhaseEndsAt
                      ? {
                            subscriptionFreeTrialPhaseEndsAt:
                                user.plano.subscriptionFreeTrialPhaseEndsAt,
                        }
                      : {}),
              }
            : null;

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
                nome: user.nome,
                plano,
                automaticSubscriptionRenewalCancelledAtPeriodEnd: Boolean(
                    user.automaticSubscriptionRenewalCancelledAtPeriodEnd
                ),
                subscriptionFreeTrialPreviouslyUsed: Boolean(
                    user.subscriptionFreeTrialPreviouslyUsed
                ),
            },
        };
    }

    private normalizeEmail(rawEmail: string) {
        return rawEmail.trim().toLowerCase();
    }

    private generateRandomPassword() {
        return `${Date.now()}-${Math.random()}-${Math.random()}`;
    }

    private async sendWelcomeEmail(
        recipientEmail: string,
        recipientName?: string
    ) {
        try {
            await this.emailService.sendUserRegistrationWelcome({
                recipientEmail,
                recipientName,
                dashboardUrl: `${this.getFrontendUrl()}/app/dashboard`,
            });
        } catch {
            return;
        }
    }

    private getFrontendUrl() {
        return (
            this.configurationService.get<string>(
                'FRONTEND_URL',
                'http://localhost:4200'
            ) ?? 'http://localhost:4200'
        );
    }
}
