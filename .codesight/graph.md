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
