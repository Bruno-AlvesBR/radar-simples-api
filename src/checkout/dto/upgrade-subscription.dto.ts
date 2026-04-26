import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpgradeSubscriptionDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value
  )
  @IsIn(['essencial', 'controle', 'automacao'])
  planId: string;

  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value
  )
  @IsIn(['mensal', 'anual'])
  cycle: 'mensal' | 'anual';

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? value : Number(value)))
  @IsNumber()
  prorationDate?: number;
}
