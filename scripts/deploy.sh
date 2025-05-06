#!/bin/bash

# Exit on error
set -e

echo "🚀 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Build the app
echo "🔨 Building the application..."
npm run build

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment completed!"