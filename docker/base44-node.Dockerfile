# Runtime base for the Base44 dev services (see docker-compose.base44.yml).
# node:22-slim is Debian 12 with no libssl at all, so Prisma cannot load either
# its query engine or its migration schema engine: `prisma migrate deploy` dies
# with "Schema engine error" and the API crashes on its first query. Installing
# openssl provides libssl3 for both.
#
# This image deliberately contains no application code - the source is
# bind-mounted by compose so edits apply without a rebuild.
FROM node:22-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
