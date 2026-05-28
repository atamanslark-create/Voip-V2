FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend

WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --legacy-peer-deps
COPY backend/ ./
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

# Install serve to serve static frontend
RUN npm install -g serve

COPY --from=backend /app/backend/dist ./backend/dist
COPY --from=backend /app/backend/node_modules ./backend/node_modules
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY backend/src/db/schema.sql ./backend/dist/db/schema.sql
COPY docker-entrypoint.sh ./

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5000 3000

ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
