import { ForbiddenException } from '@nestjs/common';
import { SimulateService } from './simulate.service';

describe('SimulateService', () => {
    let simulateService: SimulateService;
    let simulacaoModel: { create: jest.Mock; find: jest.Mock };
    let userService: { findById: jest.Mock };

    const baseSimulateDto = {
        faturamentoMensal: 10000,
        folhaPagamento: 0,
        proLabore: 0,
        rbt12: 120000,
    };

    beforeEach(() => {
        simulacaoModel = {
            create: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
        };
        userService = { findById: jest.fn() };
        simulateService = new SimulateService(
            simulacaoModel as never,
            userService as never
        );
    });

    it('deve calcular simulação pública sem persistir', () => {
        const result = simulateService.simulate(baseSimulateDto);

        expect(result).toEqual(
            expect.objectContaining({
                dasEstimado: expect.any(Number),
            })
        );
        expect(simulacaoModel.create).not.toHaveBeenCalled();
    });

    it('deve salvar simulação quando o usuário possui plano Essencial', async () => {
        userService.findById.mockResolvedValue({
            id: 'u1',
            plano: { slug: 'essencial' },
        });

        await simulateService.simulateAndSave(baseSimulateDto, 'u1');

        expect(simulacaoModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'u1',
                faturamentoMensal: baseSimulateDto.faturamentoMensal,
                resultado: expect.any(Object),
            })
        );
    });

    it('deve lançar Forbidden quando salvar sem plano suficiente', async () => {
        userService.findById.mockResolvedValue({
            id: 'u2',
            plano: null,
        });

        await expect(
            simulateService.simulateAndSave(baseSimulateDto, 'u2')
        ).rejects.toThrow(ForbiddenException);
        expect(simulacaoModel.create).not.toHaveBeenCalled();
    });

    it('deve gerar projeção quando o usuário possui Essencial', async () => {
        userService.findById.mockResolvedValue({
            plano: { slug: 'essencial' },
        });
        const projectionDto = {
            faturamentoMensal: 5000,
            folhaPagamento: 0,
            proLabore: 0,
            rbt12Inicial: 60000,
            meses: 3,
            crescimentoMensal: 0,
        };

        const result = await simulateService.projection(projectionDto, 'u1');

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(
            expect.objectContaining({
                mes: 1,
                faturamento: 5000,
            })
        );
    });

    it('deve lançar Forbidden na projeção sem plano', async () => {
        userService.findById.mockResolvedValue({ plano: null });

        await expect(
            simulateService.projection(
                {
                    faturamentoMensal: 1,
                    folhaPagamento: 0,
                    proLabore: 0,
                    rbt12Inicial: 1,
                },
                'u'
            )
        ).rejects.toThrow(ForbiddenException);
    });

    it('deve retornar histórico limitado a 1000 com plano Essencial', async () => {
        userService.findById.mockResolvedValue({ plano: { slug: 'essencial' } });
        const leanMock = jest.fn().mockResolvedValue([]);
        const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
        const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
        simulacaoModel.find.mockReturnValue({ sort: sortMock });

        await simulateService.getHistory('hist-user');

        expect(simulacaoModel.find).toHaveBeenCalledWith({ userId: 'hist-user' });
        expect(limitMock).toHaveBeenCalledWith(1000);
    });

    it('deve retornar histórico vazio quando não há plano Essencial', async () => {
        userService.findById.mockResolvedValue({ plano: null });
        const leanMock = jest.fn().mockResolvedValue([]);
        const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
        const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
        simulacaoModel.find.mockReturnValue({ sort: sortMock });

        await simulateService.getHistory('no-plan');

        expect(limitMock).toHaveBeenCalledWith(0);
    });

    it('deve comparar cenários quando o plano é Automação', async () => {
        userService.findById.mockResolvedValue({ plano: { slug: 'automacao' } });
        const scenarioA = { ...baseSimulateDto, faturamentoMensal: 1000 };
        const scenarioB = { ...baseSimulateDto, faturamentoMensal: 2000 };

        const result = await simulateService.compare(
            { scenarios: [scenarioA, scenarioB] },
            'u-auto'
        );

        expect(result.scenarios).toHaveLength(2);
        expect(result.bestScenario).toBeGreaterThanOrEqual(1);
    });

    it('deve lançar Forbidden na comparação sem plano Automação', async () => {
        userService.findById.mockResolvedValue({ plano: { slug: 'controle' } });

        await expect(
            simulateService.compare(
                {
                    scenarios: [
                        { ...baseSimulateDto },
                        { ...baseSimulateDto, faturamentoMensal: 2 },
                    ],
                },
                'u-low'
            )
        ).rejects.toThrow(ForbiddenException);
    });
});
