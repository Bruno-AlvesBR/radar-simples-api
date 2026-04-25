import {
  CheckoutConfirmationEmailPayload,
  FiscalReminderEmailPayload,
  PlanCancellationEmailPayload,
  PlanSubscriptionEmailPayload,
  PlanUpgradeEmailPayload,
  SupportTicketEmailPayload,
  UserRegistrationEmailPayload,
  MonthlyClosingReminderEmailPayload,
} from './email.types';

interface EmailActionLink {
  label: string;
  url: string;
}

interface EmailDetailItem {
  label: string;
  value: string;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
  text: string;
}

interface EmailTemplateInput {
  subject: string;
  heading: string;
  greetingName?: string;
  openingParagraphs: string[];
  details?: EmailDetailItem[];
  action?: EmailActionLink;
  closingParagraphs?: string[];
  footerNote?: string;
}

function getGreetingName(recipientName?: string) {
  return recipientName?.trim() || 'cliente';
}

function escapeHtmlContent(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatCurrencyValue(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateValue(value: Date) {
  return value.toLocaleDateString('pt-BR');
}

function buildEmailTemplate(input: EmailTemplateInput): EmailTemplateResult {
  const greetingName = getGreetingName(input.greetingName);
  const openingParagraphsHtml = input.openingParagraphs
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #334155;">${escapeHtmlContent(
          paragraph
        ).replaceAll('\n', '<br />')}</p>`
    )
    .join('');

  const detailsHtml =
    input.details && input.details.length > 0
      ? `
        <div style="margin: 24px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${input.details
                .map(
                  (detail) => `
                    <tr>
                      <td style="padding: 10px 0; font-size: 13px; color: #64748b; width: 38%; vertical-align: top;">${escapeHtmlContent(
                        detail.label
                      )}</td>
                      <td style="padding: 10px 0; font-size: 15px; color: #0f172a; font-weight: 600; vertical-align: top;">${escapeHtmlContent(
                        detail.value
                      )}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
      : '';

  const actionHtml = input.action
    ? `
      <div style="margin: 28px 0;">
        <a href="${escapeHtmlContent(
          input.action.url
        )}" style="display: inline-block; padding: 14px 22px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700;">${escapeHtmlContent(
        input.action.label
      )}</a>
      </div>
    `
    : '';

  const closingParagraphsHtml = (input.closingParagraphs ?? [])
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 12px; font-size: 15px; line-height: 1.7; color: #334155;">${escapeHtmlContent(
          paragraph
        ).replaceAll('\n', '<br />')}</p>`
    )
    .join('');

  const footerNoteHtml = input.footerNote
    ? `<div style="padding: 20px 32px 28px; font-size: 12px; line-height: 1.6; color: #64748b; border-top: 1px solid #e2e8f0;">${escapeHtmlContent(
        input.footerNote
      )}</div>`
    : '';

  const textLines = [
    input.heading,
    `Olá, ${greetingName}.`,
    ...input.openingParagraphs,
    ...(input.details ?? []).map(
      (detail) => `${detail.label}: ${detail.value}`
    ),
    input.action ? `${input.action.label}: ${input.action.url}` : '',
    ...(input.closingParagraphs ?? []),
    input.footerNote ?? '',
  ].filter(Boolean);

  return {
    subject: input.subject,
    html: `
      <div style="margin: 0; padding: 24px 12px; background: #f1f5f9; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
          <div style="padding: 28px 32px; background: linear-gradient(135deg, #2563eb, #0f172a); color: #ffffff;">
            <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8;">Radar do Simples</div>
            <div style="margin-top: 10px; font-size: 24px; line-height: 1.3; font-weight: 700;">${escapeHtmlContent(
              input.heading
            )}</div>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #334155;">Olá, ${escapeHtmlContent(
              greetingName
            )}.</p>
            ${openingParagraphsHtml}
            ${detailsHtml}
            ${actionHtml}
            ${closingParagraphsHtml}
          </div>
          ${footerNoteHtml}
        </div>
      </div>
    `,
    text: textLines.join('\n\n'),
  };
}

export function buildSupportTicketEmail(
  payload: SupportTicketEmailPayload
): EmailTemplateResult {
  const greetingName = getGreetingName(payload.recipientName);
  return buildEmailTemplate({
    subject: `Radar do Simples: ${payload.subject}`,
    heading: 'Chamado de suporte recebido',
    greetingName,
    openingParagraphs: [
      'Recebemos seu chamado de suporte e vamos analisar o quanto antes.',
    ],
    details: [
      { label: 'Assunto', value: payload.subject },
      { label: 'Mensagem', value: payload.message },
    ],
    closingParagraphs: [
      'Se precisar complementar a solicitação, responda este e-mail com as novas informações.',
    ],
    footerNote: 'Este é um e-mail automático de confirmação de atendimento.',
  });
}

export function buildUserRegistrationEmail(
  payload: UserRegistrationEmailPayload
): EmailTemplateResult {
  const greetingName = getGreetingName(payload.recipientName);
  return buildEmailTemplate({
    subject: 'Bem-vindo ao Radar do Simples',
    heading: 'Sua conta foi criada com sucesso',
    greetingName,
    openingParagraphs: [
      'Agora você já pode acessar a plataforma, configurar sua empresa e usar os recursos disponíveis no seu plano.',
    ],
    action: {
      label: 'Acessar plataforma',
      url: payload.dashboardUrl,
    },
    closingParagraphs: [
      'Se você ainda não configurou sua empresa, esse é o próximo passo recomendado.',
    ],
    footerNote:
      'Se você não reconhece este cadastro, desconsidere este e-mail.',
  });
}

export function buildPlanSubscriptionEmail(
  payload: PlanSubscriptionEmailPayload
): EmailTemplateResult {
  const greetingName = getGreetingName(payload.recipientName);
  const formattedValue = formatCurrencyValue(payload.planValue);
  const cycleLabel = payload.cycle === 'anual' ? 'anual' : 'mensal';

  return buildEmailTemplate({
    subject: 'Sua assinatura foi ativada',
    heading: 'Assinatura confirmada',
    greetingName,
    openingParagraphs: [
      `Sua assinatura do plano ${payload.planName} foi ativada com sucesso.`,
    ],
    details: [
      { label: 'Plano', value: payload.planName },
      { label: 'Ciclo', value: cycleLabel },
      { label: 'Valor', value: `R$ ${formattedValue}` },
    ],
    action: {
      label: 'Acessar painel',
      url: payload.dashboardUrl,
    },
    closingParagraphs: [
      'Seu acesso completo já está disponível na plataforma.',
    ],
  });
}

export function buildCheckoutConfirmationEmail(
  payload: CheckoutConfirmationEmailPayload
): EmailTemplateResult {
  return buildPlanSubscriptionEmail(payload);
}

export function buildPlanCancellationEmail(
  payload: PlanCancellationEmailPayload
): EmailTemplateResult {
  const greetingName = getGreetingName(payload.recipientName);

  if (payload.subscriptionAccessRemainsThroughDate) {
    const accessThroughLabel = formatDateValue(
      payload.subscriptionAccessRemainsThroughDate
    );
    return buildEmailTemplate({
      subject: 'Renovação cancelada: sem nova cobrança automática',
      heading: 'Renovação automática desativada',
      greetingName,
      openingParagraphs: [
        `Registramos o cancelamento da renovação do plano ${payload.planName}.`,
        `Não haverá cobrança automática no próximo ciclo. O acesso completo à plataforma permanece até ${accessThroughLabel}, conforme o período já pago ou em vigor.`,
      ],
      details: [
        { label: 'Plano', value: payload.planName },
        {
          label: 'Pedido registrado em',
          value: formatDateValue(payload.canceledAt),
        },
        {
          label: 'Acesso completo até',
          value: accessThroughLabel,
        },
      ],
      action: {
        label: 'Ver planos',
        url: payload.plansUrl,
      },
      closingParagraphs: [
        'Depois dessa data, você pode assinar novamente quando quiser.',
      ],
    });
  }

  return buildEmailTemplate({
    subject: 'Sua assinatura foi cancelada',
    heading: 'Cancelamento concluído',
    greetingName,
    openingParagraphs: [
      `Sua assinatura do plano ${payload.planName} foi cancelada com sucesso.`,
    ],
    details: [
      { label: 'Plano', value: payload.planName },
      {
        label: 'Data do cancelamento',
        value: formatDateValue(payload.canceledAt),
      },
    ],
    action: {
      label: 'Ver planos',
      url: payload.plansUrl,
    },
    closingParagraphs: [
      'Se quiser voltar, basta escolher um novo plano quando for o momento certo.',
    ],
  });
}

export function buildPlanUpgradeEmail(
  payload: PlanUpgradeEmailPayload
): EmailTemplateResult {
  const greetingName = getGreetingName(payload.recipientName);
  const formattedPlanValue = formatCurrencyValue(payload.planValue);
  const formattedUpgradeValue =
    typeof payload.upgradeValue === 'number'
      ? `R$ ${formatCurrencyValue(payload.upgradeValue)}`
      : 'Não cobrado';
  const cycleLabel = payload.cycle === 'anual' ? 'anual' : 'mensal';

  return buildEmailTemplate({
    subject: 'Upgrade de plano confirmado',
    heading: 'Seu upgrade foi concluído',
    greetingName,
    openingParagraphs: [
      `A mudança do plano ${payload.currentPlanName} para ${payload.nextPlanName} foi concluída com sucesso.`,
    ],
    details: [
      { label: 'Plano anterior', value: payload.currentPlanName },
      { label: 'Novo plano', value: payload.nextPlanName },
      { label: 'Ciclo', value: cycleLabel },
      { label: 'Valor do plano', value: `R$ ${formattedPlanValue}` },
      { label: 'Cobrança do upgrade', value: formattedUpgradeValue },
    ],
    action: {
      label: 'Acessar painel',
      url: payload.dashboardUrl,
    },
    closingParagraphs: [
      'As novas funcionalidades já estão liberadas na sua conta.',
    ],
  });
}

export function buildFiscalReminderEmail(
  payload: FiscalReminderEmailPayload
): EmailTemplateResult {
  const greetingName = getGreetingName(payload.recipientName);
  const formattedDueDate = formatDateValue(payload.dueDate);

  return buildEmailTemplate({
    subject: `Radar do Simples: vencimento de ${payload.obligationName}`,
    heading: 'Lembrete do calendário fiscal',
    greetingName,
    openingParagraphs: [
      `Seu lembrete de ${payload.obligationName} está próximo.`,
    ],
    details: [
      { label: 'Obrigação', value: payload.obligationName },
      { label: 'Vencimento', value: formattedDueDate },
      { label: 'Dias restantes', value: String(payload.daysRemaining) },
      { label: 'Antecedência configurada', value: `${payload.daysAhead} dias` },
    ],
    action: {
      label: 'Abrir painel',
      url: payload.dashboardUrl,
    },
    closingParagraphs: [
      'Este aviso é apenas informativo e não substitui análise contábil.',
    ],
    footerNote:
      'Acompanhe o calendário fiscal para não perder os próximos vencimentos.',
  });
}

export function buildMonthlyClosingReminderEmail(
  payload: MonthlyClosingReminderEmailPayload
): EmailTemplateResult {
  const greetingName = getGreetingName(payload.recipientName);

  return buildEmailTemplate({
    subject: 'É hora de fechar o mês da sua PJ',
    heading: 'Fechamento mensal no Radar do Simples',
    greetingName,
    openingParagraphs: [
      'Iniciamos um novo mês e este é o melhor momento para revisar faturamento, DAS estimado e obrigações fiscais da sua empresa.',
      'Abra o painel, atualize sua última simulação e confira o calendário fiscal para não perder prazos.',
    ],
    action: {
      label: 'Abrir painel e revisar',
      url: payload.dashboardUrl,
    },
    closingParagraphs: [
      'Este lembrete é informativo. Valide sempre os valores com o seu contador.',
    ],
  });
}
