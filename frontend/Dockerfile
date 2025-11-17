# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 4242

CMD ["serve", "-s", "dist", "-l", "4242"]
