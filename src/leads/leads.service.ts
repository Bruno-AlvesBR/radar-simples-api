import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    private readonly configurationService: ConfigService
  ) {}

  async capturar(dto: CreateLeadDto): Promise<{ registrado: boolean }> {
    try {
      await this.leadModel.create({
        email: dto.email.trim().toLowerCase(),
        origemCaptura: dto.origemCaptura?.trim() || 'landing',
        metadata: dto.metadata,
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

  async getLeadCaptureStatistics(adminApiKey: string | undefined) {
    const expectedKey = this.configurationService.get<string>('RADAR_ADMIN_API_KEY');
    if (!expectedKey || adminApiKey !== expectedKey) {
      throw new UnauthorizedException('Credenciais administrativas inválidas.');
    }
    const aggregation = await this.leadModel.aggregate<{
      _id: string;
      total: number;
    }>([
      {
        $project: {
          source: {
            $ifNull: ['$metadata.source', '$origemCaptura'],
          },
        },
      },
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    return {
      totalsBySource: aggregation.map((row) => ({
        source: row._id,
        total: row.total,
      })),
    };
  }
}
