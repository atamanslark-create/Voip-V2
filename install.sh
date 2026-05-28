#!/bin/bash

set -e

echo "🚀 VoIP Management System Installation"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✓ Docker and Docker Compose found"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."

    read -p "Enter Telegram Bot Token: " TELEGRAM_BOT_TOKEN
    read -p "Enter Database Password (or press Enter for default): " DB_PASSWORD
    read -p "Enter JWT Secret (or press Enter for auto-generated): " JWT_SECRET
    read -p "Enter CORS Origin (default: http://localhost:3000): " CORS_ORIGIN

    DB_PASSWORD=${DB_PASSWORD:-voip_password}
    JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
    CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}

    cat > .env << EOF
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=$CORS_ORIGIN
EOF

    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Services:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   Database:  postgres://voip_user:$DB_PASSWORD@localhost:5432/voip_db"
echo ""
echo "📝 First Admin User:"
echo "   Email: admin@example.com"
echo "   Password: password"
echo ""
echo "To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "To stop services:"
echo "   docker-compose down"
