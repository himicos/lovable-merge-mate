#!/bin/bash

# Railway Manual Deployment Script
# Run this when automatic deployments fail

echo "🚀 Starting Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login check
echo "🔐 Checking Railway authentication..."
railway whoami

# Link to project (if not already linked)
echo "🔗 Linking to Railway project..."
railway link

# Deploy the latest commit
echo "📦 Deploying latest commit..."
railway up

echo "✅ Deployment initiated! Check Railway dashboard for progress."
echo "🌐 Your app will be available at: https://your-app-name.up.railway.app" 