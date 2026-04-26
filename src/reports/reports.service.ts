import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Simulacao,
  SimulacaoDocument,
} from '../simulate/schemas/simulacao.schema';
import { isPlanAtLeast } from '../plans/plan.constants';
import { UserService } from '../user/user.service';

export interface MonthlyReportSimulationItem {
  id: string;
  createdAt: Date;
  faturamentoMensal: number;
  folhaPagamento: number;
  proLabore: number;
  rbt12: number;
  resultado: unknown;
}

export interface MonthlyReportSummary {
  period: {
    year: number;
    month: number;
    label: string;
  };
  user: {
    id: string;
    email: string;
    nome: string;
    empresa: unknown;
    plano: unknown;
  } | null;
  totalSimulations: number;
  simulations: MonthlyReportSimulationItem[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Simulacao.name)
    private readonly simulacaoModel: Model<SimulacaoDocument>,
    private readonly userService: UserService
  ) {}

  async getMonthlyReport(userId: string, year?: number, month?: number) {
    const user = await this.userService.findById(userId);
    const planSlug = user?.plano?.slug;
    if (!isPlanAtLeast(planSlug, 'controle')) {
      throw new ForbiddenException(
        'Relatório mensal disponível no Controle. Assine em Planos.'
      );
    }

    const referenceDate = new Date();
    const selectedYear = year ?? referenceDate.getFullYear();
    const selectedMonth = month ?? referenceDate.getMonth() + 1;
    const periodStart = new Date(selectedYear, selectedMonth - 1, 1);
    const periodEnd = new Date(selectedYear, selectedMonth, 1);
    const simulations = await this.simulacaoModel
      .find({
        userId,
        createdAt: {
          $gte: periodStart,
          $lt: periodEnd,
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return {
      period: {
        year: selectedYear,
        month: selectedMonth,
        label: `${String(selectedMonth).padStart(2, '0')}/${selectedYear}`,
      },
      user,
      totalSimulations: simulations.length,
      simulations: simulations.map((simulation) => ({
        id: String(simulation._id),
        createdAt: (simulation as unknown as { createdAt: Date }).createdAt,
        faturamentoMensal: simulation.faturamentoMensal,
        folhaPagamento: simulation.folhaPagamento,
        proLabore: simulation.proLabore,
        rbt12: simulation.rbt12,
        resultado: simulation.resultado,
      })),
    } as MonthlyReportSummary;
  }
}
