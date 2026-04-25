# Simulate.controller

> **Navigation aid.** Route list and file locations extracted via AST. Read the source files listed below before implementing or modifying this subsystem.

The Simulate.controller subsystem handles **4 routes** and touches: auth.

## Routes

- `POST` `/simulate` [auth]
  `src\simulate\simulate.controller.ts`
- `POST` `/simulate/save` [auth]
  `src\simulate\simulate.controller.ts`
- `GET` `/simulate/projection` [auth]
  `src\simulate\simulate.controller.ts`
- `GET` `/simulate/history` [auth]
  `src\simulate\simulate.controller.ts`

## Source Files

Read these before implementing or modifying this subsystem:
- `src\simulate\simulate.controller.ts`

---
_Back to [overview.md](./overview.md)_