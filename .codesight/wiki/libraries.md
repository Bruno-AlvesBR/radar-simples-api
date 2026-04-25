# Libraries

> **Navigation aid.** Library inventory extracted via AST. Read the source files listed here before modifying exported functions.

**65 library files** across 16 modules

## Auth (9 files)

- `src\auth\google.strategy.ts` — GoogleStrategy, GoogleProfile
- `src\auth\auth.controller.ts` — AuthController
- `src\auth\auth.module.ts` — AuthModule
- `src\auth\auth.service.ts` — AuthService
- `src\auth\dto\login.dto.ts` — LoginDto
- `src\auth\dto\register.dto.ts` — RegisterDto
- `src\auth\google-auth.guard.ts` — GoogleAuthGuard
- `src\auth\jwt-auth.guard.ts` — JwtAuthGuard
- `src\auth\jwt.strategy.ts` — JwtStrategy

## Simulate (6 files)

- `src\simulate\schemas\simulacao.schema.ts` — Simulacao, SimulacaoDocument, SimulacaoSchema
- `src\simulate\dto\projection.dto.ts` — ProjectionDto
- `src\simulate\dto\simulate.dto.ts` — SimulateDto
- `src\simulate\simulate.controller.ts` — SimulateController
- `src\simulate\simulate.module.ts` — SimulateModule
- `src\simulate\simulate.service.ts` — SimulateService

## Blog (5 files)

- `src\blog\schemas\article.schema.ts` — ArticleReference, ArticleSection, Article, ArticleDocument, ArticleSchema
- `src\blog\blog.controller.ts` — BlogController
- `src\blog\blog.module.ts` — BlogModule
- `src\blog\blog.service.ts` — BlogService
- `src\blog\dto\create-article.dto.ts` — CreateArticleDto

## Checkout (5 files)

- `src\checkout\checkout-webhook.controller.ts` — CheckoutWebhookController
- `src\checkout\checkout.controller.ts` — CheckoutController
- `src\checkout\checkout.module.ts` — CheckoutModule
- `src\checkout\checkout.service.ts` — CheckoutService
- `src\checkout\dto\create-session.dto.ts` — CreateSessionDto

## Leads (5 files)

- `src\leads\schemas\lead.schema.ts` — Lead, LeadDocument, LeadSchema
- `src\leads\dto\create-lead.dto.ts` — CreateLeadDto
- `src\leads\leads.controller.ts` — LeadsController
- `src\leads\leads.module.ts` — LeadsModule
- `src\leads\leads.service.ts` — LeadsService

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

## Fiscal-reminder (4 files)

- `src\fiscal-reminder\fiscal-reminder.service.ts` — FiscalReminderService, FiscalObligationSummaryItem, FiscalReminderSummary
- `src\fiscal-reminder\dto\update-fiscal-reminder.dto.ts` — UpdateFiscalReminderDto
- `src\fiscal-reminder\fiscal-reminder.controller.ts` — FiscalReminderController
- `src\fiscal-reminder\fiscal-reminder.module.ts` — FiscalReminderModule

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
- `src\user\user.controller.ts` — UserController
- `src\user\user.module.ts` — UserModule
- `src\user\user.service.ts` — UserService

## Cnpj (3 files)

- `src\cnpj\cnpj.controller.ts` — CnpjController
- `src\cnpj\cnpj.module.ts` — CnpjModule
- `src\cnpj\cnpj.service.ts` — CnpjService

## Stats (3 files)

- `src\stats\stats.service.ts` — StatsService, PublicStatisticsPayload
- `src\stats\stats.controller.ts` — StatsController
- `src\stats\stats.module.ts` — StatsModule

## Seo-autopilot (2 files)

- `src\seo-autopilot\seo-autopilot.module.ts` — SeoAutopilotModule
- `src\seo-autopilot\seo-autopilot.service.ts` — SeoAutopilotService

## App.module.ts (1 files)

- `src\app.module.ts` — AppModule

## Engine (1 files)

- `src\engine\simples-nacional.engine.ts` — calculateFatorR, getAnexoAplicavel, calculateAliquotaEfetiva, calculateDas, calculateProLaboreMinimo, calculateLucroDistribuivel, …

---
_Back to [overview.md](./overview.md)_