# Next Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy next-frontend package
COPY next-frontend/package.json next-frontend/package-lock.json* ./next-frontend/

# Copy shared package
COPY packages/shared ./packages/shared

# Install dependencies
RUN npm install --workspace=next-frontend

# Copy next-frontend source
COPY next-frontend ./next-frontend

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=next-frontend", "--", "-H", "0.0.0.0"]
