import {
    buildFiscalObligations,
    fiscalObligationDefinitions,
    getDaysRemaining,
    getNextDueDate,
    getRelevantFiscalObligations,
    isMeiCompany,
} from './fiscal-obligation.helper';

describe('fiscal-obligation.helper', () => {
    it('deve identificar MEI pelo porte', () => {
        expect(isMeiCompany({ porte: 'MEI' })).toBe(true);
        expect(isMeiCompany({ porte: ' mei ' })).toBe(true);
    });

    it('deve identificar MEI quando simples é true', () => {
        expect(isMeiCompany({ simples: true, porte: 'outro' })).toBe(true);
    });

    it('deve retornar false para empresa não MEI', () => {
        expect(isMeiCompany({ simples: false, porte: 'demais' })).toBe(false);
        expect(isMeiCompany(null)).toBe(false);
    });

    it('deve filtrar obrigações MEI versus Simples', () => {
        const meiObligations = getRelevantFiscalObligations({ porte: 'mei' });
        expect(meiObligations.some((item) => item.kind === 'dasn_simei')).toBe(true);

        const simplesObligations = getRelevantFiscalObligations({
            simples: false,
            porte: 'ltda',
        });
        expect(
            simplesObligations.some((item) => item.appliesTo === 'mei')
        ).toBe(false);
    });

    it('deve calcular próxima data mensal antes e depois do vencimento', () => {
        const definition = fiscalObligationDefinitions.find(
            (item) => item.recurrence === 'mensal'
        );
        expect(definition).toBeDefined();
        const before = getNextDueDate(new Date(2026, 3, 10), definition!);
        expect(before.getMonth()).toBe(3);
        expect(before.getDate()).toBe(20);

        const after = getNextDueDate(new Date(2026, 3, 21), definition!);
        expect(after.getMonth()).toBe(4);
        expect(after.getDate()).toBe(20);
    });

    it('deve calcular próxima data anual antes e depois do vencimento', () => {
        const definition = fiscalObligationDefinitions.find(
            (item) => item.recurrence === 'anual' && item.kind === 'defis'
        );
        expect(definition).toBeDefined();
        const beforeYear = getNextDueDate(new Date(2026, 1, 1), definition!);
        expect(beforeYear.getFullYear()).toBe(2026);
        expect(beforeYear.getMonth()).toBe(2);

        const afterYear = getNextDueDate(new Date(2026, 3, 1), definition!);
        expect(afterYear.getFullYear()).toBe(2027);
    });

    it('deve calcular dias restantes', () => {
        const reference = new Date('2026-04-10T12:00:00.000Z');
        const due = new Date('2026-04-13T12:00:00.000Z');
        expect(getDaysRemaining(reference, due)).toBe(3);
    });

    it('deve montar obrigações fiscais integradas', () => {
        const obligations = buildFiscalObligations(new Date('2026-04-15'), {
            simples: false,
            porte: 'ltda',
        });
        expect(obligations.length).toBeGreaterThan(0);
        obligations.forEach((item) => {
            expect(item).toEqual(
                expect.objectContaining({
                    name: expect.any(String),
                    dueDate: expect.any(Date),
                    daysRemaining: expect.any(Number),
                })
            );
        });
    });
});
