import { Transform } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

export class UpgradePreviewQueryDto {
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
}
