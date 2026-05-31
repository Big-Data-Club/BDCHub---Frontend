# Stage 1: Dependencies
FROM node:20-alpine AS deps
LABEL stage=deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --prefer-offline --no-audit --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
LABEL stage=builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BUILD_DATE
ARG VERSION

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ARG NEXT_PUBLIC_YOUTUBE_UPLOAD_ENABLED="true"
ARG BACKEND_URL="http://backend:8080"
ARG LMS_API_URL="http://lms-backend:8081"
ARG AI_SERVICE_URL="http://ai-service:8000"
ARG NEXTAUTH_URL="https://bdc.hpcc.vn"

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=4096 \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
    NEXT_PUBLIC_YOUTUBE_UPLOAD_ENABLED=${NEXT_PUBLIC_YOUTUBE_UPLOAD_ENABLED} \
    BACKEND_URL=${BACKEND_URL} \
    LMS_API_URL=${LMS_API_URL} \
    AI_SERVICE_URL=${AI_SERVICE_URL} \
    NEXTAUTH_URL=${NEXTAUTH_URL} \
    AI_SERVICE_SECRET=${AI_SERVICE_SECRET}

# Build Next.js application
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
LABEL maintainer="BDC Development Team"
LABEL version="${VERSION}"
LABEL build_date="${BUILD_DATE}"

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tini

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/data && \
    chown -R nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]
