import { StatsService } from './stats.service';

describe('StatsService', () => {
    let statsService: StatsService;
    let simulacaoModel: { countDocuments: jest.Mock };
    let userModel: { countDocuments: jest.Mock };

    beforeEach(() => {
        simulacaoModel = { countDocuments: jest.fn() };
        userModel = { countDocuments: jest.fn() };
        statsService = new StatsService(simulacaoModel as never, userModel as never);
    });

    it('deve retornar contagens públicas', async () => {
        const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(2_000_000_000_000);
        simulacaoModel.countDocuments.mockResolvedValue(10);
        userModel.countDocuments.mockResolvedValueOnce(5).mockResolvedValueOnce(1);

        const payload = await statsService.getPublicStatistics();
        dateNowSpy.mockRestore();

        expect(payload).toEqual({
            totalSimulacoesSalvas: 10,
            totalUsuarios: 5,
            cadastrosUltimas24Horas: 1,
        });
    });

    it('deve usar cache dentro de cinco minutos', async () => {
        const now = 1_700_000_000_000;
        const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);
        simulacaoModel.countDocuments.mockResolvedValue(1);
        userModel.countDocuments.mockResolvedValueOnce(2).mockResolvedValueOnce(3);

        const first = await statsService.getPublicStatistics();
        const second = await statsService.getPublicStatistics();

        expect(first).toEqual(second);
        expect(simulacaoModel.countDocuments).toHaveBeenCalledTimes(1);
        dateNowSpy.mockRestore();
    });

    it('deve renovar cache após expiração', async () => {
        let currentTime = 1_800_000_000_000;
        const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
        simulacaoModel.countDocuments.mockResolvedValue(3);
        userModel.countDocuments.mockResolvedValue(4);

        await statsService.getPublicStatistics();
        currentTime += 6 * 60 * 1000;
        await statsService.getPublicStatistics();

        expect(simulacaoModel.countDocuments).toHaveBeenCalledTimes(2);
        dateNowSpy.mockRestore();
    });

    it('deve retornar fallback zerado quando o banco falha', async () => {
        const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_900_000_000_000);
        simulacaoModel.countDocuments.mockRejectedValue(new Error('db offline'));

        const payload = await statsService.getPublicStatistics();

        expect(payload).toEqual({
            totalSimulacoesSalvas: 0,
            totalUsuarios: 0,
            cadastrosUltimas24Horas: 0,
        });
        dateNowSpy.mockRestore();
    });
});
