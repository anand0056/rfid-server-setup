# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything from frontend directory
COPY . .

# Install dependencies
RUN npm install
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app

# Copy built app and config from builder
COPY --from=builder /app ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
