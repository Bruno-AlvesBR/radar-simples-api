import { Injectable, BadRequestException } from '@nestjs/common';

const CNPJ_API = 'https://publica.cnpj.ws/cnpj';

@Injectable()
export class CnpjService {
  async buscarCnpj(cnpj: string) {
    const limpo = cnpj.replace(/\D/g, '');
    if (limpo.length !== 14) {
      throw new BadRequestException('CNPJ deve ter 14 dígitos');
    }

    const res = await fetch(`${CNPJ_API}/${limpo}`, {
      headers: {
        accept: 'application/json',
        'user-agent': 'PainelPJ/1.0',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new BadRequestException('CNPJ não encontrado');
      }
      throw new BadRequestException('Erro ao consultar CNPJ. Tente novamente.');
    }

    return res.json();
  }
}
