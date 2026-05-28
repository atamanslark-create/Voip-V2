#!/bin/sh

echo "⏳ Waiting for database..."
until pg_isready -h postgres -U voip_user; do
  sleep 1
done

echo "🗄️ Running database migrations..."
cd /app/backend
DATABASE_URL="postgresql://voip_user:voip_password@postgres:5432/voip_db" node dist/db/migrate.js || true

echo "🚀 Starting application..."
node dist/server.js &
SERVER_PID=$!

echo "📦 Serving frontend..."
cd /app/frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!

wait $SERVER_PID $FRONTEND_PID
