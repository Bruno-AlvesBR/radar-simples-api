import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Simulacao,
  SimulacaoDocument,
} from '../simulate/schemas/simulacao.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

export interface PublicStatisticsPayload {
  totalSimulacoesSalvas: number;
  totalUsuarios: number;
  cadastrosUltimas24Horas: number;
}

@Injectable()
export class StatsService {
  private cache: {
    expiresAt: number;
    payload: PublicStatisticsPayload;
  } | null = null;

  private readonly cacheDurationMilliseconds = 5 * 60 * 1000;

  constructor(
    @InjectModel(Simulacao.name)
    private readonly simulacaoModel: Model<SimulacaoDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async getPublicStatistics(): Promise<PublicStatisticsPayload> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.payload;
    }

    try {
      const desde = new Date(now - 24 * 60 * 60 * 1000);
      const [totalSimulacoesSalvas, totalUsuarios, cadastrosUltimas24Horas] =
        await Promise.all([
          this.simulacaoModel.countDocuments(),
          this.userModel.countDocuments(),
          this.userModel.countDocuments({ createdAt: { $gte: desde } }),
        ]);

      const payload: PublicStatisticsPayload = {
        totalSimulacoesSalvas,
        totalUsuarios,
        cadastrosUltimas24Horas,
      };

      this.cache = {
        expiresAt: now + this.cacheDurationMilliseconds,
        payload,
      };

      return payload;
    } catch {
      const fallback: PublicStatisticsPayload = {
        totalSimulacoesSalvas: 0,
        totalUsuarios: 0,
        cadastrosUltimas24Horas: 0,
      };
      return fallback;
    }
  }
}
