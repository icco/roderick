# syntax=docker/dockerfile:1
FROM node:26-slim AS base
# corepack is not bundled in node:26-slim; install it so pnpm is available
RUN npm install -g corepack && corepack enable

# @icco/react-common is on GitHub Packages; npm_token secret auths install (not baked into any layer).
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=npm_token \
  echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npm_token)" >> .npmrc \
  && pnpm install --frozen-lockfile \
  && rm -f .npmrc

# Build the app (Next.js standalone output)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Production runner
FROM base AS runner
LABEL org.opencontainers.image.source=https://github.com/icco/roderick
LABEL org.opencontainers.image.description="A dictionary which promotes exploring of words."
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + traced node_modules, static assets, and the dictionary
# data (read from disk at boot — must be copied in explicitly).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
