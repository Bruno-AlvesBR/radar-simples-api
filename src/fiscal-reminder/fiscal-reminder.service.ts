import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

export interface FiscalObligationSummaryItem {
  kind: string;
  name: string;
  dueDate: string;
  daysRemaining: number;
}

export interface FiscalReminderSummary {
  accessAllowed: boolean;
  planSlug: string | null;
  diasAntecedenciaPermitidos: number[];
  diasAntecedenciaSelecionados: number[];
  obrigacoesProximas: FiscalObligationSummaryItem[];
}

@Injectable()
export class FiscalReminderService {
  constructor(private readonly userService: UserService) {}

  async getSummary(userId: string): Promise<FiscalReminderSummary> {
    const user = await this.userService.findById(userId);
    const planSlug = user?.plano?.slug ?? null;
    const accessAllowed = planSlug !== null;
    const diasAntecedenciaPermitidos = this.resolveAllowedDays(planSlug);
    const selectedDays = user?.fiscalReminderPreferences?.diasAntecedencia
      ?.length
      ? user.fiscalReminderPreferences.diasAntecedencia
      : diasAntecedenciaPermitidos.slice(0, 3);

    return {
      accessAllowed,
      planSlug,
      diasAntecedenciaPermitidos,
      diasAntecedenciaSelecionados: selectedDays,
      obrigacoesProximas: this.buildUpcomingObligations(selectedDays),
    };
  }

  async updateSummary(
    userId: string,
    payload: {
      diasAntecedencia?: number[];
      ativo?: boolean;
    }
  ): Promise<FiscalReminderSummary> {
    const user = await this.userService.atualizarPreferenciasLembretesFiscais(
      userId,
      payload
    );
    const planSlug = user?.plano?.slug ?? null;
    const accessAllowed = planSlug !== null;
    const diasAntecedenciaPermitidos = this.resolveAllowedDays(planSlug);
    const selectedDays = user?.fiscalReminderPreferences?.diasAntecedencia
      ?.length
      ? user.fiscalReminderPreferences.diasAntecedencia
      : diasAntecedenciaPermitidos.slice(0, 3);

    return {
      accessAllowed,
      planSlug,
      diasAntecedenciaPermitidos,
      diasAntecedenciaSelecionados: selectedDays,
      obrigacoesProximas: this.buildUpcomingObligations(selectedDays),
    };
  }

  private resolveAllowedDays(planSlug: string | null) {
    if (planSlug === 'pro') {
      return [1, 3, 5, 7, 15, 20, 30];
    }
    return [3, 7, 15];
  }

  private buildUpcomingObligations(daysAhead: number[]) {
    const referenceDate = new Date();
    const month = referenceDate.getMonth();
    const year = referenceDate.getFullYear();
    const items = [
      { kind: 'das', name: 'Pagamento do DAS', dueDay: 20 },
      { kind: 'fator-r', name: 'Revisão do Fator R', dueDay: 28 },
      { kind: 'folha', name: 'Fechamento da folha', dueDay: 5 },
    ];

    return items
      .map((item) => {
        const dueDate = new Date(year, month, item.dueDay);
        if (dueDate < referenceDate) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        const daysRemaining = Math.max(
          0,
          Math.ceil(
            (dueDate.getTime() - referenceDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        return {
          ...item,
          dueDate: dueDate.toISOString(),
          daysRemaining,
        };
      })
      .filter((item) => daysAhead.some((day) => item.daysRemaining <= day))
      .sort(
        (leftItem, rightItem) =>
          leftItem.daysRemaining - rightItem.daysRemaining
      )
      .slice(0, 5);
  }
}
