import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import {
  CheckoutConfirmationEmailPayload,
  EmailRecipientMessage,
  FiscalReminderEmailPayload,
  PlanCancellationEmailPayload,
  PlanSubscriptionEmailPayload,
  PlanUpgradeEmailPayload,
  SupportTicketEmailPayload,
  UserRegistrationEmailPayload,
  MonthlyClosingReminderEmailPayload,
} from './email.types';
import {
  buildFiscalReminderEmail,
  buildPlanCancellationEmail,
  buildPlanSubscriptionEmail,
  buildPlanUpgradeEmail,
  buildUserRegistrationEmail,
  buildSupportTicketEmail,
  buildMonthlyClosingReminderEmail,
} from './email.templates';

interface SmtpConfiguration {
  host: string;
  port: number;
  user: string;
  password: string;
  fromName: string;
  fromAddress: string;
}

@Injectable()
export class EmailService {
  private smtpTransporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  async send(message: EmailRecipientMessage) {
    const smtpConfiguration = this.getSmtpConfiguration();
    const smtpTransporter = this.getSmtpTransporter(smtpConfiguration);
    const senderAddress =
      message.from ?? this.getDefaultFromAddress(smtpConfiguration);

    try {
      await smtpTransporter.sendMail({
        from: senderAddress,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
      });
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'Erro ao enviar e-mail.';
      throw new Error(messageError);
    }
  }

  async sendSupportTicketConfirmation(payload: SupportTicketEmailPayload) {
    const emailTemplate = buildSupportTicketEmail(payload);
    return this.sendTemplate({
      recipientEmail: payload.recipientEmail,
      emailTemplate,
      replyTo: this.configService.get<string>('EMAIL_REPLY_TO') ?? undefined,
    });
  }

  async sendUserRegistrationWelcome(payload: UserRegistrationEmailPayload) {
    const emailTemplate = buildUserRegistrationEmail(payload);
    return this.sendTemplate({
      recipientEmail: payload.recipientEmail,
      emailTemplate,
    });
  }

  async sendFiscalReminder(payload: FiscalReminderEmailPayload) {
    const emailTemplate = buildFiscalReminderEmail(payload);
    return this.sendTemplate({
      recipientEmail: payload.recipientEmail,
      emailTemplate,
    });
  }

  async sendMonthlyClosingReminder(payload: MonthlyClosingReminderEmailPayload) {
    const emailTemplate = buildMonthlyClosingReminderEmail(payload);
    return this.sendTemplate({
      recipientEmail: payload.recipientEmail,
      emailTemplate,
    });
  }

  async sendPlanSubscriptionConfirmation(
    payload: PlanSubscriptionEmailPayload
  ) {
    const emailTemplate = buildPlanSubscriptionEmail(payload);
    return this.sendTemplate({
      recipientEmail: payload.recipientEmail,
      emailTemplate,
    });
  }

  async sendCheckoutConfirmation(payload: CheckoutConfirmationEmailPayload) {
    return this.sendPlanSubscriptionConfirmation(payload);
  }

  async sendPlanCancellationConfirmation(
    payload: PlanCancellationEmailPayload
  ) {
    const emailTemplate = buildPlanCancellationEmail(payload);
    return this.sendTemplate({
      recipientEmail: payload.recipientEmail,
      emailTemplate,
    });
  }

  async sendPlanUpgradeConfirmation(payload: PlanUpgradeEmailPayload) {
    const emailTemplate = buildPlanUpgradeEmail(payload);
    return this.sendTemplate({
      recipientEmail: payload.recipientEmail,
      emailTemplate,
    });
  }

  private getDefaultFromAddress(smtpConfiguration: SmtpConfiguration) {
    return `${smtpConfiguration.fromName} <radarsimples@noreply.com>`;
  }

  private getSmtpTransporter(smtpConfiguration: SmtpConfiguration) {
    if (this.smtpTransporter) {
      return this.smtpTransporter;
    }

    this.smtpTransporter = createTransport({
      host: smtpConfiguration.host,
      port: smtpConfiguration.port,
      secure: smtpConfiguration.port === 465,
      auth: {
        user: smtpConfiguration.user,
        pass: smtpConfiguration.password,
      },
    });

    return this.smtpTransporter;
  }

  private async sendTemplate({
    recipientEmail,
    emailTemplate,
    replyTo,
  }: {
    recipientEmail: string;
    emailTemplate: { subject: string; html: string; text: string };
    replyTo?: string;
  }) {
    return this.send({
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      replyTo,
    });
  }

  private getSmtpConfiguration(): SmtpConfiguration {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const password = this.configService.get<string>('SMTP_PASSWORD');

    if (!host) {
      throw new Error('SMTP_HOST não configurado.');
    }

    if (!port) {
      throw new Error('SMTP_PORT não configurado.');
    }

    const portNumber = Number(port);
    if (!Number.isFinite(portNumber) || portNumber <= 0) {
      throw new Error('SMTP_PORT inválido.');
    }

    if (!user) {
      throw new Error('SMTP_USER não configurado.');
    }

    if (!password) {
      throw new Error('SMTP_PASSWORD não configurado.');
    }

    return {
      host,
      port: portNumber,
      user,
      password,
      fromName:
        this.configService.get<string>('SMTP_FROM_NAME') ??
        this.configService.get<string>('EMAIL_FROM_NAME') ??
        'Radar do Simples',
      fromAddress:
        this.configService.get<string>('SMTP_FROM_ADDRESS') ??
        this.configService.get<string>('EMAIL_FROM_ADDRESS') ??
        'radarsimples@noreply.com',
    };
  }
}
