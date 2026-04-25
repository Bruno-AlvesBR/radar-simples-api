# Payments

> **Navigation aid.** Route list and file locations extracted via AST. Read the source files listed below before implementing or modifying this subsystem.

The Payments subsystem handles **3 routes** and touches: payment, auth.

## Routes

- `POST` `/checkout/webhook` [payment]
  `src\checkout\checkout-webhook.controller.ts`
- `POST` `/checkout/cancel` [auth, payment]
  `src\checkout\checkout.controller.ts`
- `POST` `/checkout/session` [auth, payment]
  `src\checkout\checkout.controller.ts`

## Source Files

Read these before implementing or modifying this subsystem:
- `src\checkout\checkout-webhook.controller.ts`
- `src\checkout\checkout.controller.ts`

---
_Back to [overview.md](./overview.md)_