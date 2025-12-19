
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (CI for strict lockfile usage)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Stage 2: Production Run
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port (default NestJS)
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
