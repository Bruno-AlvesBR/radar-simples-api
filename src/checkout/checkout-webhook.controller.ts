import { BadRequestException, Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { CheckoutService } from './checkout.service';

/**
 * Webhook do Stripe — chamado pelo Stripe quando eventos ocorrem.
 * NÃO usa JwtAuthGuard. A autenticação é feita via assinatura do Stripe.
 */
@Controller('checkout')
export class CheckoutWebhookController {
  constructor(
    private config: ConfigService,
    private checkoutService: CheckoutService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook não configurado.');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Corpo da requisição inválido.');
    }

    const event = await this.checkoutService.verificarWebhook(webhookSecret, rawBody, signature);
    await this.checkoutService.processarEvento(event);
    return { received: true };
  }
}
