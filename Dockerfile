# ==============================================================================
# MULTI-STAGE DOCKERFILE FOR SCHOOL ERP BACKEND
# ==============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Create non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
