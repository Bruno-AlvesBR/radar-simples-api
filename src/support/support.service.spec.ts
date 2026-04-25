import { SupportService } from './support.service';

describe('SupportService', () => {
    let supportService: SupportService;
    let supportTicketModel: { create: jest.Mock };

    beforeEach(() => {
        supportTicketModel = {
            create: jest.fn(),
        };
        supportService = new SupportService(supportTicketModel as never);
    });

    it('deve criar ticket e retornar campos esperados', async () => {
        const createdAt = new Date('2026-04-01');
        supportTicketModel.create.mockResolvedValue({
            _id: 'ticket-1',
            subject: 'Assunto',
            message: 'Mensagem detalhada',
            createdAt,
        });

        const result = await supportService.create(
            'user-99',
            'Assunto',
            'Mensagem detalhada'
        );

        expect(supportTicketModel.create).toHaveBeenCalledWith({
            userId: 'user-99',
            subject: 'Assunto',
            message: 'Mensagem detalhada',
        });
        expect(result).toEqual({
            id: 'ticket-1',
            subject: 'Assunto',
            message: 'Mensagem detalhada',
            createdAt,
        });
    });
});
