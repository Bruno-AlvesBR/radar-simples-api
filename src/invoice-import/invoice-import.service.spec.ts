import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InvoiceImportService } from './invoice-import.service';

describe('InvoiceImportService', () => {
    let invoiceImportService: InvoiceImportService;
    let invoiceRecordModel: { insertMany: jest.Mock; find: jest.Mock };
    let userService: { findById: jest.Mock };

    function buildSpreadsheetBuffer(rows: Record<string, unknown>[]) {
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, sheet, 'Notas');
        return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }

    beforeEach(() => {
        invoiceRecordModel = {
            insertMany: jest.fn(),
            find: jest.fn(),
        };
        userService = { findById: jest.fn() };
        invoiceImportService = new InvoiceImportService(
            invoiceRecordModel as never,
            userService as never
        );
    });

    it('deve lançar Forbidden na importação sem plano Automação', async () => {
        userService.findById.mockResolvedValue({ plano: { slug: 'controle' } });

        await expect(
            invoiceImportService.importFile('u1', Buffer.from('x'), 'f.xlsx')
        ).rejects.toThrow(ForbiddenException);
    });

    it('deve importar registros quando o plano é Automação', async () => {
        userService.findById.mockResolvedValue({ plano: { slug: 'automacao' } });
        const buffer = buildSpreadsheetBuffer([
            { DataEmissao: '15/03/2026', Valor: '1.234,56' },
        ]);
        invoiceRecordModel.insertMany.mockResolvedValue([
            { competenceMonth: '2026-03', amount: 1234.56 },
        ]);

        const summary = await invoiceImportService.importFile('u1', buffer, 'notas.xlsx');

        expect(invoiceRecordModel.insertMany).toHaveBeenCalled();
        expect(summary.importedRecords).toBe(1);
        expect(summary.totalAmount).toBeCloseTo(1234.56, 2);
    });

    it('deve lançar BadRequest quando não há notas válidas', async () => {
        userService.findById.mockResolvedValue({ plano: { slug: 'automacao' } });
        const buffer = buildSpreadsheetBuffer([{ outra: 'coluna' }]);

        await expect(invoiceImportService.importFile('u1', buffer)).rejects.toThrow(
            BadRequestException
        );
    });

    it('deve lançar Forbidden no resumo mensal sem Automação', async () => {
        userService.findById.mockResolvedValue({ plano: null });

        await expect(invoiceImportService.getMonthlySummary('u2')).rejects.toThrow(
            ForbiddenException
        );
    });

    it('deve retornar resumo agregado no getMonthlySummary', async () => {
        userService.findById.mockResolvedValue({ plano: { slug: 'automacao' } });
        const leanMock = jest.fn().mockResolvedValue([
            { competenceMonth: '2026-01', amount: 100 },
            { competenceMonth: '2026-01', amount: 50 },
        ]);
        invoiceRecordModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: leanMock }) });

        const summary = await invoiceImportService.getMonthlySummary('u3');

        expect(summary.importedRecords).toBe(2);
        expect(summary.totalAmount).toBe(150);
        expect(summary.monthlyTotals).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ competenceMonth: '2026-01', amount: 150 }),
            ])
        );
    });
});
