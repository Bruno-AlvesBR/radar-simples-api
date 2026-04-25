import { SimulateController } from './simulate.controller';
import { SimulateService } from './simulate.service';

describe('SimulateController', () => {
    let simulateController: SimulateController;
    let simulateService: {
        simulate: jest.Mock;
        simulateAndSave: jest.Mock;
        projection: jest.Mock;
        getHistory: jest.Mock;
        compare: jest.Mock;
    };

    beforeEach(() => {
        simulateService = {
            simulate: jest.fn(),
            simulateAndSave: jest.fn(),
            projection: jest.fn(),
            getHistory: jest.fn(),
            compare: jest.fn(),
        };
        simulateController = new SimulateController(
            simulateService as unknown as SimulateService
        );
    });

    it('deve delegar POST simulate público ao serviço', () => {
        const dto = { faturamentoMensal: 1, folhaPagamento: 0, proLabore: 0, rbt12: 1 };
        simulateService.simulate.mockReturnValue({ dasEstimado: 10 });

        const result = simulateController.simulate(dto as never);

        expect(simulateService.simulate).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ dasEstimado: 10 });
    });

    it('deve delegar save autenticado ao serviço', async () => {
        const dto = { faturamentoMensal: 2, folhaPagamento: 0, proLabore: 0, rbt12: 2 };
        simulateService.simulateAndSave.mockResolvedValue({ ok: true });

        await simulateController.simulateAndSave(dto as never, { sub: 'uid' });

        expect(simulateService.simulateAndSave).toHaveBeenCalledWith(dto, 'uid');
    });

    it('deve delegar projection ao serviço', async () => {
        const query = {
            faturamentoMensal: 3,
            folhaPagamento: 0,
            proLabore: 0,
            rbt12Inicial: 3,
        };
        simulateService.projection.mockResolvedValue([]);

        await simulateController.projection(query as never, { sub: 'u2' });

        expect(simulateService.projection).toHaveBeenCalledWith(query, 'u2');
    });

    it('deve delegar history ao serviço', async () => {
        simulateService.getHistory.mockResolvedValue([]);

        await simulateController.history({ sub: 'u3' });

        expect(simulateService.getHistory).toHaveBeenCalledWith('u3');
    });

    it('deve delegar compare ao serviço', async () => {
        const body = { scenarios: [] };
        simulateService.compare.mockResolvedValue({ scenarios: [], bestScenario: null });

        await simulateController.compare(body as never, { sub: 'u4' });

        expect(simulateService.compare).toHaveBeenCalledWith(body, 'u4');
    });
});
