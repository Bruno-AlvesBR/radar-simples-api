import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { GoogleProfile } from './google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() request: Request & { user: GoogleProfile },
    @Res() response: Response,
    @Query('state') state?: string
  ) {
    const authenticationResponse =
      await this.authService.loginOrRegisterWithGoogle(request.user);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const callbackUrl = new URL('/auth/callback', frontendUrl);
    const decodedState = this.decodeOAuthState(state);

    callbackUrl.searchParams.set(
      'access_token',
      authenticationResponse.access_token
    );
    callbackUrl.searchParams.set(
      'user',
      Buffer.from(JSON.stringify(authenticationResponse.user)).toString(
        'base64url'
      )
    );
    callbackUrl.searchParams.set('returnUrl', decodedState.returnUrl);

    return response.redirect(callbackUrl.toString());
  }

  private decodeOAuthState(rawState?: string) {
    if (!rawState) {
      return { returnUrl: '/app/dashboard' };
    }

    try {
      const parsedState = JSON.parse(
        Buffer.from(rawState, 'base64url').toString('utf8')
      ) as { returnUrl?: string };
      if (parsedState.returnUrl && parsedState.returnUrl.startsWith('/')) {
        return { returnUrl: parsedState.returnUrl };
      }
      return { returnUrl: '/app/dashboard' };
    } catch {
      throw new UnauthorizedException('Invalid oauth state');
    }
  }
}
