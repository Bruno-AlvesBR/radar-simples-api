import * as XLSX from 'xlsx';
import { parseInvoiceRecords } from './invoice-import.helper';

describe('invoice-import.helper', () => {
    function buildBuffer(rows: Record<string, unknown>[]) {
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, sheet, 'Plan1');
        return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }

    it('deve retornar registros para buffer XLSX válido', () => {
        const buffer = buildBuffer([{ dataemissao: '10/01/2026', valor: 500 }]);

        const records = parseInvoiceRecords(buffer, 'entrada.xlsx');

        expect(records).toHaveLength(1);
        expect(records[0].amount).toBe(500);
        expect(records[0].competenceMonth).toBe('2026-01');
        expect(records[0].sourceFileName).toBe('entrada.xlsx');
    });

    it('deve aceitar alias data da emissão e valor formatado', () => {
        const buffer = buildBuffer([
            { 'Data da Emissão': '05/02/2026', 'Valor da Nota': '1.234,56' },
        ]);

        const records = parseInvoiceRecords(buffer);

        expect(records).toHaveLength(1);
        expect(records[0].amount).toBeCloseTo(1234.56, 2);
    });

    it('deve retornar lista vazia para planilha sem linhas válidas', () => {
        const buffer = buildBuffer([{ valor: 100 }]);

        const records = parseInvoiceRecords(buffer);

        expect(records).toEqual([]);
    });

    it('deve interpretar número serial de data do Excel', () => {
        const buffer = buildBuffer([{ dataemissao: 44927, valor: 10 }]);

        const records = parseInvoiceRecords(buffer);

        expect(records.length).toBe(1);
        expect(records[0].amount).toBe(10);
    });
});
