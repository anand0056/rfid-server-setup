# Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy the source code (excluding node_modules via .dockerignore)
COPY . .

# Build the production version of the app and clean up immediately
RUN npm run build && \
    rm -rf node_modules && \
    rm -rf .next/cache && \
    rm -rf src

# Stage 2: Serve the built app
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache wget
# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from the builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
