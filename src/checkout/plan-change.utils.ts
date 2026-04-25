import {
  getPlanDefinition,
  getPlanFeatures,
  PlanCycle,
  PlanSlug,
  normalizePlanSlug,
} from '../plans/plan.constants';

export type PlanChangeType = 'upgrade' | 'downgrade' | 'troca_ciclo';

export interface CheckoutPlanSummary {
  titulo: string;
  slug: PlanSlug;
  ciclo: PlanCycle;
  valor: number;
  features: string[];
}

export interface UpgradePreviewResponse {
  planoAtual: CheckoutPlanSummary;
  planoNovo: CheckoutPlanSummary;
  tipoMudanca: PlanChangeType;
  statusAssinatura: 'trialing' | 'active';
  diasRestantesTrial: number | null;
  featuresGanhas: string[];
  featuresPerdidas: string[];
  valorProximaCobranca: number;
  dataProximaCobranca: string;
  creditoNaoUtilizado: number;
  valorProrateado: number;
  prorationDate: number;
  mensagemResumo: string;
}

export interface ChangePlanResult {
  id: string;
  email: string;
  nome: string;
  plano: {
    titulo: string;
    slug: string;
    valor: number;
    ciclo: PlanCycle;
    dataAdmissao: Date;
    dataVencimento: Date;
  } | null;
}

const planLevelBySlug: Record<PlanSlug, number> = {
  essencial: 1,
  controle: 2,
  automacao: 3,
};

const planExclusiveFeaturesBySlug: Record<PlanSlug, string[]> = {
  essencial: [
    'Simulador mensal inteligente',
    'Projeção tributária com RBT12',
    'Alerta estratégico de Fator R',
    'Histórico completo',
    'Calendário fiscal inteligente',
    'Painel vinculado ao CNPJ',
  ],
  controle: [
    'Radar de faixa automático',
    'Relatório mensal em PDF',
    'Calendário fiscal com 3, 5 ou 7 dias',
    'Alertas por e-mail',
  ],
  automacao: [
    'Simulador de cenários comparativos',
    'Importador de notas fiscais',
    'Histórico automatizado de faturamento',
    'Base para automação de alertas',
  ],
};

export function buildCheckoutPlanSummary(
  planSlug: PlanSlug,
  cycle: PlanCycle,
  valorOverride?: number
): CheckoutPlanSummary {
  const planDefinition = getPlanDefinition(planSlug);

  return {
    titulo: planDefinition?.name ?? planSlug,
    slug: planSlug,
    ciclo: cycle,
    valor:
      typeof valorOverride === 'number'
        ? valorOverride
        : cycle === 'anual'
        ? planDefinition?.annualPrice ?? 0
        : planDefinition?.monthlyPrice ?? 0,
    features: getPlanFeatures(planSlug),
  };
}

export function determinePlanChangeType(
  currentPlanSlug: PlanSlug,
  nextPlanSlug: PlanSlug,
  currentCycle: PlanCycle,
  nextCycle: PlanCycle
): PlanChangeType {
  if (currentPlanSlug === nextPlanSlug && currentCycle !== nextCycle) {
    return 'troca_ciclo';
  }

  return planLevelBySlug[nextPlanSlug] > planLevelBySlug[currentPlanSlug]
    ? 'upgrade'
    : 'downgrade';
}

export function getFeaturesGained(
  currentPlanSlug: PlanSlug,
  nextPlanSlug: PlanSlug
) {
  const normalizedCurrentPlanSlug = normalizePlanSlug(currentPlanSlug);
  const normalizedNextPlanSlug = normalizePlanSlug(nextPlanSlug);

  if (!normalizedCurrentPlanSlug || !normalizedNextPlanSlug) {
    return [];
  }

  if (
    planLevelBySlug[normalizedNextPlanSlug] <=
    planLevelBySlug[normalizedCurrentPlanSlug]
  ) {
    return [];
  }

  return collectExclusiveFeaturesBetweenLevels(
    planLevelBySlug[normalizedCurrentPlanSlug] + 1,
    planLevelBySlug[normalizedNextPlanSlug]
  );
}

export function getFeaturesLost(
  currentPlanSlug: PlanSlug,
  nextPlanSlug: PlanSlug
) {
  const normalizedCurrentPlanSlug = normalizePlanSlug(currentPlanSlug);
  const normalizedNextPlanSlug = normalizePlanSlug(nextPlanSlug);

  if (!normalizedCurrentPlanSlug || !normalizedNextPlanSlug) {
    return [];
  }

  if (
    planLevelBySlug[normalizedNextPlanSlug] >=
    planLevelBySlug[normalizedCurrentPlanSlug]
  ) {
    return [];
  }

  return collectExclusiveFeaturesBetweenLevels(
    planLevelBySlug[normalizedNextPlanSlug] + 1,
    planLevelBySlug[normalizedCurrentPlanSlug]
  );
}

export function getPlanIntervalInSeconds(cycle: PlanCycle) {
  return cycle === 'anual' ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60;
}

function collectExclusiveFeaturesBetweenLevels(
  startLevel: number,
  endLevel: number
) {
  return [1, 2, 3]
    .filter((level) => level >= startLevel && level <= endLevel)
    .flatMap((level) => {
      if (level === 1) {
        return planExclusiveFeaturesBySlug.essencial;
      }

      if (level === 2) {
        return planExclusiveFeaturesBySlug.controle;
      }

      return planExclusiveFeaturesBySlug.automacao;
    });
}
