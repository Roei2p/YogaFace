# Single-image build: bundles the dashboard (web/) into the API server
# (server/) so the whole system is reachable from one URL/port. This is
# what render.yaml deploys - see README.md "פריסה עם קישור אמיתי".

FROM node:22-slim AS web-build
WORKDIR /app/web
# Same-origin API calls once the dashboard is served by the server itself.
ENV VITE_API_BASE_URL=""
COPY web/package.json web/package-lock.json* ./
RUN npm install
COPY web/ ./
RUN npm run build

FROM node:22-slim AS server-build
WORKDIR /app/server
# node:22-slim is Debian 12 with no libssl and no openssl CLI. Prisma then
# guesses the openssl-1.1.x engine and fails to load it ("Schema engine
# error" on migrate, engine crash on the first query). Install OpenSSL before
# prisma generate so the right engine is generated.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json* ./
RUN npm install
COPY server/ ./
RUN npx prisma generate
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
# The runtime runs `prisma migrate deploy`, and the Prisma query engine needs
# libssl - neither is present in the base image.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/node_modules/.prisma ./node_modules/.prisma
COPY server/prisma ./prisma
COPY --from=web-build /app/web/dist ./public
RUN mkdir -p /app/data
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
