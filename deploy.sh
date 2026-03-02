#!/bin/bash

# Deployment script for CryptoTraderAI

echo "🚀 Deploying CryptoTraderAI..."

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Frontend deployment
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

echo "✅ Frontend build complete"
echo "👉 Deploy frontend to Vercel:"
echo "   npx vercel --prod"

# Backend deployment
echo ""
echo "🐍 Preparing backend..."
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "✅ Backend ready"
echo "👉 Deploy backend to Railway:"
echo "   railway login"
echo "   railway up"

echo ""
echo "📝 Next steps:"
echo "1. Set environment variables on Vercel and Railway"
echo "2. Connect custom domain (cryptotraderai.app)"
echo "3. Configure Supabase database"
echo "4. Add OpenAI API key"
