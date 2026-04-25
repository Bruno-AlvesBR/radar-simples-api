import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../user/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleProfile } from './google.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const exists = await this.userModel.findOne({ email: normalizedEmail });
    if (exists) throw new UnauthorizedException('Email já cadastrado');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: normalizedEmail,
      password: hash,
      nome: dto.nome,
      authenticationProvider: 'local',
    });
    return this.gerarToken(user);
  }

  async login(dto: LoginDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.gerarToken(user);
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
    const plano = user.plano
      ? {
          titulo: user.plano.titulo,
          slug: user.plano.slug,
          valor: user.plano.valor,
          ciclo: user.plano.ciclo,
          dataAdmissao: user.plano.dataAdmissao,
          dataVencimento: user.plano.dataVencimento,
        }
      : null;
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        nome: user.nome,
        plano,
      },
    };
  }

  private normalizeEmail(rawEmail: string) {
    return rawEmail.trim().toLowerCase();
  }

  private generateRandomPassword() {
    return `${Date.now()}-${Math.random()}-${Math.random()}`;
  }
}
