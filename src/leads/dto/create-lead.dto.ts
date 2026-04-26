import { IsEmail, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeadDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  origemCaptura?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
