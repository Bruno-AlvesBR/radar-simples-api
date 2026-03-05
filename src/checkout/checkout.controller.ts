import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('confirm')
  async confirmarCheckout(
    @CurrentUser() user: { sub: string },
    @Query('session_id') sessionId: string,
  ) {
    if (!sessionId) {
      throw new BadRequestException('session_id é obrigatório.');
    }
    const result = await this.checkoutService.confirmarSessao(sessionId, user.sub);
    if (!result) {
      throw new BadRequestException('Sessão inválida ou já processada.');
    }
    return result;
  }

  @Post('session')
  async criarSessao(
    @CurrentUser() user: { sub: string; email?: string },
    @Body() dto: CreateSessionDto,
  ) {

    const userEmail = user.email || '';
    if (!userEmail) {
      throw new BadRequestException('E-mail do usuário não encontrado.');
    }

    try {
      return await this.checkoutService.criarSessao(user.sub, userEmail, dto.planoId, dto.ciclo);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar sessão de pagamento.';
      throw new BadRequestException(msg);
    }
  }
}
