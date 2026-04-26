import {
    ForbiddenException,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { EmailService } from '../email/email.service';
import { isPlanAtLeast, normalizePlanSlug, PlanSlug } from '../plans/plan.constants';
import { UserService } from '../user/user.service';
import { UpdateFiscalReminderDto } from './dto/update-fiscal-reminder.dto';
import {
    buildFiscalObligations,
    FiscalObligationResult,
} from './fiscal-obligation.helper';
import {
    FiscalReminder,
    FiscalReminderDocument,
} from './schemas/fiscal-reminder.schema';

export interface FiscalReminderSummary {
    accessAllowed: boolean;
    planSlug: PlanSlug | null;
    diasAntecedenciaPermitidos: number[];
    diasAntecedenciaSelecionados: number[];
    obrigacoesProximas: FiscalObligationResult[];
}

@Injectable()
export class FiscalReminderService {
    constructor(
        @InjectModel(FiscalReminder.name)
        private readonly fiscalReminderModel: Model<FiscalReminderDocument>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly emailService: EmailService,
        private readonly configurationService: ConfigService
    ) {}

    async getSummary(userId: string): Promise<FiscalReminderSummary> {
        return this.getDashboardSummary(userId);
    }

    async updateSummary(
        userId: string,
        updateFiscalReminderData: UpdateFiscalReminderDto
    ): Promise<FiscalReminderSummary> {
        return this.updatePreferences(userId, updateFiscalReminderData);
    }

    async getDashboardSummary(userId: string): Promise<FiscalReminderSummary> {
        const user = await this.userService.findById(userId);
        const planSlug = normalizePlanSlug(user?.plano?.slug);
        const accessAllowed = isPlanAtLeast(user?.plano?.slug, 'essencial');
        const diasAntecedenciaPermitidos = this.getAllowedReminderDays(planSlug);
        const reminder = await this.findOrCreateReminder(userId, planSlug);
        const obrigacoesProximas = buildFiscalObligations(
            new Date(),
            user?.empresa ?? null
        ).sort((firstObligation, secondObligation) => {
            return firstObligation.daysRemaining - secondObligation.daysRemaining;
        });

        return {
            accessAllowed,
            planSlug,
            diasAntecedenciaPermitidos,
            diasAntecedenciaSelecionados: reminder.diasAntecedencia,
            obrigacoesProximas,
        };
    }

    async updatePreferences(
        userId: string,
        updateFiscalReminderData: UpdateFiscalReminderDto
    ): Promise<FiscalReminderSummary> {
        const user = await this.userService.findById(userId);
        if (!isPlanAtLeast(user?.plano?.slug, 'essencial')) {
            throw new ForbiddenException(
                'Calendário fiscal disponível no Essencial. Assine em Planos.'
            );
        }

        const planSlug = normalizePlanSlug(user?.plano?.slug);
        const diasAntecedenciaPermitidos = this.getAllowedReminderDays(planSlug);
        const diasAntecedenciaSelecionados = this.normalizeSelectedDays(
            planSlug,
            updateFiscalReminderData.diasAntecedencia
        );

        const reminder = await this.fiscalReminderModel.findOneAndUpdate(
            { userId },
            {
                userId,
                diasAntecedencia: diasAntecedenciaSelecionados,
                ativo: updateFiscalReminderData.ativo ?? true,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const obrigacoesProximas = buildFiscalObligations(
            new Date(),
            user?.empresa ?? null
        ).sort((firstObligation, secondObligation) => {
            return firstObligation.daysRemaining - secondObligation.daysRemaining;
        });

        return {
            accessAllowed: true,
            planSlug,
            diasAntecedenciaPermitidos,
            diasAntecedenciaSelecionados:
                reminder?.diasAntecedencia ?? diasAntecedenciaSelecionados,
            obrigacoesProximas,
        };
    }

    @Cron('0 9 1 * *')
    async dispatchMonthlyClosingReminders() {
        try {
            const recipients =
                await this.userService.findUsersEligibleForMonthlyClosingEmail();

            for (const recipient of recipients) {
                try {
                    await this.emailService.sendMonthlyClosingReminder({
                        recipientEmail: recipient.email,
                        recipientName: recipient.nome,
                        dashboardUrl: `${this.getFrontendUrl()}/app/dashboard`,
                    });
                } catch {
                    continue;
                }
            }
        } catch {
            return;
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async dispatchDueReminders() {
        try {
            const reminders = await this.fiscalReminderModel
                .find({ ativo: true })
                .lean();

            for (const reminder of reminders) {
                const user = await this.userService.findById(reminder.userId);
                if (!isPlanAtLeast(user?.plano?.slug, 'essencial')) {
                    continue;
                }

                const ultimoEnvioEm = reminder.ultimoEnvioEm
                    ? new Date(reminder.ultimoEnvioEm)
                    : null;
                if (
                    ultimoEnvioEm &&
                    ultimoEnvioEm.toDateString() === new Date().toDateString()
                ) {
                    continue;
                }

                const obligations = buildFiscalObligations(
                    new Date(),
                    user?.empresa ?? null
                );

                for (const obligation of obligations) {
                    if (!reminder.diasAntecedencia.includes(obligation.daysRemaining)) {
                        continue;
                    }

                    try {
                        await this.emailService.sendFiscalReminder({
                            recipientEmail: user?.email ?? '',
                            recipientName: user?.nome ?? undefined,
                            obligationName: obligation.name,
                            dueDate: obligation.dueDate,
                            daysRemaining: obligation.daysRemaining,
                            daysAhead: obligation.daysRemaining,
                            dashboardUrl: `${this.getFrontendUrl()}/app/dashboard`,
                        });
                        await this.fiscalReminderModel.updateOne(
                            { _id: reminder._id },
                            { ultimoEnvioEm: new Date() }
                        );
                    } catch {
                        continue;
                    }
                }
            }
        } catch {
            return;
        }
    }

    private async findOrCreateReminder(
        userId: string,
        planSlug: PlanSlug | null
    ) {
        const existingReminder = await this.fiscalReminderModel.findOne({
            userId,
        });

        if (existingReminder) {
            existingReminder.diasAntecedencia = this.normalizeSelectedDays(
                planSlug,
                existingReminder.diasAntecedencia
            );
            await existingReminder.save();
            return existingReminder;
        }

        return this.fiscalReminderModel.create({
            userId,
            diasAntecedencia: this.getAllowedReminderDays(planSlug),
            ativo: true,
        });
    }

    private normalizeSelectedDays(
        planSlug: PlanSlug | null,
        selectedDays?: number[]
    ) {
        const allowedDays = this.getAllowedReminderDays(planSlug);
        const providedDays = (selectedDays ?? []).filter((day) =>
            allowedDays.includes(day)
        );

        if (providedDays.length > 0) {
            return Array.from(new Set(providedDays)).sort(
                (firstDay, secondDay) => firstDay - secondDay
            );
        }

        return allowedDays;
    }

    private getAllowedReminderDays(planSlug: PlanSlug | null) {
        if (!planSlug || planSlug === 'essencial') {
            return [7];
        }

        if (planSlug === 'controle' || planSlug === 'automacao') {
            return [3, 5, 7];
        }

        if (planSlug === 'pro') {
            return [1, 3, 5, 7, 15, 20, 30];
        }

        return [7];
    }

    private getFrontendUrl() {
        return (
            this.configurationService.get<string>(
                'FRONTEND_URL',
                'http://localhost:4200'
            ) ?? 'http://localhost:4200'
        );
    }
}
