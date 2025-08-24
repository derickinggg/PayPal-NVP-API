#!/bin/bash

# PayPal NVP Dashboard - Vercel Deployment Script
echo "🚀 Deploying PayPal NVP Dashboard to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Set environment variables in Vercel
echo "🔧 Setting up environment variables..."

# Core application variables
vercel env add SESSION_SECRET production <<< "your-super-secret-session-key-change-this-in-production-123456789"
vercel env add PAYPAL_ENV production <<< "sandbox"
vercel env add PAYPAL_NVP_VERSION production <<< "204.0"
vercel env add LOG_BUFFER_SIZE production <<< "300"

# Optional: Set custom endpoints if needed
# vercel env add NVP_SANDBOX_URL production <<< "https://api-3t.sandbox.paypal.com/nvp"
# vercel env add NVP_LIVE_URL production <<< "https://api-3t.paypal.com/nvp"

echo "✅ Environment variables configured"

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your Vercel dashboard to get your app URL"
echo "2. Update CLIENT_ORIGIN environment variable with your actual domain"
echo "3. Test the application with your PayPal API credentials"
echo ""
echo "🔗 Useful commands:"
echo "  vercel --prod     # Deploy to production"
echo "  vercel dev        # Run locally with Vercel environment"
echo "  vercel logs       # View deployment logs"