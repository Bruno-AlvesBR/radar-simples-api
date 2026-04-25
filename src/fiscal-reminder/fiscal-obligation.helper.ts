export type FiscalObligationKind = 'das' | 'defis' | 'dasn_simei';

export interface FiscalObligationDefinition {
  kind: FiscalObligationKind;
  name: string;
  dueMonth: number;
  dueDay: number;
  recurrence: 'mensal' | 'anual';
  appliesTo: 'simples' | 'mei';
}

export interface FiscalObligationResult {
  kind: FiscalObligationKind;
  name: string;
  dueDate: Date;
  daysRemaining: number;
}

export const fiscalObligationDefinitions: FiscalObligationDefinition[] = [
  {
    kind: 'das',
    name: 'DAS',
    dueMonth: 1,
    dueDay: 20,
    recurrence: 'mensal',
    appliesTo: 'simples',
  },
  {
    kind: 'defis',
    name: 'DEFIS',
    dueMonth: 3,
    dueDay: 31,
    recurrence: 'anual',
    appliesTo: 'simples',
  },
  {
    kind: 'dasn_simei',
    name: 'DASN-SIMEI',
    dueMonth: 5,
    dueDay: 31,
    recurrence: 'anual',
    appliesTo: 'mei',
  },
];

export function isMeiCompany(
  company:
    | {
        simples?: boolean;
        porte?: string;
      }
    | null
    | undefined
) {
  const normalizedPorte = company?.porte?.trim().toLowerCase() ?? '';
  return company?.simples === true || normalizedPorte === 'mei';
}

export function getRelevantFiscalObligations(
  company:
    | {
        simples?: boolean;
        porte?: string;
      }
    | null
    | undefined
) {
  const isMei = isMeiCompany(company);
  return fiscalObligationDefinitions.filter((obligation) => {
    if (obligation.appliesTo === 'mei') {
      return isMei;
    }
    return true;
  });
}

export function getNextDueDate(
  referenceDate: Date,
  definition: FiscalObligationDefinition
) {
  if (definition.recurrence === 'mensal') {
    const monthlyDueDate = new Date(referenceDate);
    monthlyDueDate.setDate(definition.dueDay);
    monthlyDueDate.setHours(0, 0, 0, 0);

    if (monthlyDueDate < startOfDay(referenceDate)) {
      monthlyDueDate.setMonth(monthlyDueDate.getMonth() + 1);
    }

    return monthlyDueDate;
  }

  const yearlyDueDate = new Date(
    referenceDate.getFullYear(),
    definition.dueMonth - 1,
    definition.dueDay
  );
  yearlyDueDate.setHours(0, 0, 0, 0);

  if (yearlyDueDate < startOfDay(referenceDate)) {
    yearlyDueDate.setFullYear(yearlyDueDate.getFullYear() + 1);
  }

  return yearlyDueDate;
}

export function getDaysRemaining(referenceDate: Date, dueDate: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const difference =
    startOfDay(dueDate).getTime() - startOfDay(referenceDate).getTime();
  return Math.max(0, Math.ceil(difference / millisecondsPerDay));
}

export function buildFiscalObligations(
  referenceDate: Date,
  company:
    | {
        simples?: boolean;
        porte?: string;
      }
    | null
    | undefined
) {
  return getRelevantFiscalObligations(company).map((definition) => {
    const dueDate = getNextDueDate(referenceDate, definition);
    return {
      kind: definition.kind,
      name: definition.name,
      dueDate,
      daysRemaining: getDaysRemaining(referenceDate, dueDate),
    };
  });
}

function startOfDay(date: Date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}
