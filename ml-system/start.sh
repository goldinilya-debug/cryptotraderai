#!/bin/bash

echo "🚀 CryptoTraderAI ML System"
echo "=============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "📦 Building and starting services..."
docker-compose up --build -d

echo ""
echo "✅ Services started!"
echo ""
echo "📊 API Endpoints:"
echo "  - Main API: http://localhost:8000"
echo "  - Docs: http://localhost:8000/docs"
echo "  - WebSocket: ws://localhost:8000/ws/signals"
echo ""
echo "🛠️  Management:"
echo "  - View logs: docker-compose logs -f ml-api"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart"
echo ""
echo "💡 Test the API:"
echo "  curl http://localhost:8000/signal/BTCUSDT/1h"