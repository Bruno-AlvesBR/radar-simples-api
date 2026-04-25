# radar-simples-api — Overview

> **Navigation aid.** This article shows WHERE things live (routes, models, files). Read actual source files before implementing new features or making changes.

**radar-simples-api** is a typescript project built with nestjs, using mongoose for data persistence.

## Scale

31 API routes · 11 database models · 65 library files · 8 middleware layers · 19 environment variables

## Subsystems

- **[Auth](./auth.md)** — 5 routes — touches: auth, payment
- **[Payments](./payments.md)** — 3 routes — touches: payment, auth
- **[Blog.controller](./blog.controller.md)** — 4 routes
- **[Cnpj.controller](./cnpj.controller.md)** — 1 routes — touches: auth
- **[Content-generation.controller](./content-generation.controller.md)** — 2 routes
- **[Fiscal-reminder.controller](./fiscal-reminder.controller.md)** — 2 routes — touches: auth
- **[Keyword-research.controller](./keyword-research.controller.md)** — 3 routes
- **[Leads.controller](./leads.controller.md)** — 1 routes
- **[Seo-monitoring.controller](./seo-monitoring.controller.md)** — 2 routes
- **[Simulate.controller](./simulate.controller.md)** — 4 routes — touches: auth
- **[Stats.controller](./stats.controller.md)** — 1 routes
- **[Support.controller](./support.controller.md)** — 1 routes — touches: auth
- **[User.controller](./user.controller.md)** — 2 routes — touches: auth

**Database:** mongoose, 11 models — see [database.md](./database.md)

**Libraries:** 65 files — see [libraries.md](./libraries.md)

## High-Impact Files

Changes to these files have the widest blast radius across the codebase:

- `src\user\schemas\user.schema.ts` — imported by **7** files
- `src\auth\jwt-auth.guard.ts` — imported by **6** files
- `src\auth\auth.module.ts` — imported by **5** files
- `src\auth\current-user.decorator.ts` — imported by **5** files
- `src\auth\google.strategy.ts` — imported by **4** files
- `src\blog\blog.service.ts` — imported by **4** files

## Required Environment Variables

- `SEO_AUTOPILOT_MONGODB_URI` — `src\seo-autopilot\seo-autopilot-runner.ts`

---
_Back to [index.md](./index.md) · Generated 2026-04-25_