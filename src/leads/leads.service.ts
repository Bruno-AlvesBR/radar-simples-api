import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>
  ) {}

  async capturar(dto: CreateLeadDto): Promise<{ registrado: boolean }> {
    try {
      await this.leadModel.create({
        email: dto.email.trim().toLowerCase(),
        origemCaptura: dto.origemCaptura?.trim() || 'landing',
      });
      return { registrado: true };
    } catch (erro: unknown) {
      const codigo =
        erro && typeof erro === 'object' && 'code' in erro
          ? (erro as { code: number }).code
          : 0;
      if (codigo === 11000) {
        return { registrado: true };
      }
      throw erro;
    }
  }
}
