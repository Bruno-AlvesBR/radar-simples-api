# radar-simples-api — AI Context Map

> **Stack:** nestjs | mongoose | unknown | typescript

> 31 routes | 11 models | 0 components | 65 lib files | 19 env vars | 8 middleware | 5% test coverage
> **Token savings:** this file is ~4.500 tokens. Without it, AI exploration would cost ~51.000 tokens. **Saves ~46.500 tokens per conversation.**
> **Last scanned:** 2026-04-25 20:31 — re-run after significant changes

---

# Routes

- `POST` `/auth/register` params() [auth]
- `POST` `/auth/login` params() [auth]
- `GET` `/auth/google` params() [auth]
- `GET` `/auth/google/callback` params() [auth]
- `GET` `/blog/public` params()
- `GET` `/blog/public/:slug` params(slug)
- `POST` `/blog` params()
- `GET` `/blog/sitemap.xml` params()
- `POST` `/checkout/webhook` params() [payment]
- `GET` `/checkout/confirm` params() [auth, payment]
- `POST` `/checkout/cancel` params() [auth, payment]
- `POST` `/checkout/session` params() [auth, payment]
- `GET` `/cnpj/:cnpj` params(cnpj) [auth]
- `POST` `/content-generation/brand-voice/default` params()
- `POST` `/content-generation/draft/generate` params()
- `GET` `/fiscal-reminders/summary` params() [auth]
- `PUT` `/fiscal-reminders/summary` params() [auth]
- `GET` `/keyword-research` params()
- `POST` `/keyword-research/collect` params()
- `GET` `/keyword-research/best-next` params()
- `POST` `/leads` params()
- `POST` `/seo-monitoring/metrics` params()
- `GET` `/seo-monitoring/dashboard` params()
- `POST` `/simulate` params() [auth]
- `POST` `/simulate/save` params() [auth]
- `GET` `/simulate/projection` params() [auth]
- `GET` `/simulate/history` params() [auth]
- `GET` `/stats/public` params()
- `POST` `/support` params() [auth]
- `GET` `/user/me` params() [auth]
- `PUT` `/user/empresa` params() [auth]

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
- convertidoEmUsuario: boolean

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

---

# Libraries

- `src\app.module.ts` — class AppModule
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
- `src\checkout\checkout.service.ts` — class CheckoutService
- `src\checkout\dto\create-session.dto.ts` — class CreateSessionDto
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
- `src\engine\simples-nacional.engine.ts`
  - function calculateFatorR: (folhaPagamento, proLabore, faturamentoMensal) => number
  - function getAnexoAplicavel: (fatorR) => 'III' | 'V'
  - function calculateAliquotaEfetiva: (rbt12, anexo) => void
  - function calculateDas: (faturamentoMensal, aliquotaEfetiva) => number
  - function calculateProLaboreMinimo: (faturamentoMensal, folhaPagamento) => number
  - function calculateLucroDistribuivel: (faturamentoMensal, das, folhaPagamento, proLabore) => number
  - _...3 more_
- `src\fiscal-reminder\dto\update-fiscal-reminder.dto.ts` — class UpdateFiscalReminderDto
- `src\fiscal-reminder\fiscal-reminder.controller.ts` — class FiscalReminderController
- `src\fiscal-reminder\fiscal-reminder.module.ts` — class FiscalReminderModule
- `src\fiscal-reminder\fiscal-reminder.service.ts`
  - class FiscalReminderService
  - interface FiscalObligationSummaryItem
  - interface FiscalReminderSummary
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
- `src\seo-autopilot\seo-autopilot.module.ts` — class SeoAutopilotModule
- `src\seo-autopilot\seo-autopilot.service.ts` — class SeoAutopilotService
- `src\seo-monitoring\schemas\seo-metric.schema.ts`
  - class SeoMetric
  - type SeoMetricDocument
  - const SeoMetricSchema
- `src\seo-monitoring\seo-monitoring.controller.ts` — class SeoMonitoringController
- `src\seo-monitoring\seo-monitoring.module.ts` — class SeoMonitoringModule
- `src\seo-monitoring\seo-monitoring.service.ts` — class SeoMonitoringService
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
- `src\user\user.service.ts` — class UserService

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
- `SMTP_FROM_ADDRESS` (has default) — .env
- `SMTP_FROM_NAME` (has default) — .env
- `SMTP_HOST` (has default) — .env
- `SMTP_PASSWORD` (has default) — .env
- `SMTP_PORT` (has default) — .env
- `SMTP_SECURE` (has default) — .env
- `SMTP_USER` (has default) — .env
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

- `src\user\schemas\user.schema.ts` — imported by **7** files
- `src\auth\jwt-auth.guard.ts` — imported by **6** files
- `src\auth\auth.module.ts` — imported by **5** files
- `src\auth\current-user.decorator.ts` — imported by **5** files
- `src\auth\google.strategy.ts` — imported by **4** files
- `src\blog\blog.service.ts` — imported by **4** files
- `src\keyword-research\keyword-research.service.ts` — imported by **4** files
- `src\user\user.service.ts` — imported by **4** files
- `src\user\user.module.ts` — imported by **3** files
- `src\blog\blog.module.ts` — imported by **3** files
- `src\keyword-research\keyword-research.module.ts` — imported by **3** files
- `src\auth\auth.service.ts` — imported by **3** files
- `src\checkout\checkout.service.ts` — imported by **3** files
- `src\content-generation\content-generation.service.ts` — imported by **3** files
- `src\content-generation\content-generation.module.ts` — imported by **2** files
- `src\auth\dto\login.dto.ts` — imported by **2** files
- `src\auth\dto\register.dto.ts` — imported by **2** files
- `src\auth\google-auth.guard.ts` — imported by **2** files
- `src\blog\dto\create-article.dto.ts` — imported by **2** files
- `src\cnpj\cnpj.service.ts` — imported by **2** files

## Import Map (who imports what)

- `src\user\schemas\user.schema.ts` ← `src\auth\auth.module.ts`, `src\auth\auth.service.ts`, `src\checkout\checkout.module.ts`, `src\stats\stats.module.ts`, `src\stats\stats.service.ts` +2 more
- `src\auth\jwt-auth.guard.ts` ← `src\checkout\checkout.controller.ts`, `src\cnpj\cnpj.controller.ts`, `src\fiscal-reminder\fiscal-reminder.controller.ts`, `src\simulate\simulate.controller.ts`, `src\support\support.controller.ts` +1 more
- `src\auth\auth.module.ts` ← `src\app.module.ts`, `src\checkout\checkout.module.ts`, `src\simulate\simulate.module.ts`, `src\support\support.module.ts`, `src\user\user.module.ts`
- `src\auth\current-user.decorator.ts` ← `src\checkout\checkout.controller.ts`, `src\fiscal-reminder\fiscal-reminder.controller.ts`, `src\simulate\simulate.controller.ts`, `src\support\support.controller.ts`, `src\user\user.controller.ts`
- `src\auth\google.strategy.ts` ← `src\auth\auth.controller.ts`, `src\auth\auth.module.ts`, `src\auth\auth.service.spec.ts`, `src\auth\auth.service.ts`
- `src\blog\blog.service.ts` ← `src\blog\blog.controller.ts`, `src\blog\blog.module.ts`, `src\content-generation\content-generation.service.ts`, `src\seo-autopilot\seo-autopilot.service.ts`
- `src\keyword-research\keyword-research.service.ts` ← `src\content-generation\content-generation.service.ts`, `src\keyword-research\keyword-research.controller.ts`, `src\keyword-research\keyword-research.module.ts`, `src\seo-autopilot\seo-autopilot.service.ts`
- `src\user\user.service.ts` ← `src\fiscal-reminder\fiscal-reminder.service.ts`, `src\simulate\simulate.service.ts`, `src\user\user.controller.ts`, `src\user\user.module.ts`
- `src\user\user.module.ts` ← `src\app.module.ts`, `src\fiscal-reminder\fiscal-reminder.module.ts`, `src\simulate\simulate.module.ts`
- `src\blog\blog.module.ts` ← `src\app.module.ts`, `src\content-generation\content-generation.module.ts`, `src\seo-autopilot\seo-autopilot.module.ts`

---

# Test Coverage

> **5%** of routes and models are covered by tests
> 2 test files found

## Covered Models

- Empresa
- User

---

_Generated by [codesight](https://github.com/Houseofmvps/codesight) — see your codebase clearly_