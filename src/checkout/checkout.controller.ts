import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpgradePreviewQueryDto } from './dto/upgrade-preview.query-dto';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('confirm')
  async confirmCheckout(
    @CurrentUser() user: { sub: string },
    @Query('session_id') sessionId: string
  ) {
    if (!sessionId) {
      throw new BadRequestException('session_id é obrigatório.');
    }
    const result = await this.checkoutService.confirmSession(
      sessionId,
      user.sub
    );
    if (!result) {
      throw new BadRequestException('Sessão inválida ou já processada.');
    }
    return result;
  }

  @Get('upgrade/preview')
  async previewUpgrade(
    @CurrentUser() user: { sub: string },
    @Query() query: UpgradePreviewQueryDto
  ) {
    try {
      return await this.checkoutService.previewUpgrade(
        user.sub,
        query.planId,
        query.cycle
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Erro ao preparar preview da mudança.';
      throw new BadRequestException(msg);
    }
  }

  @Post('upgrade')
  async upgradeSubscription(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpgradeSubscriptionDto
  ) {
    try {
      return await this.checkoutService.upgradeSubscription(
        user.sub,
        dto.planId,
        dto.cycle,
        dto.prorationDate
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Erro ao alterar a assinatura.';
      throw new BadRequestException(msg);
    }
  }

  @Post('upgrade/session')
  async createUpgradeCheckoutSession(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpgradeSubscriptionDto
  ) {
    try {
      return await this.checkoutService.createUpgradeCheckoutSession(
        user.sub,
        dto.planId,
        dto.cycle,
        dto.prorationDate
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Erro ao criar sessão de pagamento.';
      throw new BadRequestException(msg);
    }
  }

  @Post('pause')
  async pauseSubscription(@CurrentUser() user: { sub: string }) {
    try {
      const result = await this.checkoutService.pauseSubscription(user.sub);
      if (!result.ok) {
        throw new BadRequestException(
          result.message ?? 'Não foi possível pausar.'
        );
      }
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao pausar assinatura.';
      throw new BadRequestException(msg);
    }
  }

  @Post('cancel')
  async cancelSubscription(@CurrentUser() user: { sub: string }) {
    try {
      const result = await this.checkoutService.cancelSubscription(user.sub);
      if (!result.ok) {
        throw new BadRequestException(
          result.message ?? 'Não foi possível cancelar.'
        );
      }
      return result;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Erro ao cancelar assinatura.';
      throw new BadRequestException(msg);
    }
  }

  @Post('session')
  async createSession(
    @CurrentUser() user: { sub: string; email?: string },
    @Body() dto: CreateSessionDto
  ) {
    const userEmail = user.email || '';
    if (!userEmail) {
      throw new BadRequestException('E-mail do usuário não encontrado.');
    }

    try {
      return await this.checkoutService.createSession(
        user.sub,
        userEmail,
        dto.planId,
        dto.cycle
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Erro ao criar sessão de pagamento.';
      throw new BadRequestException(msg);
    }
  }
}
