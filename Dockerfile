# Production image: the web app (built PWA) served by the Tour API from one origin, so the
# httpOnly refresh cookie, the CSP and the service worker all work without cross-site setup.
#
#   docker build -t pune-explorer \
#     --build-arg VITE_MAP_TILE_URL=... --build-arg VITE_GOOGLE_CLIENT_ID=... .
#
# VITE_* values are baked into the JavaScript at build time (they are public, never secrets).
# Runtime secrets (DATABASE_URL, JWT_SECRET, ...) come from the environment: docs/LAUNCH_SETUP.md.

FROM node:22-slim AS build
WORKDIR /repo
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY services/tour-api/package.json services/tour-api/
RUN npm ci --include-workspace-root

COPY apps/web apps/web
COPY services/tour-api services/tour-api

ARG VITE_MAP_TILE_URL
ARG VITE_MAP_TILE_ATTRIBUTION
ARG VITE_MAP_TILES_OFFLINE
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_SAFETY_URL
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_ENVIRONMENT=production
ARG VITE_RELEASE
RUN npm run build -w apps/web \
 && npm run prisma:generate -w services/tour-api \
 && npm run build -w services/tour-api \
 && npm prune --omit=dev

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /repo
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /repo/package.json /repo/package-lock.json ./
COPY --from=build --chown=node:node /repo/node_modules node_modules
COPY --from=build --chown=node:node /repo/apps/web/dist apps/web/dist
# The API folder: compiled dist/, prisma/ (schema + migrations) and any non-hoisted packages
COPY --from=build --chown=node:node /repo/services/tour-api services/tour-api

USER node
WORKDIR /repo/services/tour-api
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/v1/health/live').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"

# Migrations run before the server starts. Several instances starting together are safe:
# Prisma takes a database lock while migrating.
# RUN_MODE=worker runs the SMS worker instead of the API (set RUN_WORKERS=false on API instances).
CMD ["sh", "-c", "if [ \"$RUN_MODE\" = worker ]; then exec node dist/worker.js; else npx prisma migrate deploy && exec node dist/server.js; fi"]
