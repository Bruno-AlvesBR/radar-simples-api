import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface GoogleAuthStatePayload {
  returnUrl: string;
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ query: Record<string, unknown> }>();
    const rawReturnUrl = request.query.returnUrl;
    const returnUrl =
      typeof rawReturnUrl === 'string' && rawReturnUrl.startsWith('/')
        ? rawReturnUrl
        : '/app/dashboard';
    const statePayload: GoogleAuthStatePayload = { returnUrl };

    return {
      scope: ['email', 'profile'],
      state: Buffer.from(JSON.stringify(statePayload)).toString('base64url'),
    };
  }
}
