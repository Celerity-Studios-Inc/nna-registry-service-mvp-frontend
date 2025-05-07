#!/bin/bash

# Script to deploy the NNA Registry Service Frontend to Vercel

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI is not installed. Installing it now..."
    npm install -g vercel
fi

# Build the project
echo "Building the project..."
npm run build

# Deploy to Vercel production
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"