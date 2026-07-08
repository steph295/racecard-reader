# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundles at build time,
# so the real publishable key must be provided as a build argument.
# Railway passes service variables to Docker builds automatically.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_placeholder"
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
# Server-only values are read at runtime; placeholders keep `next build` happy.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV CLERK_SECRET_KEY="sk_test_placeholder"
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts/migrate-startup.mjs ./scripts/migrate-startup.mjs
COPY --from=builder /app/node_modules/postgres ./node_modules/postgres

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["sh", "-c", "node scripts/migrate-startup.mjs && node server.js"]
