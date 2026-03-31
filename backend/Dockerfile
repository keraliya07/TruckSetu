# === backend/Dockerfile ===
# Purpose: Multi-stage Docker build for the Node.js backend API
# Dependencies: Node.js 18

# ─── Development Stage ───
# FROM node:18-alpine AS development
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npx prisma generate
# EXPOSE 4000
# CMD ["npm", "run", "dev"]

# ─── Production Stage ───
# FROM node:18-alpine AS production
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production
# COPY . .
# RUN npx prisma generate
# EXPOSE 4000
# CMD ["npm", "start"]
