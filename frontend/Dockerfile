# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy frontend package
COPY frontend/package.json frontend/package-lock.json* ./frontend/

# Copy shared package
COPY packages/shared ./packages/shared

# Install dependencies
RUN npm install --workspace=frontend

# Copy frontend source
COPY frontend ./frontend

EXPOSE 5173

# Allow Vite to bind to 0.0.0.0 for Docker networking
CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host", "0.0.0.0"]
