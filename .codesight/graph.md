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
