# radar-simples-api — Overview

> **Navigation aid.** This article shows WHERE things live (routes, models, files). Read actual source files before implementing new features or making changes.

**radar-simples-api** is a typescript project built with nestjs, using mongoose for data persistence.

## Scale

46 API routes · 15 database models · 91 library files · 10 middleware layers · 19 environment variables

## Subsystems

- **[Auth](./auth.md)** — 6 routes — touches: auth, payment
- **[Payments](./payments.md)** — 7 routes — touches: payment, auth
- **[Blog.controller](./blog.controller.md)** — 4 routes
- **[Cnpj.controller](./cnpj.controller.md)** — 1 routes — touches: auth
- **[Content-generation.controller](./content-generation.controller.md)** — 2 routes
- **[Engine.controller](./engine.controller.md)** — 1 routes
- **[Fiscal-reminder.controller](./fiscal-reminder.controller.md)** — 2 routes — touches: auth
- **[Invoice-import.controller](./invoice-import.controller.md)** — 2 routes — touches: auth, upload
- **[Keyword-research.controller](./keyword-research.controller.md)** — 3 routes
- **[Leads.controller](./leads.controller.md)** — 2 routes
- **[Referral.controller](./referral.controller.md)** — 2 routes — touches: auth
- **[Reports.controller](./reports.controller.md)** — 1 routes — touches: auth
- **[Seo-monitoring.controller](./seo-monitoring.controller.md)** — 2 routes
- **[Simulate.controller](./simulate.controller.md)** — 5 routes — touches: auth
- **[Stats.controller](./stats.controller.md)** — 1 routes
- **[Support.controller](./support.controller.md)** — 1 routes — touches: auth
- **[User.controller](./user.controller.md)** — 4 routes — touches: auth

**Database:** mongoose, 15 models — see [database.md](./database.md)

**Libraries:** 91 files — see [libraries.md](./libraries.md)

## High-Impact Files

Changes to these files have the widest blast radius across the codebase:

- `src\auth\jwt-auth.guard.ts` — imported by **9** files
- `src\auth\current-user.decorator.ts` — imported by **8** files
- `src\user\user.service.ts` — imported by **8** files
- `src\auth\auth.module.ts` — imported by **7** files
- `src\user\schemas\user.schema.ts` — imported by **7** files
- `src\plans\plan.constants.ts` — imported by **6** files

## Required Environment Variables

- `SEO_AUTOPILOT_MONGODB_URI` — `src\seo-autopilot\seo-autopilot-runner.ts`
- `SMTP_FROM_ADDRESS` — `.env.example`
- `SMTP_FROM_NAME` — `.env.example`
- `SMTP_HOST` — `.env.example`
- `SMTP_PASSWORD` — `.env.example`
- `SMTP_PORT` — `.env.example`
- `SMTP_USER` — `.env.example`

---
_Back to [index.md](./index.md) · Generated 2026-04-26_