#!/bin/sh

echo "⏳ Waiting for database..."
until pg_isready -h ${DATABASE_HOST:-localhost} -U ${POSTGRES_USER:-voip_user}; do
  sleep 1
done

echo "🗄️ Running database migrations..."
cd /app/backend
DATABASE_URL=${DATABASE_URL} node dist/db/migrate.js

echo "🚀 Starting application..."
node dist/server.js &
SERVER_PID=$!

echo "📦 Serving frontend..."
cd /app/frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!

wait $SERVER_PID $FRONTEND_PID
