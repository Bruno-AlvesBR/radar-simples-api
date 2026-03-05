import { Transform } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsIn(['essencial', 'pro', 'growth'])
  planoId: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsIn(['mensal', 'anual'])
  ciclo: 'mensal' | 'anual';
}
