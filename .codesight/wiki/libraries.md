# Libraries

> **Navigation aid.** Library inventory extracted via AST. Read the source files listed here before modifying exported functions.

**91 library files** across 21 modules

## Auth (10 files)

- `src\auth\google.strategy.ts` — GoogleStrategy, GoogleProfile
- `src\auth\auth-cookie.service.ts` — AuthCookieService
- `src\auth\auth.controller.ts` — AuthController
- `src\auth\auth.module.ts` — AuthModule
- `src\auth\auth.service.ts` — AuthService
- `src\auth\dto\login.dto.ts` — LoginDto
- `src\auth\dto\register.dto.ts` — RegisterDto
- `src\auth\google-auth.guard.ts` — GoogleAuthGuard
- `src\auth\jwt-auth.guard.ts` — JwtAuthGuard
- `src\auth\jwt.strategy.ts` — JwtStrategy

## Checkout (8 files)

- `src\checkout\plan-change.utils.ts` — buildCheckoutPlanSummary, determinePlanChangeType, getFeaturesGained, getFeaturesLost, getPlanIntervalInSeconds, CheckoutPlanSummary, …
- `src\checkout\checkout.service.ts` — CheckoutService, UpgradeCheckoutSessionResponse, SubscriptionActionResult
- `src\checkout\checkout-webhook.controller.ts` — CheckoutWebhookController
- `src\checkout\checkout.controller.ts` — CheckoutController
- `src\checkout\checkout.module.ts` — CheckoutModule
- `src\checkout\dto\create-session.dto.ts` — CreateSessionDto
- `src\checkout\dto\upgrade-preview.query-dto.ts` — UpgradePreviewQueryDto
- `src\checkout\dto\upgrade-subscription.dto.ts` — UpgradeSubscriptionDto

## Simulate (7 files)

- `src\simulate\schemas\simulacao.schema.ts` — Simulacao, SimulacaoDocument, SimulacaoSchema
- `src\simulate\dto\compare-simulations.dto.ts` — CompareSimulationScenarioDto, CompareSimulationsDto
- `src\simulate\dto\projection.dto.ts` — ProjectionDto
- `src\simulate\dto\simulate.dto.ts` — SimulateDto
- `src\simulate\simulate.controller.ts` — SimulateController
- `src\simulate\simulate.module.ts` — SimulateModule
- `src\simulate\simulate.service.ts` — SimulateService

## Fiscal-reminder (6 files)

- `src\fiscal-reminder\fiscal-obligation.helper.ts` — isMeiCompany, getRelevantFiscalObligations, getNextDueDate, getDaysRemaining, buildFiscalObligations, FiscalObligationDefinition, …
- `src\fiscal-reminder\schemas\fiscal-reminder.schema.ts` — FiscalReminder, FiscalReminderDocument, FiscalReminderSchema
- `src\fiscal-reminder\fiscal-reminder.service.ts` — FiscalReminderService, FiscalReminderSummary
- `src\fiscal-reminder\dto\update-fiscal-reminder.dto.ts` — UpdateFiscalReminderDto
- `src\fiscal-reminder\fiscal-reminder.controller.ts` — FiscalReminderController
- `src\fiscal-reminder\fiscal-reminder.module.ts` — FiscalReminderModule

## Blog (5 files)

- `src\blog\schemas\article.schema.ts` — ArticleReference, ArticleSection, Article, ArticleDocument, ArticleSchema
- `src\blog\blog.controller.ts` — BlogController
- `src\blog\blog.module.ts` — BlogModule
- `src\blog\blog.service.ts` — BlogService
- `src\blog\dto\create-article.dto.ts` — CreateArticleDto

## Invoice-import (5 files)

- `src\invoice-import\schemas\invoice-record.schema.ts` — InvoiceRecord, InvoiceRecordDocument, InvoiceRecordSchema
- `src\invoice-import\invoice-import.helper.ts` — parseInvoiceRecords, ParsedInvoiceRecord
- `src\invoice-import\invoice-import.service.ts` — InvoiceImportService, ImportedInvoiceSummary
- `src\invoice-import\invoice-import.controller.ts` — InvoiceImportController
- `src\invoice-import\invoice-import.module.ts` — InvoiceImportModule

## Leads (5 files)

- `src\leads\schemas\lead.schema.ts` — Lead, LeadDocument, LeadSchema
- `src\leads\dto\create-lead.dto.ts` — CreateLeadDto
- `src\leads\leads.controller.ts` — LeadsController
- `src\leads\leads.module.ts` — LeadsModule
- `src\leads\leads.service.ts` — LeadsService

## Referral (5 files)

- `src\referral\schemas\referral-code.schema.ts` — ReferralCode, ReferralCodeDocument, ReferralCodeSchema
- `src\referral\schemas\referral.schema.ts` — Referral, ReferralDocument, ReferralSchema
- `src\referral\referral.controller.ts` — ReferralController
- `src\referral\referral.module.ts` — ReferralModule
- `src\referral\referral.service.ts` — ReferralService

## Support (5 files)

- `src\support\schemas\support-ticket.schema.ts` — SupportTicket, SupportTicketDocument, SupportTicketSchema
- `src\support\dto\create-support-ticket.dto.ts` — CreateSupportTicketDto
- `src\support\support.controller.ts` — SupportController
- `src\support\support.module.ts` — SupportModule
- `src\support\support.service.ts` — SupportService

## Content-generation (4 files)

- `src\content-generation\schemas\brand-voice.schema.ts` — BrandVoice, BrandVoiceDocument, BrandVoiceSchema
- `src\content-generation\content-generation.controller.ts` — ContentGenerationController
- `src\content-generation\content-generation.module.ts` — ContentGenerationModule
- `src\content-generation\content-generation.service.ts` — ContentGenerationService

## Keyword-research (4 files)

- `src\keyword-research\schemas\keyword-opportunity.schema.ts` — KeywordOpportunity, KeywordOpportunityDocument, KeywordOpportunitySchema
- `src\keyword-research\keyword-research.controller.ts` — KeywordResearchController
- `src\keyword-research\keyword-research.module.ts` — KeywordResearchModule
- `src\keyword-research\keyword-research.service.ts` — KeywordResearchService

## Seo-monitoring (4 files)

- `src\seo-monitoring\schemas\seo-metric.schema.ts` — SeoMetric, SeoMetricDocument, SeoMetricSchema
- `src\seo-monitoring\seo-monitoring.controller.ts` — SeoMonitoringController
- `src\seo-monitoring\seo-monitoring.module.ts` — SeoMonitoringModule
- `src\seo-monitoring\seo-monitoring.service.ts` — SeoMonitoringService

## User (4 files)

- `src\user\schemas\user.schema.ts` — Empresa, PlanoAssinatura, FiscalReminderPreferences, User, UserDocument, EmpresaSchema, …
- `src\user\user.service.ts` — UserService, UserOnboardingStatusPayload, UserMonthlyClosingSummaryPayload
- `src\user\user.controller.ts` — UserController
- `src\user\user.module.ts` — UserModule

## Cnpj (3 files)

- `src\cnpj\cnpj.controller.ts` — CnpjController
- `src\cnpj\cnpj.module.ts` — CnpjModule
- `src\cnpj\cnpj.service.ts` — CnpjService

## Email (3 files)

- `src\email\email.templates.ts` — buildSupportTicketEmail, buildUserRegistrationEmail, buildPlanSubscriptionEmail, buildCheckoutConfirmationEmail, buildPlanCancellationEmail, buildPlanUpgradeEmail, …
- `src\email\email.module.ts` — EmailModule
- `src\email\email.service.ts` — EmailService

## Engine (3 files)

- `src\engine\simples-nacional.engine.ts` — calculateFatorR, getAnexoAplicavel, calculateAliquotaEfetiva, calculateDas, calculateProLaboreMinimo, calculateLucroDistribuivel, …
- `src\engine\engine.controller.ts` — EngineController
- `src\engine\engine.module.ts` — EngineModule

## Reports (3 files)

- `src\reports\reports.service.ts` — ReportsService, MonthlyReportSimulationItem, MonthlyReportSummary
- `src\reports\reports.controller.ts` — ReportsController
- `src\reports\reports.module.ts` — ReportsModule

## Stats (3 files)

- `src\stats\stats.service.ts` — StatsService, PublicStatisticsPayload
- `src\stats\stats.controller.ts` — StatsController
- `src\stats\stats.module.ts` — StatsModule

## Seo-autopilot (2 files)

- `src\seo-autopilot\seo-autopilot.module.ts` — SeoAutopilotModule
- `src\seo-autopilot\seo-autopilot.service.ts` — SeoAutopilotService

## App.module.ts (1 files)

- `src\app.module.ts` — AppModule

## Plans (1 files)

- `src\plans\plan.constants.ts` — normalizePlanSlug, getPlanDefinition, isPlanAtLeast, getPlanDisplayName, getPlanFeatures, PlanDefinition, …

---
_Back to [overview.md](./overview.md)_