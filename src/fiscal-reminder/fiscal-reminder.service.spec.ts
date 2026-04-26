import { ForbiddenException } from '@nestjs/common';
import * as fiscalObligationHelper from './fiscal-obligation.helper';
import { FiscalReminderService } from './fiscal-reminder.service';

describe('FiscalReminderService', () => {
    let fiscalReminderService: FiscalReminderService;
    let fiscalReminderModel: {
        findOne: jest.Mock;
        create: jest.Mock;
        findOneAndUpdate: jest.Mock;
        find: jest.Mock;
        updateOne: jest.Mock;
    };
    let userService: { findById: jest.Mock };
    let emailService: { sendFiscalReminder: jest.Mock };
    let configurationService: { get: jest.Mock };
    let buildFiscalObligationsSpy: jest.SpyInstance;

    beforeEach(() => {
        fiscalReminderModel = {
            findOne: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
            find: jest.fn(),
            updateOne: jest.fn(),
        };
        userService = { findById: jest.fn() };
        emailService = { sendFiscalReminder: jest.fn().mockResolvedValue(undefined) };
        configurationService = {
            get: jest.fn((_key: string, defaultValue?: string) => defaultValue),
        };
        buildFiscalObligationsSpy = jest
            .spyOn(fiscalObligationHelper, 'buildFiscalObligations')
            .mockReturnValue([
                {
                    kind: 'das',
                    name: 'DAS',
                    dueDate: new Date('2026-04-20'),
                    daysRemaining: 7,
                },
            ]);
        fiscalReminderService = new FiscalReminderService(
            fiscalReminderModel as never,
            userService as never,
            emailService as never,
            configurationService as never
        );
    });

    afterEach(() => {
        buildFiscalObligationsSpy.mockRestore();
    });

    it('deve permitir resumo quando o plano é Essencial', async () => {
        userService.findById.mockResolvedValue({
            email: 'a@b.com',
            nome: 'A',
            plano: { slug: 'essencial' },
            empresa: { simples: true },
        });
        fiscalReminderModel.findOne.mockResolvedValue(null);
        fiscalReminderModel.create.mockResolvedValue({
            userId: 'u1',
            diasAntecedencia: [7],
            ativo: true,
        });

        const summary = await fiscalReminderService.getDashboardSummary('u1');

        expect(summary.accessAllowed).toBe(true);
        expect(summary.planSlug).toBe('essencial');
        expect(summary.diasAntecedenciaPermitidos).toEqual([7]);
    });

    it('deve permitir 3, 5 e 7 dias no plano Controle', async () => {
        userService.findById.mockResolvedValue({
            plano: { slug: 'controle' },
            empresa: null,
        });
        const reminderDocument = {
            diasAntecedencia: [3, 5],
            save: jest.fn().mockResolvedValue(undefined),
        };
        fiscalReminderModel.findOne.mockResolvedValue(reminderDocument);

        const summary = await fiscalReminderService.getDashboardSummary('u2');

        expect(summary.diasAntecedenciaPermitidos).toEqual([3, 5, 7]);
        expect(reminderDocument.save).toHaveBeenCalled();
    });

    it('deve negar acesso ao resumo quando não há plano', async () => {
        userService.findById.mockResolvedValue({
            plano: null,
            empresa: null,
        });
        fiscalReminderModel.findOne.mockResolvedValue(null);
        fiscalReminderModel.create.mockResolvedValue({
            userId: 'u3',
            diasAntecedencia: [7],
            ativo: true,
        });

        const summary = await fiscalReminderService.getDashboardSummary('u3');

        expect(summary.accessAllowed).toBe(false);
    });

    it('deve lançar Forbidden ao atualizar preferências sem plano Essencial', async () => {
        userService.findById.mockResolvedValue({ plano: null });

        await expect(
            fiscalReminderService.updatePreferences('u4', { diasAntecedencia: [7] })
        ).rejects.toThrow(ForbiddenException);
    });

    it('deve salvar preferências quando o plano é válido', async () => {
        userService.findById.mockResolvedValue({
            plano: { slug: 'controle' },
            empresa: null,
        });
        fiscalReminderModel.findOneAndUpdate.mockResolvedValue({
            diasAntecedencia: [3, 5],
        });

        const summary = await fiscalReminderService.updatePreferences('u5', {
            diasAntecedencia: [3, 5],
        });

        expect(fiscalReminderModel.findOneAndUpdate).toHaveBeenCalled();
        expect(summary.diasAntecedenciaSelecionados).toEqual([3, 5]);
    });

    it('deve normalizar dias selecionados para valores permitidos', async () => {
        userService.findById.mockResolvedValue({
            plano: { slug: 'essencial' },
            empresa: null,
        });
        fiscalReminderModel.findOneAndUpdate.mockResolvedValue({
            diasAntecedencia: [7],
        });

        const summary = await fiscalReminderService.updatePreferences('u6', {
            diasAntecedencia: [3, 5],
        });

        expect(summary.diasAntecedenciaSelecionados).toEqual([7]);
    });

    it('deve enviar lembrete e atualizar ultimoEnvioEm quando há obrigação no dia', async () => {
        const remindersList = [
            {
                _id: 'rem-1',
                userId: 'user-a',
                diasAntecedencia: [7],
                ativo: true,
                ultimoEnvioEm: null,
            },
        ];
        fiscalReminderModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(remindersList),
        });
        userService.findById.mockResolvedValue({
            email: 'dest@exemplo.com',
            nome: 'Dest',
            plano: { slug: 'essencial' },
            empresa: { simples: true },
        });

        await fiscalReminderService.dispatchDueReminders();

        expect(emailService.sendFiscalReminder).toHaveBeenCalled();
        expect(fiscalReminderModel.updateOne).toHaveBeenCalled();
    });

    it('deve pular envio quando já houve envio no mesmo dia', async () => {
        const today = new Date();
        fiscalReminderModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
                {
                    _id: 'rem-2',
                    userId: 'user-b',
                    diasAntecedencia: [7],
                    ativo: true,
                    ultimoEnvioEm: today,
                },
            ]),
        });
        userService.findById.mockResolvedValue({
            email: 'b@exemplo.com',
            plano: { slug: 'essencial' },
            empresa: { simples: true },
        });

        await fiscalReminderService.dispatchDueReminders();

        expect(emailService.sendFiscalReminder).not.toHaveBeenCalled();
    });

    it('deve pular usuário sem plano Essencial no disparo', async () => {
        fiscalReminderModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
                {
                    _id: 'rem-3',
                    userId: 'user-c',
                    diasAntecedencia: [7],
                    ativo: true,
                    ultimoEnvioEm: null,
                },
            ]),
        });
        userService.findById.mockResolvedValue({
            email: 'c@exemplo.com',
            plano: null,
            empresa: null,
        });

        await fiscalReminderService.dispatchDueReminders();

        expect(emailService.sendFiscalReminder).not.toHaveBeenCalled();
    });
});
