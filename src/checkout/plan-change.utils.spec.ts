import {
  buildCheckoutPlanSummary,
  determinePlanChangeType,
  getFeaturesGained,
  getFeaturesLost,
  getPlanIntervalInSeconds,
} from './plan-change.utils';

describe('Plan change utilities', () => {
  it('deve montar o resumo do plano com valor sobrescrito e features do catálogo', () => {
    const summary = buildCheckoutPlanSummary('controle', 'mensal', 25.9);

    expect(summary).toEqual({
      titulo: 'Controle',
      slug: 'controle',
      ciclo: 'mensal',
      valor: 25.9,
      features: expect.arrayContaining([
        'Tudo do Essencial',
        'Radar de faixa automático',
        'Relatório mensal em PDF',
      ]),
    });
  });

  it('deve identificar upgrade, downgrade e troca de ciclo', () => {
    expect(
      determinePlanChangeType('controle', 'automacao', 'mensal', 'mensal')
    ).toBe('upgrade');
    expect(
      determinePlanChangeType('automacao', 'controle', 'mensal', 'mensal')
    ).toBe('downgrade');
    expect(
      determinePlanChangeType('controle', 'controle', 'mensal', 'anual')
    ).toBe('troca_ciclo');
  });

  it('deve calcular features ganhas e perdidas entre planos', () => {
    expect(getFeaturesGained('controle', 'automacao')).toEqual([
      'Simulador de cenários comparativos',
      'Importador de notas fiscais',
      'Histórico automatizado de faturamento',
      'Base para automação de alertas',
    ]);

    expect(getFeaturesLost('controle', 'automacao')).toEqual([]);
    expect(getFeaturesLost('automacao', 'controle')).toEqual([
      'Simulador de cenários comparativos',
      'Importador de notas fiscais',
      'Histórico automatizado de faturamento',
      'Base para automação de alertas',
    ]);
  });

  it('deve retornar o intervalo correto por ciclo', () => {
    expect(getPlanIntervalInSeconds('mensal')).toBe(30 * 24 * 60 * 60);
    expect(getPlanIntervalInSeconds('anual')).toBe(365 * 24 * 60 * 60);
  });
});
