import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { calculateSimples } from '../engine/simples-nacional.engine';
import { SimulateDto } from './dto/simulate.dto';
import { ProjectionDto } from './dto/projection.dto';
import { CompareSimulationsDto } from './dto/compare-simulations.dto';
import { Simulacao, SimulacaoDocument } from './schemas/simulacao.schema';
import { UserService } from '../user/user.service';
import { isPlanAtLeast } from '../plans/plan.constants';

@Injectable()
export class SimulateService {
  constructor(
    @InjectModel(Simulacao.name) private simulacaoModel: Model<SimulacaoDocument>,
    private userService: UserService,
  ) {}

  simulate(dto: SimulateDto) {
    const result = calculateSimples({
      faturamentoMensal: dto.faturamentoMensal,
      folhaPagamento: dto.folhaPagamento,
      proLabore: dto.proLabore,
      rbt12: dto.rbt12,
      anexo: dto.anexo,
    });
    return result;
  }

  async simulateAndSave(dto: SimulateDto, userId?: string) {
    const result = this.simulate(dto);
    if (userId) {
      const user = await this.userService.findById(userId);
      const plano = user?.plano;
      if (!isPlanAtLeast(typeof plano === 'object' ? plano?.slug : plano, 'essencial')) {
        throw new ForbiddenException(
          'Assine um plano para salvar simulações. Acesse Planos.',
        );
      }
      await this.simulacaoModel.create({
        userId,
        ...dto,
        resultado: result,
      });
    }
    return result;
  }

  async projection(dto: ProjectionDto, userId?: string) {
    if (userId) {
      const user = await this.userService.findById(userId);
      const plano = user?.plano;
      const slug = typeof plano === 'object' ? plano?.slug : plano;
      if (!isPlanAtLeast(slug, 'essencial')) {
        throw new ForbiddenException(
          'Projeção disponível no Essencial. Assine em Planos.',
        );
      }
    }
    const meses = dto.meses || 12;
    const projecoes = [];
    let rbt12 = dto.rbt12Inicial;
    const crescimento = 1 + (dto.crescimentoMensal || 0) / 100;

    for (let i = 0; i < meses; i++) {
      const faturamento = dto.faturamentoMensal * Math.pow(crescimento, i);
      rbt12 = rbt12 * (11 / 12) + faturamento;
      const result = calculateSimples({
        faturamentoMensal: faturamento,
        folhaPagamento: dto.folhaPagamento,
        proLabore: dto.proLabore,
        rbt12: Math.max(0, rbt12),
      });
      projecoes.push({
        mes: i + 1,
        faturamento,
        rbt12,
        ...result,
      });
    }
    return projecoes;
  }

  async getHistory(userId: string) {
    const user = await this.userService.findById(userId);
    const plano = user?.plano;
    const slug = typeof plano === 'object' ? plano?.slug : plano;
    const limit = isPlanAtLeast(slug, 'essencial') ? 1000 : 0;
    return this.simulacaoModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async compare(dto: CompareSimulationsDto, userId?: string) {
    if (userId) {
      const user = await this.userService.findById(userId);
      const plano = user?.plano;
      const slug = typeof plano === 'object' ? plano?.slug : plano;
      if (!isPlanAtLeast(slug, 'automacao')) {
        throw new ForbiddenException(
          'Comparação de cenários disponível no Automação. Assine em Planos.',
        );
      }
    }

    const scenarios = dto.scenarios.map((scenario, index) => {
      const result = this.simulate(scenario);
      return {
        scenario: index + 1,
        input: scenario,
        result,
      };
    });

    const bestScenario = scenarios.reduce((best, current) => {
      if (!best) {
        return current;
      }

      return current.result.dasEstimado < best.result.dasEstimado
        ? current
        : best;
    }, scenarios[0] ?? null);

    return {
      scenarios,
      bestScenario: bestScenario ? bestScenario.scenario : null,
    };
  }
}
