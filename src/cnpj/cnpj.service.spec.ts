import { BadRequestException } from '@nestjs/common';
import { CnpjService } from './cnpj.service';

describe('CnpjService', () => {
    let cnpjService: CnpjService;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        cnpjService = new CnpjService();
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('deve lançar BadRequest quando o CNPJ não tem 14 dígitos', async () => {
        await expect(cnpjService.buscarCnpj('123')).rejects.toThrow(BadRequestException);
        await expect(cnpjService.buscarCnpj('123')).rejects.toThrow(
            'CNPJ deve ter 14 dígitos'
        );
    });

    it('deve retornar JSON quando a API responde com sucesso', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ razao_social: 'Empresa Teste' }),
        });

        const payload = await cnpjService.buscarCnpj('11.222.333/0001-81');

        expect(payload).toEqual({ razao_social: 'Empresa Teste' });
        expect(global.fetch).toHaveBeenCalled();
    });

    it('deve lançar BadRequest quando o CNPJ não é encontrado', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });

        await expect(cnpjService.buscarCnpj('11222333000181')).rejects.toThrow(
            'CNPJ não encontrado'
        );
    });

    it('deve lançar BadRequest em erro genérico da API', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
        });

        await expect(cnpjService.buscarCnpj('11222333000181')).rejects.toThrow(
            'Erro ao consultar CNPJ'
        );
    });
});
