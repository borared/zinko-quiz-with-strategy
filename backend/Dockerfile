# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy backend package
COPY backend/package.json backend/package-lock.json* ./backend/

# Copy shared package
COPY packages/shared ./packages/shared

# Copy prisma schema for prisma generate
COPY backend/prisma ./backend/prisma

# Install dependencies
RUN npm install --workspace=backend

# Copy backend source
COPY backend ./backend

EXPOSE 5000

CMD ["npm", "run", "start", "--workspace=backend"]
