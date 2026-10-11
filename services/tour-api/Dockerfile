# Build from the repo root: docker build -f services/tour-api/Dockerfile .
FROM node:22-slim AS build
WORKDIR /repo
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY services/tour-api/package.json services/tour-api/
COPY apps/web/package.json apps/web/
RUN npm ci -w services/tour-api --include-workspace-root
COPY services/tour-api services/tour-api
RUN npm run prisma:generate -w services/tour-api && npm run build -w services/tour-api

FROM node:22-slim
WORKDIR /repo
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=build /repo /repo
WORKDIR /repo/services/tour-api
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
