import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@CurrentUser() user: { sub: string }) {
    return this.userService.findById(user.sub);
  }

  @Put('empresa')
  salvarEmpresa(
    @CurrentUser() user: { sub: string },
    @Body() empresa: Record<string, unknown>,
  ) {
    return this.userService.salvarEmpresa(user.sub, empresa);
  }

  @Put('plano')
  atualizarPlano(
    @CurrentUser() user: { sub: string },
    @Body() body: { plano: 'pro' | null },
  ) {
    return this.userService.atualizarPlano(user.sub, body.plano);
  }
}
