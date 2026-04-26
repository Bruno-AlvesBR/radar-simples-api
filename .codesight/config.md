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
