import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectionDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  faturamentoMensal: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  folhaPagamento: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  proLabore: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rbt12Inicial: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  crescimentoMensal?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  meses?: number;
}
