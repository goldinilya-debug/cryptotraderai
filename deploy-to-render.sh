#!/bin/bash

# Auto-deploy script for CryptoTraderAI Trading Bot to Render
# Usage: ./deploy-to-render.sh

echo "🚀 CryptoTraderAI Trading Bot Auto-Deploy"
echo "=========================================="

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔑 Logging in to Railway..."
railway login

# Create project
echo "📦 Creating project..."
cd trading-bot
PROJECT_ID=$(railway init --name cryptotraderai-bot 2>&1 | grep -o 'Project:.*' | cut -d' ' -f2)

echo "✅ Project created: $PROJECT_ID"

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set BINGX_API_KEY="ayJqaHx8lAxL6NIkttVhRCct2POu1ViKP2qB5aYPF9lWwnE5SmKHnPhQGOfqZn81sivkVCi7JPV9m5yVg0BTg"
railway variables set BINGX_API_SECRET="gKPx5ZvyQVcNMHYWmx6VZk1sfvSzOMsZC1blFYRkKbxYotXkKwiI7B4BfM1AVUHNsmXLSjx07Ea9oMCgjZA"
railway variables set BINGX_SANDBOX="true"
railway variables set WEBHOOK_SECRET="ctraibot2026_secure_key_$(date +%s)"

# Deploy
echo "🚀 Deploying..."
railway up

echo ""
echo "✅ Deploy complete!"
echo "🔗 URL: https://$(railway domain 2>/dev/null || echo 'waiting for domain...')"
echo ""
echo "📋 Save this URL and give it to your AI assistant"
