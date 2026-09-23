# Stage 1: Сборка Angular-клиента
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Сборка Express-бэкенда
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Финальный образ для запуска
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Копируем продакшн-зависимости бэкенда
COPY server/package*.json ./
RUN npm ci --only=production

# Копируем скомпилированный сервер и его шрифты
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/assets ./assets

# Копируем клиент в оба возможных места (и в /app/client, и в корень /client)
COPY --from=client-builder /app/client/dist/client/browser ./client/dist/client/browser
COPY --from=client-builder /app/client/dist/client/browser /client/dist/client/browser

EXPOSE 3000

CMD ["node", "dist/index.js"]