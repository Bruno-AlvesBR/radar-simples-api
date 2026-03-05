import { IsNumber, IsOptional, Min } from 'class-validator';

export class SimulateDto {
  @IsNumber()
  @Min(0)
  faturamentoMensal: number;

  @IsNumber()
  @Min(0)
  folhaPagamento: number;

  @IsNumber()
  @Min(0)
  proLabore: number;

  @IsNumber()
  @Min(0)
  rbt12: number;

  @IsOptional()
  anexo?: 'III' | 'V';
}
