# Auth

> **Navigation aid.** Route list and file locations extracted via AST. Read the source files listed below before implementing or modifying this subsystem.

The Auth subsystem handles **6 routes** and touches: auth, payment.

## Routes

- `POST` `/auth/register` [auth]
  `src\auth\auth.controller.ts`
- `POST` `/auth/login` [auth]
  `src\auth\auth.controller.ts`
- `POST` `/auth/logout` [auth]
  `src\auth\auth.controller.ts`
- `GET` `/auth/google` [auth]
  `src\auth\auth.controller.ts`
- `GET` `/auth/google/callback` [auth]
  `src\auth\auth.controller.ts`
- `GET` `/checkout/confirm` [auth, payment]
  `src\checkout\checkout.controller.ts`

## Middleware

- **auth-cookie.service** (auth) — `src\auth\auth-cookie.service.ts`
- **auth.controller.spec** (auth) — `src\auth\auth.controller.spec.ts`
- **auth.controller** (auth) — `src\auth\auth.controller.ts`
- **auth.module** (auth) — `src\auth\auth.module.ts`
- **auth.service.spec** (auth) — `src\auth\auth.service.spec.ts`
- **auth.service** (auth) — `src\auth\auth.service.ts`
- **google-auth.guard** (auth) — `src\auth\google-auth.guard.ts`
- **google.strategy** (auth) — `src\auth\google.strategy.ts`
- **jwt-auth.guard** (auth) — `src\auth\jwt-auth.guard.ts`
- **jwt.strategy** (auth) — `src\auth\jwt.strategy.ts`

## Source Files

Read these before implementing or modifying this subsystem:
- `src\auth\auth.controller.ts`
- `src\checkout\checkout.controller.ts`

---
_Back to [overview.md](./overview.md)_