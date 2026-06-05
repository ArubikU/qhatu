# Qhatu API — Bun runtime. Build context = repo root (monorepo aware).
#   docker build -f apps/api/Dockerfile -t qhatu-api .
FROM oven/bun:1.2 AS base
WORKDIR /app

# Install deps (cache-friendly: copy manifests first)
COPY package.json bun.lock* turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN bun install --frozen-lockfile || bun install

# Source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generate Prisma client for the container's platform (linux)
RUN cd apps/api && bunx prisma generate

ENV NODE_ENV=production
EXPOSE 3002

# Bun executes TypeScript directly — no separate build step needed
CMD ["bun", "run", "apps/api/src/app.ts"]
