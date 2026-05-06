#!/bin/bash
set -e

echo "🚀 Starting Printsy Deployment Sprint..."

# Ensure we have the latest code (uncomment in real CI/CD)
# git pull origin main

echo "📦 Building Docker containers..."
docker-compose build

echo "🚢 Starting services in detached mode..."
docker-compose up -d

echo "⏳ Waiting for database to initialize..."
sleep 5

echo "🛠️ Running database migrations..."
docker-compose exec backend python manage.py migrate

echo "✅ Deployment successful! Services are running:"
docker-compose ps
