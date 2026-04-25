import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateFiscalReminderDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  diasAntecedencia?: number[];

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
