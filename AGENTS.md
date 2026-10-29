# Notes for agents working in this repo

## Running it here (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

`web` is published on host port **3000** (Vite dev server, 5173 inside). The API (`api`)
is not published: Vite proxies `/api`, `/webhooks` and `/health` to it, so the browser
stays on one origin. Only the dashboard URL is needed.

Start order is `server-setup` (npm ci + prisma generate) → `migrate` (prisma migrate
deploy) → `api` → `web`, wired with `depends_on` conditions. `server-setup` is the only
service that writes `server/node_modules`, so installers never race.

After changing `server/package-lock.json` or `web/package-lock.json`, recreate the
installing services — `up -d` alone does not re-run a completed one-shot service:

```bash
docker compose -f docker-compose.base44.yml up -d --force-recreate server-setup web
```

## Non-obvious setup facts

- **Prisma needs OpenSSL, and `node:22-slim` has none at all** (no `openssl` CLI and no
  `libssl`). Without it `prisma generate` warns "failed to detect the libssl/openssl
  version", `prisma migrate deploy` dies with `Error: Schema engine error:`, and the API
  crashes on its first query. This was the reason the app failed to start. Both
  `Dockerfile` and `docker/base44-node.Dockerfile` install `openssl` for exactly this.
- **`DATABASE_URL=file:./data/yogaface.db` resolves relative to `server/prisma/`**, not
  `server/`, so the SQLite file lands in `server/prisma/data/`. That is the path the
  dev compose keeps in the `server_db` volume; `server/data/` is unused.
- `DASHBOARD_API_TOKEN` comes from the platform secret store via `/run/base44/app.env`
  (compose `env_file`, last entry so real values win). The server boots without it, but
  every `/api` route then returns 500 and the dashboard login cannot succeed.
- `web/vite.config.ts` only adds `allowedHosts` + the API proxy when
  `BASE44_PREVIEW_MODE=1`; unset, the config is the original one. Production builds
  (`npm run build`, GitHub Pages with `BASE_PATH`/`VITE_DEMO_MODE`) are unaffected.
- `web/src/lib/api.ts` defaults `API_BASE` to `http://localhost:4000`, but an *empty*
  `VITE_API_BASE_URL` (what both the Dockerfile and the dev compose set) means
  same-origin requests — do not remove that env var or the proxy stops being used.

## Verifying it works

- `curl -s localhost:3000/health` → `{"ok":true}` (proves web + proxy + API).
- `curl -s -o /dev/null -w '%{http_code}' localhost:3000/` → `200`.
- Signed-in checks need the dashboard token; drive them with
  `docker compose exec -T api node -e "fetch('http://127.0.0.1:4000/api/stats',{headers:{Authorization:'Bearer '+process.env.DASHBOARD_API_TOKEN}}).then(r=>r.text()).then(console.log)"`
  which exercises the real DB path without printing the secret.
- The production path (`docker build .`) was verified to apply migrations and serve the
  bundled dashboard; keep `openssl` in both Prisma-using stages or it breaks again.
