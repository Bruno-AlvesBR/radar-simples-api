import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

@Injectable()
export class AuthCookieService {
  private readonly authenticationCookieName =
    'radar-do-simples-authentication-token';

  constructor(private readonly configService: ConfigService) {}

  setAuthenticationCookie(response: Response, authenticationToken: string) {
    response.cookie(
      this.authenticationCookieName,
      authenticationToken,
      this.getAuthenticationCookieOptions()
    );
  }

  clearAuthenticationCookie(response: Response) {
    response.clearCookie(
      this.authenticationCookieName,
      this.getAuthenticationCookieOptions()
    );
  }

  getAuthenticationCookieName() {
    return this.authenticationCookieName;
  }

  private getAuthenticationCookieOptions(): CookieOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      path: '/',
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }
}
