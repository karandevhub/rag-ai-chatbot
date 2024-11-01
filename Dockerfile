# Base image for setting up the environment
FROM node:18-alpine AS base

# Setup dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Install pnpm and build the Next.js application
RUN npm install -g pnpm && pnpm run build

# Prepare the production image
FROM base AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production
ENV DATABASE_URL=$DATABASE_URL
ENV API_KEY=$API_KEY
ENV NEXT_TELEMETRY_DISABLED 1

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install pnpm in the final stage
RUN npm install -g pnpm

# Copy necessary files and folders for production
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000

# Set the port and start the application
ENV PORT 3000
CMD ["pnpm", "start"]