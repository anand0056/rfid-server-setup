FROM node:20-alpine AS builder

WORKDIR /app

# Add npm configuration for better network resilience
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 100000 && \
    npm config set fetch-retries 5

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build && rm -rf node_modules && rm -rf src

# Production stage
FROM node:20-alpine

WORKDIR /app

# Add npm configuration for better network resilience
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 100000 && \
    npm config set fetch-retries 5

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start:prod"]