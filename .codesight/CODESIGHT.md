# radar-simples-api — AI Context Map

> **Stack:** nestjs | mongoose | unknown | typescript

> 46 routes | 15 models | 0 components | 91 lib files | 19 env vars | 10 middleware | 38% test coverage
> **Token savings:** this file is ~6.300 tokens. Without it, AI exploration would cost ~67.600 tokens. **Saves ~61.300 tokens per conversation.**
> **Last scanned:** 2026-04-26 05:01 — re-run after significant changes

---

# Routes

- `POST` `/auth/register` params() [auth] ✓
- `POST` `/auth/login` params() [auth] ✓
- `POST` `/auth/logout` params() [auth] ✓
- `GET` `/auth/google` params() [auth] ✓
- `GET` `/auth/google/callback` params() [auth] ✓
- `GET` `/blog/public` params()
- `GET` `/blog/public/:slug` params(slug)
- `POST` `/blog` params()
- `GET` `/blog/sitemap.xml` params()
- `POST` `/checkout/webhook` params() [payment]
- `GET` `/checkout/confirm` params() [auth, payment]
- `GET` `/checkout/upgrade/preview` params() [auth, payment]
- `POST` `/checkout/upgrade` params() [auth, payment]
- `POST` `/checkout/upgrade/session` params() [auth, payment]
- `POST` `/checkout/pause` params() [auth, payment]
- `POST` `/checkout/cancel` params() [auth, payment]
- `POST` `/checkout/session` params() [auth, payment]
- `GET` `/cnpj/:cnpj` params(cnpj) [auth]
- `POST` `/content-generation/brand-voice/default` params()
- `POST` `/content-generation/draft/generate` params()
- `GET` `/engine/metadata` params()
- `GET` `/fiscal-reminders/summary` params() [auth]
- `PUT` `/fiscal-reminders/summary` params() [auth]
- `POST` `/invoice-import/upload` params() [auth, upload]
- `GET` `/invoice-import/summary` params() [auth, upload]
- `GET` `/keyword-research` params()
- `POST` `/keyword-research/collect` params()
- `GET` `/keyword-research/best-next` params()
- `POST` `/leads` params()
- `GET` `/leads/stats` params()
- `GET` `/referral/code` params() [auth]
- `GET` `/referral/stats` params() [auth]
- `GET` `/reports/monthly` params() [auth]
- `POST` `/seo-monitoring/metrics` params()
- `GET` `/seo-monitoring/dashboard` params()
- `POST` `/simulate` params() [auth] ✓
- `POST` `/simulate/save` params() [auth] ✓
- `GET` `/simulate/projection` params() [auth] ✓
- `GET` `/simulate/history` params() [auth] ✓
- `POST` `/simulate/compare` params() [auth] ✓
- `GET` `/stats/public` params()
- `POST` `/support` params() [auth]
- `GET` `/user/me` params() [auth] ✓
- `PUT` `/user/empresa` params() [auth] ✓
- `GET` `/user/onboarding-status` params() [auth] ✓
- `GET` `/user/monthly-closing-summary` params() [auth] ✓

---

# Schema

### Article
- label: string
- url: string
- content: string
- slug: string
- title: string
- description: string
- focusKeyword: string
- keywords: string[]
- summaryParagraphs: string[]
- contentSections: articlesection[]
- references: articlereference[]
- scheduledPublishDate: date
- publishedAt: date
- seoScore: number
- wordCount: number
- readingTimeMinutes: number
- generatedByArtificialIntelligence: boolean
- sourceKeywordId: string

### BrandVoice
- profileIdentifier: string
- toneOfVoice: string
- targetAudience: string
- preferredTerms: string[]
- forbiddenTerms: string[]
- writingStyle: string

### FiscalReminder
- userId: string
- diasAntecedencia: number[]
- ativo: boolean
- ultimoEnvioEm: date

### InvoiceRecord
- userId: string
- issueDate: date
- amount: number
- competenceMonth: string
- sourceFileName: string

### KeywordOpportunity
- keyword: string
- searchVolume: number
- competitionDifficulty: number
- intentScore: number
- opportunityScore: number
- alreadyUsedForArticle: boolean

### Lead
- email: string
- origemCaptura: string
- metadata: record<string
- convertidoEmUsuario: boolean

### ReferralCode
- userId: string
- code: string

### Referral
- referrerUserId: string
- referredUserId: string
- referredEmail: string
- rewardApplied: boolean

### SeoMetric
- pageUrl: string
- keyword: string
- clicks: number
- impressions: number
- ctr: number
- position: number
- metricDate: string

### Simulacao
- userId: string
- faturamentoMensal: number
- folhaPagamento: number
- proLabore: number
- rbt12: number
- resultado: record<string

### SupportTicket
- userId: mongooseschema
- subject: string
- message: string

### Empresa
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- pausadoAte: date
- subscriptionFreeTrialPhaseEndsAt: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences
- automaticSubscriptionRenewalCancelledAtPeriodEnd: boolean
- subscriptionFreeTrialPreviouslyUsed: boolean

### PlanoAssinatura
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- pausadoAte: date
- subscriptionFreeTrialPhaseEndsAt: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences
- automaticSubscriptionRenewalCancelledAtPeriodEnd: boolean
- subscriptionFreeTrialPreviouslyUsed: boolean

### FiscalReminderPreferences
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- pausadoAte: date
- subscriptionFreeTrialPhaseEndsAt: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences
- automaticSubscriptionRenewalCancelledAtPeriodEnd: boolean
- subscriptionFreeTrialPreviouslyUsed: boolean

### User
- cnpj: string
- razaoSocial: string
- nomeFantasia: string
- situacao: string
- dataAbertura: string
- porte: string
- atividadePrincipal: string
- simples: boolean
- dataOpcaoSimples: string
- dadosCompletos: record<string
- titulo: string
- slug: string
- valor: number
- dataAdmissao: date
- dataVencimento: date
- pausadoAte: date
- subscriptionFreeTrialPhaseEndsAt: date
- diasAntecedencia: number[]
- ativo: boolean
- email: string
- password: string
- nome: string
- googleId: string
- emailVerified: boolean
- avatarUrl: string
- empresa: empresa
- plano: planoassinatura
- stripeCustomerId: string
- stripeSubscriptionId: string
- fiscalReminderPreferences: fiscalreminderpreferences
- automaticSubscriptionRenewalCancelledAtPeriodEnd: boolean
- subscriptionFreeTrialPreviouslyUsed: boolean

---

# Libraries

- `src\app.module.ts` — class AppModule
- `src\auth\auth-cookie.service.ts` — class AuthCookieService
- `src\auth\auth.controller.ts` — class AuthController
- `src\auth\auth.module.ts` — class AuthModule
- `src\auth\auth.service.ts` — class AuthService
- `src\auth\dto\login.dto.ts` — class LoginDto
- `src\auth\dto\register.dto.ts` — class RegisterDto
- `src\auth\google-auth.guard.ts` — class GoogleAuthGuard
- `src\auth\google.strategy.ts` — class GoogleStrategy, interface GoogleProfile
- `src\auth\jwt-auth.guard.ts` — class JwtAuthGuard
- `src\auth\jwt.strategy.ts` — class JwtStrategy
- `src\blog\blog.controller.ts` — class BlogController
- `src\blog\blog.module.ts` — class BlogModule
- `src\blog\blog.service.ts` — class BlogService
- `src\blog\dto\create-article.dto.ts` — class CreateArticleDto
- `src\blog\schemas\article.schema.ts`
  - class ArticleReference
  - class ArticleSection
  - class Article
  - type ArticleDocument
  - const ArticleSchema
- `src\checkout\checkout-webhook.controller.ts` — class CheckoutWebhookController
- `src\checkout\checkout.controller.ts` — class CheckoutController
- `src\checkout\checkout.module.ts` — class CheckoutModule
- `src\checkout\checkout.service.ts`
  - class CheckoutService
  - interface UpgradeCheckoutSessionResponse
  - interface SubscriptionActionResult
- `src\checkout\dto\create-session.dto.ts` — class CreateSessionDto
- `src\checkout\dto\upgrade-preview.query-dto.ts` — class UpgradePreviewQueryDto
- `src\checkout\dto\upgrade-subscription.dto.ts` — class UpgradeSubscriptionDto
- `src\checkout\plan-change.utils.ts`
  - function buildCheckoutPlanSummary: (planSlug, cycle, valorOverride?) => CheckoutPlanSummary
  - function determinePlanChangeType: (currentPlanSlug, nextPlanSlug, currentCycle, nextCycle) => PlanChangeType
  - function getFeaturesGained: (currentPlanSlug, nextPlanSlug) => void
  - function getFeaturesLost: (currentPlanSlug, nextPlanSlug) => void
  - function getPlanIntervalInSeconds: (cycle) => void
  - interface CheckoutPlanSummary
  - _...3 more_
- `src\cnpj\cnpj.controller.ts` — class CnpjController
- `src\cnpj\cnpj.module.ts` — class CnpjModule
- `src\cnpj\cnpj.service.ts` — class CnpjService
- `src\content-generation\content-generation.controller.ts` — class ContentGenerationController
- `src\content-generation\content-generation.module.ts` — class ContentGenerationModule
- `src\content-generation\content-generation.service.ts` — class ContentGenerationService
- `src\content-generation\schemas\brand-voice.schema.ts`
  - class BrandVoice
  - type BrandVoiceDocument
  - const BrandVoiceSchema
- `src\email\email.module.ts` — class EmailModule
- `src\email\email.service.ts` — class EmailService
- `src\email\email.templates.ts`
  - function buildSupportTicketEmail: (payload) => EmailTemplateResult
  - function buildUserRegistrationEmail: (payload) => EmailTemplateResult
  - function buildPlanSubscriptionEmail: (payload) => EmailTemplateResult
  - function buildCheckoutConfirmationEmail: (payload) => EmailTemplateResult
  - function buildPlanCancellationEmail: (payload) => EmailTemplateResult
  - function buildPlanUpgradeEmail: (payload) => EmailTemplateResult
  - _...2 more_
- `src\engine\engine.controller.ts` — class EngineController
- `src\engine\engine.module.ts` — class EngineModule
- `src\engine\simples-nacional.engine.ts`
  - function calculateFatorR: (folhaPagamento, proLabore, faturamentoMensal) => number
  - function getAnexoAplicavel: (fatorR) => 'III' | 'V'
  - function calculateAliquotaEfetiva: (rbt12, anexo) => void
  - function calculateDas: (faturamentoMensal, aliquotaEfetiva) => number
  - function calculateProLaboreMinimo: (faturamentoMensal, folhaPagamento) => number
  - function calculateLucroDistribuivel: (faturamentoMensal, das, folhaPagamento, proLabore) => number
  - _...3 more_
- `src\fiscal-reminder\dto\update-fiscal-reminder.dto.ts` — class UpdateFiscalReminderDto
- `src\fiscal-reminder\fiscal-obligation.helper.ts`
  - function isMeiCompany: (company) => void
  - function getRelevantFiscalObligations: (company) => void
  - function getNextDueDate: (referenceDate, definition) => void
  - function getDaysRemaining: (referenceDate, dueDate) => void
  - function buildFiscalObligations: (referenceDate, company) => void
  - interface FiscalObligationDefinition
  - _...3 more_
- `src\fiscal-reminder\fiscal-reminder.controller.ts` — class FiscalReminderController
- `src\fiscal-reminder\fiscal-reminder.module.ts` — class FiscalReminderModule
- `src\fiscal-reminder\fiscal-reminder.service.ts` — class FiscalReminderService, interface FiscalReminderSummary
- `src\fiscal-reminder\schemas\fiscal-reminder.schema.ts`
  - class FiscalReminder
  - type FiscalReminderDocument
  - const FiscalReminderSchema
- `src\invoice-import\invoice-import.controller.ts` — class InvoiceImportController
- `src\invoice-import\invoice-import.helper.ts` — function parseInvoiceRecords: (fileBuffer, fileName?) => void, interface ParsedInvoiceRecord
- `src\invoice-import\invoice-import.module.ts` — class InvoiceImportModule
- `src\invoice-import\invoice-import.service.ts` — class InvoiceImportService, interface ImportedInvoiceSummary
- `src\invoice-import\schemas\invoice-record.schema.ts`
  - class InvoiceRecord
  - type InvoiceRecordDocument
  - const InvoiceRecordSchema
- `src\keyword-research\keyword-research.controller.ts` — class KeywordResearchController
- `src\keyword-research\keyword-research.module.ts` — class KeywordResearchModule
- `src\keyword-research\keyword-research.service.ts` — class KeywordResearchService
- `src\keyword-research\schemas\keyword-opportunity.schema.ts`
  - class KeywordOpportunity
  - type KeywordOpportunityDocument
  - const KeywordOpportunitySchema
- `src\leads\dto\create-lead.dto.ts` — class CreateLeadDto
- `src\leads\leads.controller.ts` — class LeadsController
- `src\leads\leads.module.ts` — class LeadsModule
- `src\leads\leads.service.ts` — class LeadsService
- `src\leads\schemas\lead.schema.ts`
  - class Lead
  - type LeadDocument
  - const LeadSchema
- `src\plans\plan.constants.ts`
  - function normalizePlanSlug: (planSlug) => PlanSlug | null
  - function getPlanDefinition: (planSlug) => void
  - function isPlanAtLeast: (planSlug, requiredPlanSlug) => void
  - function getPlanDisplayName: (planSlug) => void
  - function getPlanFeatures: (planSlug) => void
  - interface PlanDefinition
  - _...4 more_
- `src\referral\referral.controller.ts` — class ReferralController
- `src\referral\referral.module.ts` — class ReferralModule
- `src\referral\referral.service.ts` — class ReferralService
- `src\referral\schemas\referral-code.schema.ts`
  - class ReferralCode
  - type ReferralCodeDocument
  - const ReferralCodeSchema
- `src\referral\schemas\referral.schema.ts`
  - class Referral
  - type ReferralDocument
  - const ReferralSchema
- `src\reports\reports.controller.ts` — class ReportsController
- `src\reports\reports.module.ts` — class ReportsModule
- `src\reports\reports.service.ts`
  - class ReportsService
  - interface MonthlyReportSimulationItem
  - interface MonthlyReportSummary
- `src\seo-autopilot\seo-autopilot.module.ts` — class SeoAutopilotModule
- `src\seo-autopilot\seo-autopilot.service.ts` — class SeoAutopilotService
- `src\seo-monitoring\schemas\seo-metric.schema.ts`
  - class SeoMetric
  - type SeoMetricDocument
  - const SeoMetricSchema
- `src\seo-monitoring\seo-monitoring.controller.ts` — class SeoMonitoringController
- `src\seo-monitoring\seo-monitoring.module.ts` — class SeoMonitoringModule
- `src\seo-monitoring\seo-monitoring.service.ts` — class SeoMonitoringService
- `src\simulate\dto\compare-simulations.dto.ts` — class CompareSimulationScenarioDto, class CompareSimulationsDto
- `src\simulate\dto\projection.dto.ts` — class ProjectionDto
- `src\simulate\dto\simulate.dto.ts` — class SimulateDto
- `src\simulate\schemas\simulacao.schema.ts`
  - class Simulacao
  - type SimulacaoDocument
  - const SimulacaoSchema
- `src\simulate\simulate.controller.ts` — class SimulateController
- `src\simulate\simulate.module.ts` — class SimulateModule
- `src\simulate\simulate.service.ts` — class SimulateService
- `src\stats\stats.controller.ts` — class StatsController
- `src\stats\stats.module.ts` — class StatsModule
- `src\stats\stats.service.ts` — class StatsService, interface PublicStatisticsPayload
- `src\support\dto\create-support-ticket.dto.ts` — class CreateSupportTicketDto
- `src\support\schemas\support-ticket.schema.ts`
  - class SupportTicket
  - type SupportTicketDocument
  - const SupportTicketSchema
- `src\support\support.controller.ts` — class SupportController
- `src\support\support.module.ts` — class SupportModule
- `src\support\support.service.ts` — class SupportService
- `src\user\schemas\user.schema.ts`
  - class Empresa
  - class PlanoAssinatura
  - class FiscalReminderPreferences
  - class User
  - type UserDocument
  - const EmpresaSchema
  - _...3 more_
- `src\user\user.controller.ts` — class UserController
- `src\user\user.module.ts` — class UserModule
- `src\user\user.service.ts`
  - class UserService
  - interface UserOnboardingStatusPayload
  - interface UserMonthlyClosingSummaryPayload

---

# Config

## Environment Variables

- `FRONTEND_URL` (has default) — .env.example
- `GOOGLE_CALLBACK_URL` (has default) — .env
- `GOOGLE_CLIENT_ID` (has default) — .env
- `GOOGLE_CLIENT_SECRET` (has default) — .env
- `INDEXNOW_KEY` (has default) — .env
- `JWT_SECRET` (has default) — .env.example
- `MONGODB_URI` (has default) — .env.example
- `PORT` (has default) — .env.example
- `RESEND_API_KEY` (has default) — .env
- `SEO_AUTOPILOT_MONGODB_URI` **required** — src\seo-autopilot\seo-autopilot-runner.ts
- `SMTP_FROM_ADDRESS` **required** — .env.example
- `SMTP_FROM_NAME` **required** — .env.example
- `SMTP_HOST` **required** — .env.example
- `SMTP_PASSWORD` **required** — .env.example
- `SMTP_PORT` **required** — .env.example
- `SMTP_SECURE` (has default) — .env
- `SMTP_USER` **required** — .env.example
- `STRIPE_SECRET_KEY` (has default) — .env.example
- `STRIPE_WEBHOOK_SECRET` (has default) — .env.example

## Config Files

- `.env.example`
- `tsconfig.json`

## Key Dependencies

- @nestjs/common: ^10.0.0
- @nestjs/core: ^10.0.0
- mongoose: ^8.0.0
- passport: ^0.7.0
- stripe: ^20.4.0

---

# Middleware

## auth
- auth-cookie.service — `src\auth\auth-cookie.service.ts`
- auth.controller.spec — `src\auth\auth.controller.spec.ts`
- auth.controller — `src\auth\auth.controller.ts`
- auth.module — `src\auth\auth.module.ts`
- auth.service.spec — `src\auth\auth.service.spec.ts`
- auth.service — `src\auth\auth.service.ts`
- google-auth.guard — `src\auth\google-auth.guard.ts`
- google.strategy — `src\auth\google.strategy.ts`
- jwt-auth.guard — `src\auth\jwt-auth.guard.ts`
- jwt.strategy — `src\auth\jwt.strategy.ts`

---

# Dependency Graph

## Most Imported Files (change these carefully)

- `src\auth\jwt-auth.guard.ts` — imported by **9** files
- `src\auth\current-user.decorator.ts` — imported by **8** files
- `src\user\user.service.ts` — imported by **8** files
- `src\auth\auth.module.ts` — imported by **7** files
- `src\user\schemas\user.schema.ts` — imported by **7** files
- `src\plans\plan.constants.ts` — imported by **6** files
- `src\user\user.module.ts` — imported by **5** files
- `src\referral\referral.service.ts` — imported by **5** files
- `src\auth\auth.service.ts` — imported by **4** files
- `src\auth\google.strategy.ts` — imported by **4** files
- `src\email\email.service.ts` — imported by **4** files
- `src\blog\blog.service.ts` — imported by **4** files
- `src\checkout\checkout.service.ts` — imported by **4** files
- `src\keyword-research\keyword-research.service.ts` — imported by **4** files
- `src\fiscal-reminder\fiscal-reminder.service.ts` — imported by **4** files
- `src\simulate\simulate.service.ts` — imported by **4** files
- `src\blog\blog.module.ts` — imported by **3** files
- `src\keyword-research\keyword-research.module.ts` — imported by **3** files
- `src\referral\referral.module.ts` — imported by **3** files
- `src\auth\auth-cookie.service.ts` — imported by **3** files

## Import Map (who imports what)

- `src\auth\jwt-auth.guard.ts` ← `src\checkout\checkout.controller.ts`, `src\cnpj\cnpj.controller.ts`, `src\fiscal-reminder\fiscal-reminder.controller.ts`, `src\invoice-import\invoice-import.controller.ts`, `src\referral\referral.controller.ts` +4 more
- `src\auth\current-user.decorator.ts` ← `src\checkout\checkout.controller.ts`, `src\fiscal-reminder\fiscal-reminder.controller.ts`, `src\invoice-import\invoice-import.controller.ts`, `src\referral\referral.controller.ts`, `src\reports\reports.controller.ts` +3 more
- `src\user\user.service.ts` ← `src\fiscal-reminder\fiscal-reminder.service.ts`, `src\invoice-import\invoice-import.service.ts`, `src\reports\reports.service.ts`, `src\simulate\simulate.service.ts`, `src\user\user.controller.spec.ts` +3 more
- `src\auth\auth.module.ts` ← `src\app.module.ts`, `src\checkout\checkout.module.ts`, `src\referral\referral.module.ts`, `src\reports\reports.module.ts`, `src\simulate\simulate.module.ts` +2 more
- `src\user\schemas\user.schema.ts` ← `src\auth\auth.module.ts`, `src\auth\auth.service.ts`, `src\checkout\checkout.module.ts`, `src\stats\stats.module.ts`, `src\stats\stats.service.ts` +2 more
- `src\plans\plan.constants.ts` ← `src\auth\auth.service.ts`, `src\fiscal-reminder\fiscal-reminder.service.ts`, `src\invoice-import\invoice-import.service.ts`, `src\reports\reports.service.ts`, `src\simulate\simulate.service.ts` +1 more
- `src\user\user.module.ts` ← `src\app.module.ts`, `src\fiscal-reminder\fiscal-reminder.module.ts`, `src\invoice-import\invoice-import.module.ts`, `src\reports\reports.module.ts`, `src\simulate\simulate.module.ts`
- `src\referral\referral.service.ts` ← `src\auth\auth.service.ts`, `src\checkout\checkout.service.ts`, `src\referral\referral.controller.ts`, `src\referral\referral.module.ts`, `src\referral\referral.service.spec.ts`
- `src\auth\auth.service.ts` ← `src\auth\auth.controller.spec.ts`, `src\auth\auth.controller.ts`, `src\auth\auth.module.ts`, `src\auth\auth.service.spec.ts`
- `src\auth\google.strategy.ts` ← `src\auth\auth.controller.ts`, `src\auth\auth.module.ts`, `src\auth\auth.service.spec.ts`, `src\auth\auth.service.ts`

---

# Test Coverage

> **38%** of routes and models are covered by tests
> 21 test files found

## Covered Routes

- POST:/auth/register
- POST:/auth/login
- POST:/auth/logout
- GET:/auth/google
- GET:/auth/google/callback
- POST:/simulate
- POST:/simulate/save
- GET:/simulate/projection
- GET:/simulate/history
- POST:/simulate/compare
- GET:/user/me
- PUT:/user/empresa
- GET:/user/onboarding-status
- GET:/user/monthly-closing-summary

## Covered Models

- FiscalReminder
- InvoiceRecord
- Lead
- ReferralCode
- Referral
- Simulacao
- SupportTicket
- Empresa
- User

---

_Generated by [codesight](https://github.com/Houseofmvps/codesight) — see your codebase clearly_