import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateFiscalReminderDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  diasAntecedencia?: number[];

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
