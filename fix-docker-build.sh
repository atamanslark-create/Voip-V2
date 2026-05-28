#!/bin/bash

echo "🔧 Fixing Docker build issues..."

# Pull latest changes
git pull origin claude/pensive-keller-CrCLT

# Remove old lock files if they exist
rm -f backend/package-lock.json frontend/package-lock.json

# Rebuild Docker images with no cache
echo "🐳 Rebuilding Docker images..."
docker-compose build --no-cache

echo "✅ Docker images rebuilt successfully!"
echo ""
echo "Now run: docker-compose up -d"
