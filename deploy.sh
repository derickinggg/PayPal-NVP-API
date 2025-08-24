#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test build locally
echo "🔨 Testing build locally..."
npm run vercel-build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Local build failed! Please fix the issues before deploying."
    exit 1
fi