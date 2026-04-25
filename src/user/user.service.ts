import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').lean();
    if (!user) return null;
    const plano = user.plano
      ? {
          titulo: user.plano.titulo,
          slug: user.plano.slug,
          valor: user.plano.valor,
          ciclo: user.plano.ciclo,
          dataAdmissao: user.plano.dataAdmissao,
          dataVencimento: user.plano.dataVencimento,
        }
      : null;
    return {
      id: user._id,
      email: user.email,
      nome: user.nome,
      empresa: user.empresa,
      plano,
      fiscalReminderPreferences: user.fiscalReminderPreferences ?? {
        diasAntecedencia: [3, 7, 15],
        ativo: false,
      },
    };
  }

  async salvarEmpresa(userId: string, empresa: Record<string, unknown>) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { empresa }, { new: true })
      .select('-password')
      .lean();
    return user;
  }

  async atualizarPreferenciasLembretesFiscais(
    userId: string,
    preferences: {
      diasAntecedencia?: number[];
      ativo?: boolean;
    }
  ) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          fiscalReminderPreferences: {
            diasAntecedencia: preferences.diasAntecedencia ?? [3, 7, 15],
            ativo: preferences.ativo ?? true,
          },
        },
        { new: true }
      )
      .select('-password')
      .lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      nome: user.nome,
      empresa: user.empresa,
      plano: user.plano
        ? {
            titulo: user.plano.titulo,
            slug: user.plano.slug,
            valor: user.plano.valor,
            ciclo: user.plano.ciclo,
            dataAdmissao: user.plano.dataAdmissao,
            dataVencimento: user.plano.dataVencimento,
          }
        : null,
      fiscalReminderPreferences: user.fiscalReminderPreferences ?? {
        diasAntecedencia: [3, 7, 15],
        ativo: false,
      },
    };
  }

  private serializeUser(user: {
    _id: unknown;
    email: string;
    nome: string;
    empresa?: unknown;
    plano?: {
      titulo: string;
      slug: string;
      valor: number;
      ciclo: string;
      dataAdmissao: Date;
      dataVencimento: Date;
    };
  }) {
    const plano = user.plano
      ? {
          titulo: user.plano.titulo,
          slug: user.plano.slug,
          valor: user.plano.valor,
          ciclo: user.plano.ciclo,
          dataAdmissao: user.plano.dataAdmissao,
          dataVencimento: user.plano.dataVencimento,
        }
      : null;
    return {
      id: user._id,
      email: user.email,
      nome: user.nome,
      empresa: user.empresa,
      plano,
    };
  }
}
