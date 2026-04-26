export type PlanSlug = 'essencial' | 'controle' | 'automacao';

export type LegacyPlanSlug = PlanSlug | 'pro';

export type PlanCycle = 'mensal' | 'anual';

export interface PlanDefinition {
    slug: PlanSlug;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    features: string[];
}

export const planDefinitions: Record<PlanSlug, PlanDefinition> = {
    essencial: {
        slug: 'essencial',
        name: 'Essencial',
        monthlyPrice: 9.9,
        annualPrice: 99,
        features: [
            'Simulador mensal inteligente',
            'Projeção tributária com RBT12',
            'Alerta estratégico de Fator R',
            'Histórico completo',
            'Calendário fiscal inteligente',
            'Painel vinculado ao CNPJ',
        ],
    },
    controle: {
        slug: 'controle',
        name: 'Controle',
        monthlyPrice: 19.9,
        annualPrice: 199,
        features: [
            'Tudo do Essencial',
            'Radar de faixa automático',
            'Relatório mensal em PDF',
            'Calendário fiscal com 3, 5 ou 7 dias',
            'Alertas por e-mail',
        ],
    },
    automacao: {
        slug: 'automacao',
        name: 'Automação',
        monthlyPrice: 29.9,
        annualPrice: 299,
        features: [
            'Tudo do Controle',
            'Simulador de cenários comparativos',
            'Importador de notas fiscais',
            'Histórico automatizado de faturamento',
            'Base para automação de alertas',
        ],
    },
};

const legacyPlanAliases: Record<LegacyPlanSlug, PlanSlug> = {
    pro: 'essencial',
    essencial: 'essencial',
    controle: 'controle',
    automacao: 'automacao',
};

const planLevelBySlug: Record<LegacyPlanSlug, number> = {
    pro: 1,
    essencial: 1,
    controle: 2,
    automacao: 3,
};

export function normalizePlanSlug(
    planSlug: string | null | undefined
): PlanSlug | null {
    if (!planSlug) {
        return null;
    }

    const normalizedPlanSlug = planSlug.trim().toLowerCase();
    if (!normalizedPlanSlug) {
        return null;
    }

    if (
        normalizedPlanSlug !== 'pro' &&
        normalizedPlanSlug !== 'essencial' &&
        normalizedPlanSlug !== 'controle' &&
        normalizedPlanSlug !== 'automacao'
    ) {
        return null;
    }

    return legacyPlanAliases[normalizedPlanSlug as LegacyPlanSlug];
}

export function getPlanDefinition(planSlug: string | null | undefined) {
    const normalizedPlanSlug = normalizePlanSlug(planSlug);
    return normalizedPlanSlug ? planDefinitions[normalizedPlanSlug] : null;
}

export function isPlanAtLeast(
    planSlug: string | null | undefined,
    requiredPlanSlug: PlanSlug
) {
    const normalizedPlanSlug = normalizePlanSlug(planSlug);
    if (!normalizedPlanSlug) {
        return false;
    }

    return (
        planLevelBySlug[normalizedPlanSlug] >=
        planLevelBySlug[requiredPlanSlug]
    );
}

export function getPlanDisplayName(planSlug: string | null | undefined) {
    const planDefinition = getPlanDefinition(planSlug);
    return planDefinition ? planDefinition.name : null;
}

export function getPlanFeatures(planSlug: string | null | undefined) {
    const planDefinition = getPlanDefinition(planSlug);
    return planDefinition ? planDefinition.features : [];
}

