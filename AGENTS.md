# AGENTS.md — YogaFace (Base44 dev environment)

## What this is

WhatsApp group management + billing sync + "command room" dashboard for a
yoga business. Node.js/Express + Prisma/SQLite backend (`server/`) and
React/Vite frontend (`web/`). In production both are bundled into one image
(repo-root `Dockerfile`); in the Base44 dev environment they run as two
live-reload compose services.

## Running the app

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- **Frontend** (Vite dev server) → host port **3000** (mapped from 5173).
- **Backend** (tsx watch) → internal port 4000, not exposed to the host.
- Vite proxies `/api`, `/webhooks`, `/health` to the `server` service, so the
  browser only needs port 3000. `VITE_API_BASE_URL` is set to empty (same-origin).
- Both services bind-mount the source; edits hot-reload without rebuilds.

## Environment / secrets

- `.env.base44-defaults` — repo-level placeholders (PORT, DATABASE_URL, etc.).
  Listed FIRST in compose `env_file:` so real secrets override them.
- `/run/base44/app.env` — platform-delivered secrets, listed LAST (always wins).
- **DASHBOARD_API_TOKEN** — required for the dashboard to function (the auth
  middleware returns 500 without it). A development placeholder is generated
  automatically; the user can replace it via the Base44 secrets dashboard.
- External integrations (Green API, Cardcom, NVIDIA, SMTP) are all **optional**.
  The app boots and the dashboard works without them; each missing credential
  just leaves its feature inactive (WhatsApp sync, billing reconciliation, AI
  chat, email/WhatsApp digest).

## Database

- SQLite via Prisma. File at `/app/data/yogaface.db` (mounted from `./data/`).
- Migrations run automatically on container startup (`prisma migrate deploy`).
- Prisma client is generated on startup (`prisma generate`) — needed because
  `node_modules` lives in the bind mount and may not have it yet.

## Dashboard login

The dashboard asks for an access token on first load. Enter the
`DASHBOARD_API_TOKEN` value (visible in the Base44 secrets dashboard).

## Useful commands

```bash
# View logs
docker compose -f docker-compose.base44.yml logs -f

# Restart just the backend after a code change that tsx watch missed
docker compose -f docker-compose.base44.yml restart server

# Run a Prisma studio session against the dev DB
docker compose -f docker-compose.base44.yml exec server npx prisma studio
```

## Gotchas

- `node:22-slim` has no curl/wget — healthchecks use `node -e "fetch(...)"`.
- The server's `pino-pretty` transport only loads when `NODE_ENV != production`
  (it's a devDependency), so `NODE_ENV=development` is required in dev.
- Vite 5.x: `server.host: true` in vite.config.ts lets the preview's external
  hostname through; `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is also passed
  (harmless on Vite 5, used by Vite >= 6.1).
