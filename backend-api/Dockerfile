FROM node:20-alpine as builder

WORKDIR /app

# Add npm configuration for better network resilience
RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retry-mintimeout 100000 \
    && npm config set fetch-retries 5

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Add npm configuration for better network resilience
RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retry-mintimeout 100000 \
    && npm config set fetch-retries 5

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start:prod"]