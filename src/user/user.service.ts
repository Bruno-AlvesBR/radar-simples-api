import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getPlanDefinition, normalizePlanSlug } from '../plans/plan.constants';
import { FiscalReminderService } from '../fiscal-reminder/fiscal-reminder.service';
import {
    Simulacao,
    SimulacaoDocument,
} from '../simulate/schemas/simulacao.schema';
import { User, UserDocument } from './schemas/user.schema';

export interface UserOnboardingStatusPayload {
    completedFirstSimulation: boolean;
    linkedCnpj: boolean;
    subscribedPlan: boolean;
}

export interface UserMonthlyClosingSummaryPayload {
    lastSimulationInMonth: {
        createdAt: Date;
        dasEstimado: number | null;
        rbt12: number | null;
    } | null;
    fiscalObligationsPreview: Awaited<
        ReturnType<FiscalReminderService['getDashboardSummary']>
    >['obrigacoesProximas'];
    revenueUpdateSuggested: boolean;
    rbt12FromLastSimulation: number | null;
}

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Simulacao.name)
        private readonly simulacaoModel: Model<SimulacaoDocument>,
        @Inject(forwardRef(() => FiscalReminderService))
        private readonly fiscalReminderService: FiscalReminderService
    ) {}

    async findById(id: string) {
        const user = await this.userModel.findById(id).select('-password').lean();
        if (!user) {
            return null;
        }

        const normalizedPlanSlug = normalizePlanSlug(user.plano?.slug);
        const plano = user.plano
            ? {
                  titulo:
                      getPlanDefinition(normalizedPlanSlug)?.name ??
                      user.plano.titulo,
                  slug: normalizedPlanSlug ?? user.plano.slug,
                  valor: user.plano.valor,
                  ciclo: user.plano.ciclo,
                  dataAdmissao: user.plano.dataAdmissao,
                  dataVencimento: user.plano.dataVencimento,
                  ...(user.plano.pausadoAte
                      ? { pausadoAte: user.plano.pausadoAte }
                      : {}),
                  ...(user.plano.subscriptionFreeTrialPhaseEndsAt
                      ? {
                            subscriptionFreeTrialPhaseEndsAt:
                                user.plano.subscriptionFreeTrialPhaseEndsAt,
                        }
                      : {}),
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
            automaticSubscriptionRenewalCancelledAtPeriodEnd: Boolean(
                user.automaticSubscriptionRenewalCancelledAtPeriodEnd
            ),
            subscriptionFreeTrialPreviouslyUsed: Boolean(
                user.subscriptionFreeTrialPreviouslyUsed
            ),
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
            automaticSubscriptionRenewalCancelledAtPeriodEnd: Boolean(
                user.automaticSubscriptionRenewalCancelledAtPeriodEnd
            ),
            subscriptionFreeTrialPreviouslyUsed: Boolean(
                user.subscriptionFreeTrialPreviouslyUsed
            ),
        };
    }

    async getOnboardingStatus(
        userId: string
    ): Promise<UserOnboardingStatusPayload | null> {
        const user = await this.findById(userId);
        if (!user) {
            return null;
        }

        const simulationCount = await this.simulacaoModel.countDocuments({
            userId,
        });
        const companyRecord = user.empresa as { cnpj?: string } | undefined;
        const normalizedCnpjDigits = companyRecord?.cnpj
            ? String(companyRecord.cnpj).replace(/\D/g, '')
            : '';

        return {
            completedFirstSimulation: simulationCount > 0,
            linkedCnpj: normalizedCnpjDigits.length === 14,
            subscribedPlan: Boolean(user.plano),
        };
    }

    async getMonthlySummary(
        userId: string
    ): Promise<UserMonthlyClosingSummaryPayload | null> {
        const user = await this.userModel
            .findById(userId)
            .select('-password')
            .lean();
        if (!user) {
            return null;
        }

        const referenceDate = new Date();
        const monthStart = new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth(),
            1
        );
        const monthEnd = new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth() + 1,
            1
        );
        const lastSimulationInMonth = await this.simulacaoModel
            .findOne({
                userId,
                createdAt: {
                    $gte: monthStart,
                    $lt: monthEnd,
                },
            })
            .sort({ createdAt: -1 })
            .lean();
        const fiscalReminderDashboardSummary =
            await this.fiscalReminderService.getDashboardSummary(userId);
        const fiscalObligationsPreview =
            fiscalReminderDashboardSummary.obrigacoesProximas;
        const resultado = lastSimulationInMonth?.resultado as
            | { dasEstimado?: number }
            | undefined;
        const rbt12FromLastSimulation =
            typeof lastSimulationInMonth?.rbt12 === 'number'
                ? lastSimulationInMonth.rbt12
                : null;
        const lastSimulationRecord = lastSimulationInMonth as unknown as {
            createdAt: Date;
        };

        return {
            lastSimulationInMonth: lastSimulationInMonth
                ? {
                      createdAt: lastSimulationRecord.createdAt,
                      dasEstimado:
                          typeof resultado?.dasEstimado === 'number'
                              ? resultado.dasEstimado
                              : null,
                      rbt12: rbt12FromLastSimulation,
                  }
                : null,
            fiscalObligationsPreview,
            revenueUpdateSuggested: !lastSimulationInMonth,
            rbt12FromLastSimulation,
        };
    }

    async findUsersEligibleForMonthlyClosingEmail(): Promise<
        Array<{ email: string; nome?: string }>
    > {
        const now = new Date();
        const users = await this.userModel
            .find({
                email: { $exists: true, $nin: ['', null] },
                plano: { $exists: true, $ne: null },
                'plano.dataVencimento': { $gte: now },
            })
            .select('email nome')
            .lean();

        return users.map((document) => ({
            email: document.email,
            nome: document.nome,
        }));
    }
}
