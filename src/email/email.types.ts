export interface EmailRecipientMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SupportTicketEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  message: string;
}

export interface UserRegistrationEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  dashboardUrl: string;
}

export interface PlanSubscriptionEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  planName: string;
  cycle: 'mensal' | 'anual';
  planValue: number;
  dashboardUrl: string;
}

export type CheckoutConfirmationEmailPayload = PlanSubscriptionEmailPayload;

export interface PlanCancellationEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  planName: string;
  canceledAt: Date;
  plansUrl: string;
  subscriptionAccessRemainsThroughDate?: Date;
}

export interface PlanUpgradeEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  currentPlanName: string;
  nextPlanName: string;
  cycle: 'mensal' | 'anual';
  planValue: number;
  upgradeValue?: number;
  dashboardUrl: string;
}

export interface FiscalReminderEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  obligationName: string;
  dueDate: Date;
  daysRemaining: number;
  daysAhead: number;
  dashboardUrl: string;
}

export interface MonthlyClosingReminderEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  dashboardUrl: string;
}
