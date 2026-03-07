#!/bin/bash

# Deploy script for CryptoTraderAI
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
cd frontend
npm run build
cd ..

# Switch to gh-pages branch
echo -e "${YELLOW}🔄 Switching to gh-pages branch...${NC}"
git checkout gh-pages

# Copy build files
echo -e "${YELLOW}📋 Copying build files...${NC}"
cp -r frontend/dist/* .
cp frontend/dist/.nojekyll . 2>/dev/null || echo "" > .nojekyll

# Add CNAME if not exists
if [ ! -f CNAME ]; then
    echo "cryptotraderai.app" > CNAME
fi

# Commit and push
echo -e "${YELLOW}💾 Committing changes...${NC}"
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin gh-pages

# Return to main
echo -e "${YELLOW}↩️  Returning to main branch...${NC}"
git checkout main

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://goldinilya-debug.github.io/cryptotraderai/"
echo ""
echo "⏱️  Wait 1-2 minutes for changes to propagate"
