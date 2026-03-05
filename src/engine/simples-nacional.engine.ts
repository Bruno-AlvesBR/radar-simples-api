/**
 * Motor de Cálculo - Simples Nacional
 * Anexo III e V | Fator R | Alíquota Efetiva
 *
 * ⚠️ Simulações estimadas. Consulte seu contador.
 */

// Tabela Anexo III - Serviços (Fator R >= 28%)
const ANEXO_III = [
  { limite: 180_000, aliquota: 0.06, deducao: 0 },
  { limite: 360_000, aliquota: 0.112, deducao: 9_360 },
  { limite: 720_000, aliquota: 0.135, deducao: 17_640 },
  { limite: 1_800_000, aliquota: 0.16, deducao: 35_640 },
  { limite: 3_600_000, aliquota: 0.21, deducao: 125_640 },
  { limite: 4_800_000, aliquota: 0.33, deducao: 648_000 },
];

// Tabela Anexo V - Serviços intelectuais (Fator R < 28%)
const ANEXO_V = [
  { limite: 180_000, aliquota: 0.155, deducao: 0 },
  { limite: 360_000, aliquota: 0.18, deducao: 4_500 },
  { limite: 720_000, aliquota: 0.195, deducao: 9_900 },
  { limite: 1_800_000, aliquota: 0.205, deducao: 17_100 },
  { limite: 3_600_000, aliquota: 0.23, deducao: 62_100 },
  { limite: 4_800_000, aliquota: 0.305, deducao: 540_000 },
];

const FATOR_R_LIMITE = 0.28; // 28%

export interface SimulacaoInput {
  faturamentoMensal: number;
  folhaPagamento: number;
  proLabore: number;
  rbt12: number;
  anexo?: 'III' | 'V';
}

export interface SimulacaoOutput {
  fatorR: number;
  fatorRPercentual: number;
  anexoAplicavel: 'III' | 'V';
  aliquotaEfetiva: number;
  aliquotaEfetivaPercentual: number;
  dasEstimado: number;
  proLaboreMinimoSugerido: number;
  lucroDistribuivelEstimado: number;
  resumo: string;
  /** Economia estimada (R$) ao ajustar pró-labore para migrar ao Anexo III */
  economiaEstimada?: number;
  /** Alíquota efetiva (%) se aplicar a sugestão */
  aliquotaSugeridaPercentual?: number;
}

function getFaixa(rbt12: number, tabela: typeof ANEXO_III) {
  for (const faixa of tabela) {
    if (rbt12 <= faixa.limite) return faixa;
  }
  return tabela[tabela.length - 1];
}

/**
 * Calcula o Fator R
 * Fator R = (Folha + Pró-labore) / Faturamento
 */
export function calculateFatorR(
  folhaPagamento: number,
  proLabore: number,
  faturamentoMensal: number,
): number {
  if (faturamentoMensal <= 0) return 0;
  return (folhaPagamento + proLabore) / faturamentoMensal;
}

/**
 * Determina o anexo aplicável com base no Fator R
 */
export function getAnexoAplicavel(fatorR: number): 'III' | 'V' {
  return fatorR >= FATOR_R_LIMITE ? 'III' : 'V';
}

/**
 * Calcula a alíquota efetiva
 * Alíquota Efetiva = (RBT12 × Alíquota - Dedução) / RBT12
 */
export function calculateAliquotaEfetiva(
  rbt12: number,
  anexo: 'III' | 'V',
): { aliquota: number; faixa: { limite: number; aliquota: number; deducao: number } } {
  const tabela = anexo === 'III' ? ANEXO_III : ANEXO_V;
  const faixa = getFaixa(rbt12, tabela);
  const aliquotaEfetiva =
    rbt12 > 0 ? (rbt12 * faixa.aliquota - faixa.deducao) / rbt12 : 0;
  return { aliquota: Math.max(0, aliquotaEfetiva), faixa };
}

/**
 * Calcula o DAS estimado para o mês
 * DAS = Faturamento × Alíquota Efetiva
 */
export function calculateDas(faturamentoMensal: number, aliquotaEfetiva: number): number {
  return faturamentoMensal * aliquotaEfetiva;
}

/**
 * Sugere pró-labore mínimo para atingir Fator R >= 28%
 * (Folha + Pró-labore) / Faturamento >= 0.28
 * Pró-labore >= (0.28 × Faturamento) - Folha
 */
export function calculateProLaboreMinimo(
  faturamentoMensal: number,
  folhaPagamento: number,
): number {
  const minimo = faturamentoMensal * FATOR_R_LIMITE - folhaPagamento;
  return Math.max(0, minimo);
}

/**
 * Lucro distribuível = Faturamento - DAS - Folha - Pró-labore
 */
export function calculateLucroDistribuivel(
  faturamentoMensal: number,
  das: number,
  folhaPagamento: number,
  proLabore: number,
): number {
  return Math.max(0, faturamentoMensal - das - folhaPagamento - proLabore);
}

/**
 * Motor principal - Simulação completa
 */
export function calculateSimples(input: SimulacaoInput): SimulacaoOutput {
  const {
    faturamentoMensal,
    folhaPagamento,
    proLabore,
    rbt12,
  } = input;

  const fatorR = calculateFatorR(folhaPagamento, proLabore, faturamentoMensal);
  const anexoAplicavel = input.anexo ?? getAnexoAplicavel(fatorR);
  const { aliquota } = calculateAliquotaEfetiva(rbt12, anexoAplicavel);
  const dasEstimado = calculateDas(faturamentoMensal, aliquota);
  const proLaboreMinimoSugerido = calculateProLaboreMinimo(
    faturamentoMensal,
    folhaPagamento,
  );
  const lucroDistribuivelEstimado = calculateLucroDistribuivel(
    faturamentoMensal,
    dasEstimado,
    folhaPagamento,
    proLabore,
  );

  const precisaAumentarProLabore =
    fatorR < FATOR_R_LIMITE && proLaboreMinimoSugerido > proLabore;

  let economiaEstimada: number | undefined;
  let aliquotaSugeridaPercentual: number | undefined;

  if (precisaAumentarProLabore) {
    const { aliquota: aliquotaIII } = calculateAliquotaEfetiva(rbt12, 'III');
    const dasSugerido = calculateDas(faturamentoMensal, aliquotaIII);
    economiaEstimada = Math.max(0, dasEstimado - dasSugerido);
    aliquotaSugeridaPercentual = aliquotaIII * 100;
  }

  const resumo = precisaAumentarProLabore
    ? economiaEstimada != null && economiaEstimada > 0
      ? `Se ajustar o pró-labore para R$ ${proLaboreMinimoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, sua alíquota pode cair para ~${aliquotaSugeridaPercentual!.toFixed(1)}% e economizar aproximadamente R$ ${economiaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no mês.`
      : `Fator R abaixo de 28%. Considere aumentar pró-labore para R$ ${proLaboreMinimoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para migrar ao Anexo III.`
    : `Tributação no Anexo ${anexoAplicavel}. DAS estimado: R$ ${dasEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;

  return {
    fatorR,
    fatorRPercentual: fatorR * 100,
    anexoAplicavel,
    aliquotaEfetiva: aliquota,
    aliquotaEfetivaPercentual: aliquota * 100,
    dasEstimado,
    proLaboreMinimoSugerido,
    lucroDistribuivelEstimado,
    resumo,
    economiaEstimada,
    aliquotaSugeridaPercentual,
  };
}
