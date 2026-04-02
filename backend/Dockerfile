FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY prisma /app/prisma
RUN npx prisma generate --schema /app/prisma/schema.prisma

COPY backend ./

EXPOSE 4000

CMD ["npm", "run", "dev"]
