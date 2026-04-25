import { UnauthorizedException } from '@nestjs/common';
import { LeadsService } from './leads.service';

describe('LeadsService', () => {
    let leadsService: LeadsService;
    let leadModel: { create: jest.Mock; aggregate: jest.Mock };
    let configurationService: { get: jest.Mock };

    beforeEach(() => {
        leadModel = { create: jest.fn(), aggregate: jest.fn() };
        configurationService = {
            get: jest.fn(),
        };
        leadsService = new LeadsService(leadModel as never, configurationService as never);
    });

    it('deve retornar registrado true para email novo', async () => {
        leadModel.create.mockResolvedValue({ email: 'novo@exemplo.com' });

        const result = await leadsService.capturar({
            email: 'Novo@Exemplo.com ',
            origemCaptura: 'landing',
        });

        expect(result).toEqual({ registrado: true });
        expect(leadModel.create).toHaveBeenCalledWith({
            email: 'novo@exemplo.com',
            origemCaptura: 'landing',
            metadata: undefined,
        });
    });

    it('deve persistir metadata quando informada', async () => {
        leadModel.create.mockResolvedValue({ email: 'm@exemplo.com' });

        await leadsService.capturar({
            email: 'm@exemplo.com',
            origemCaptura: 'landing',
            metadata: { source: 'hero', page: '/landing' },
        });

        expect(leadModel.create).toHaveBeenCalledWith({
            email: 'm@exemplo.com',
            origemCaptura: 'landing',
            metadata: { source: 'hero', page: '/landing' },
        });
    });

    it('deve retornar estatísticas quando a chave administrativa é válida', async () => {
        configurationService.get.mockReturnValue('segredo');
        leadModel.aggregate.mockResolvedValue([
            { _id: 'landing', total: 4 },
            { _id: 'hero', total: 2 },
        ]);

        const stats = await leadsService.getLeadCaptureStatistics('segredo');

        expect(stats.totalsBySource).toEqual([
            { source: 'landing', total: 4 },
            { source: 'hero', total: 2 },
        ]);
    });

    it('deve lançar Unauthorized quando a chave administrativa é inválida', async () => {
        configurationService.get.mockReturnValue('segredo');

        await expect(
            leadsService.getLeadCaptureStatistics('errado')
        ).rejects.toThrow(UnauthorizedException);
    });

    it('deve retornar registrado true quando o email duplicado gera código 11000', async () => {
        const duplicateError = Object.assign(new Error('duplicate'), { code: 11000 });
        leadModel.create.mockRejectedValue(duplicateError);

        const result = await leadsService.capturar({
            email: 'dup@exemplo.com',
        });

        expect(result).toEqual({ registrado: true });
    });

    it('deve relançar erro inesperado', async () => {
        leadModel.create.mockRejectedValue(new Error('falha desconhecida'));

        await expect(
            leadsService.capturar({ email: 'erro@exemplo.com' })
        ).rejects.toThrow('falha desconhecida');
    });
});
