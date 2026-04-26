import { ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
    let reportsService: ReportsService;
    let simulacaoModel: { find: jest.Mock };
    let userService: { findById: jest.Mock };

    beforeEach(() => {
        simulacaoModel = { find: jest.fn() };
        userService = { findById: jest.fn() };
        reportsService = new ReportsService(
            simulacaoModel as never,
            userService as never
        );
    });

    it('deve lançar Forbidden quando o plano não é Controle ou superior', async () => {
        userService.findById.mockResolvedValue({
            id: 'u1',
            plano: { slug: 'essencial' },
        });

        await expect(reportsService.getMonthlyReport('u1')).rejects.toThrow(
            ForbiddenException
        );
        expect(simulacaoModel.find).not.toHaveBeenCalled();
    });

    it('deve retornar simulações do mês quando o plano é Controle', async () => {
        userService.findById.mockResolvedValue({
            id: 'u2',
            email: 'r@exemplo.com',
            nome: 'R',
            empresa: null,
            plano: { slug: 'controle' },
        });
        const leanMock = jest.fn().mockResolvedValue([]);
        simulacaoModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: leanMock }) });

        const report = await reportsService.getMonthlyReport('u2', 2026, 4);

        expect(report.period).toEqual({
            year: 2026,
            month: 4,
            label: '04/2026',
        });
        expect(report.totalSimulations).toBe(0);
        expect(report.simulations).toEqual([]);
    });

    it('deve usar mês e ano customizados na consulta', async () => {
        userService.findById.mockResolvedValue({
            id: 'u3',
            plano: { slug: 'automacao' },
        });
        const leanMock = jest.fn().mockResolvedValue([]);
        simulacaoModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: leanMock }) });

        await reportsService.getMonthlyReport('u3', 2025, 11);

        expect(simulacaoModel.find).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'u3',
                createdAt: {
                    $gte: new Date(2025, 10, 1),
                    $lt: new Date(2025, 11, 1),
                },
            })
        );
    });
});
