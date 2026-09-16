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
COPY server/package.json server/package-lock.json* ./
RUN npm install
COPY server/ ./
RUN npx prisma generate
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/node_modules/.prisma ./node_modules/.prisma
COPY server/prisma ./prisma
COPY --from=web-build /app/web/dist ./public
RUN mkdir -p /app/data
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
