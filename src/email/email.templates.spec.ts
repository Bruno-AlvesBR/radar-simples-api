import {
  buildFiscalReminderEmail,
  buildPlanCancellationEmail,
  buildPlanSubscriptionEmail,
  buildPlanUpgradeEmail,
  buildUserRegistrationEmail,
} from './email.templates';

describe('email templates', () => {
  it('deve gerar template de cadastro com acesso à plataforma', () => {
    const template = buildUserRegistrationEmail({
      recipientEmail: 'cliente@exemplo.com',
      recipientName: 'Cliente Exemplo',
      dashboardUrl: 'http://localhost:4200/app/dashboard',
    });

    expect(template.subject).toBe('Bem-vindo ao Radar do Simples');
    expect(template.text).toContain('Acessar plataforma');
    expect(template.html).toContain('Sua conta foi criada com sucesso');
  });

  it('deve gerar template de assinatura do plano com dados do ciclo', () => {
    const template = buildPlanSubscriptionEmail({
      recipientEmail: 'cliente@exemplo.com',
      recipientName: 'Cliente Exemplo',
      planName: 'Controle',
      cycle: 'mensal',
      planValue: 19.9,
      dashboardUrl: 'http://localhost:4200/app/dashboard',
    });

    expect(template.subject).toBe('Sua assinatura foi ativada');
    expect(template.text).toContain('Controle');
    expect(template.text).toContain('R$ 19,90');
  });

  it('deve gerar template de cancelamento com link para planos', () => {
    const template = buildPlanCancellationEmail({
      recipientEmail: 'cliente@exemplo.com',
      recipientName: 'Cliente Exemplo',
      planName: 'Controle',
      canceledAt: new Date('2026-04-19T00:00:00.000Z'),
      plansUrl: 'http://localhost:4200/planos',
    });

    expect(template.subject).toBe('Sua assinatura foi cancelada');
    expect(template.text).toContain('Ver planos');
    expect(template.text).toContain('Data do cancelamento');
  });

  it('deve gerar template de cancelamento da renovação com data de acesso', () => {
    const template = buildPlanCancellationEmail({
      recipientEmail: 'cliente@exemplo.com',
      recipientName: 'Cliente Exemplo',
      planName: 'Essencial',
      canceledAt: new Date('2026-04-19T00:00:00.000Z'),
      plansUrl: 'http://localhost:4200/planos',
      subscriptionAccessRemainsThroughDate: new Date(
        '2026-05-19T00:00:00.000Z'
      ),
    });

    expect(template.subject).toBe(
      'Renovação cancelada: sem nova cobrança automática'
    );
    expect(template.text).toContain('Acesso completo até');
    expect(template.text).toContain('Ver planos');
  });

  it('deve gerar template de upgrade com diferença cobrada', () => {
    const template = buildPlanUpgradeEmail({
      recipientEmail: 'cliente@exemplo.com',
      recipientName: 'Cliente Exemplo',
      currentPlanName: 'Essencial',
      nextPlanName: 'Controle',
      cycle: 'mensal',
      planValue: 19.9,
      upgradeValue: 29.9,
      dashboardUrl: 'http://localhost:4200/app/dashboard',
    });

    expect(template.subject).toBe('Upgrade de plano confirmado');
    expect(template.text).toContain('Essencial');
    expect(template.text).toContain('Cobrança do upgrade');
  });

  it('deve gerar template do calendário fiscal com CTA para o painel', () => {
    const template = buildFiscalReminderEmail({
      recipientEmail: 'cliente@exemplo.com',
      recipientName: 'Cliente Exemplo',
      obligationName: 'DAS',
      dueDate: new Date('2026-04-25T00:00:00.000Z'),
      daysRemaining: 6,
      daysAhead: 7,
      dashboardUrl: 'http://localhost:4200/app/dashboard',
    });

    expect(template.subject).toContain('vencimento de DAS');
    expect(template.text).toContain('Abrir painel');
    expect(template.text).toContain('6');
  });
});
