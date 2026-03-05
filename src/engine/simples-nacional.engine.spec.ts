import {
  calculateSimples,
  calculateFatorR,
  calculateAliquotaEfetiva,
  getAnexoAplicavel,
} from './simples-nacional.engine';

describe('Simples Nacional Engine', () => {
  describe('calculateFatorR', () => {
    it('deve calcular Fator R >= 28% para anexo III', () => {
      const fator = calculateFatorR(0, 4200, 15000);
      expect(fator).toBeGreaterThanOrEqual(0.28);
    });

    it('deve calcular Fator R < 28% para anexo V', () => {
      const fator = calculateFatorR(0, 2000, 15000);
      expect(fator).toBeLessThan(0.28);
    });
  });

  describe('getAnexoAplicavel', () => {
    it('deve retornar III quando Fator R >= 28%', () => {
      expect(getAnexoAplicavel(0.28)).toBe('III');
      expect(getAnexoAplicavel(0.35)).toBe('III');
    });

    it('deve retornar V quando Fator R < 28%', () => {
      expect(getAnexoAplicavel(0.27)).toBe('V');
      expect(getAnexoAplicavel(0.1)).toBe('V');
    });
  });

  describe('calculateAliquotaEfetiva', () => {
    it('deve retornar alíquota correta para RBT12 baixo', () => {
      const { aliquota } = calculateAliquotaEfetiva(180000, 'III');
      expect(aliquota).toBeCloseTo(0.06, 2);
    });
  });

  describe('calculateSimples', () => {
    it('deve calcular simulação completa', () => {
      const result = calculateSimples({
        faturamentoMensal: 15000,
        folhaPagamento: 0,
        proLabore: 4200,
        rbt12: 180000,
      });
      expect(result.dasEstimado).toBeGreaterThan(0);
      expect(result.fatorRPercentual).toBeGreaterThan(0);
      expect(['III', 'V']).toContain(result.anexoAplicavel);
      expect(result.lucroDistribuivelEstimado).toBeGreaterThanOrEqual(0);
    });
  });
});
