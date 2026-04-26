import {
    getPlanDefinition,
    getPlanDisplayName,
    getPlanFeatures,
    isPlanAtLeast,
    normalizePlanSlug,
} from './plan.constants';

describe('plan.constants', () => {
    it('deve normalizar slugs válidos e legado pro', () => {
        expect(normalizePlanSlug('Essencial ')).toBe('essencial');
        expect(normalizePlanSlug('PRO')).toBe('essencial');
        expect(normalizePlanSlug('controle')).toBe('controle');
        expect(normalizePlanSlug('automacao')).toBe('automacao');
        expect(normalizePlanSlug('desconhecido')).toBeNull();
        expect(normalizePlanSlug(null)).toBeNull();
    });

    it('deve comparar níveis de plano em isPlanAtLeast', () => {
        expect(isPlanAtLeast('essencial', 'essencial')).toBe(true);
        expect(isPlanAtLeast('controle', 'essencial')).toBe(true);
        expect(isPlanAtLeast('essencial', 'controle')).toBe(false);
        expect(isPlanAtLeast('pro', 'essencial')).toBe(true);
        expect(isPlanAtLeast(null, 'essencial')).toBe(false);
    });

    it('deve retornar definição, nome e features por slug', () => {
        const definition = getPlanDefinition('controle');
        expect(definition?.slug).toBe('controle');
        expect(getPlanDisplayName('automacao')).toBe('Automação');
        expect(getPlanFeatures('essencial').length).toBeGreaterThan(0);
    });
});
