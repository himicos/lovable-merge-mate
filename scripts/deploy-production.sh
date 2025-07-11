#!/bin/bash

# Production Deployment Script for Railway
# Deploy all services (API, App, Public) to Railway

set -e  # Exit on any error

echo "🚀 Starting Production Deployment to Railway..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI is not installed. Please install it first:${NC}"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️ Not logged in to Railway. Please login first:${NC}"
    echo "railway login"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Plan:${NC}"
echo "1. Deploy API Service (Backend)"
echo "2. Deploy App Service (Frontend)"  
echo "3. Deploy Public Service (Landing Page)"
echo "4. Verify all deployments"
echo ""

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_dir=$2
    local service_id=$3
    
    echo -e "${BLUE}🔄 Deploying ${service_name}...${NC}"
    cd "$service_dir"
    
    # Link to specific service
    railway link --service "$service_id" --environment production
    
    # Deploy the service
    railway up --detach
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${service_name} deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy ${service_name}${NC}"
        exit 1
    fi
    
    cd ..
}

# Get the project root directory
PROJECT_ROOT=$(pwd)

# Deploy API Service
echo -e "${YELLOW}📡 Deploying API Service...${NC}"
cd api
railway link --service verby-api --environment production
railway up --detach
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API Service deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy API Service${NC}"
    exit 1
fi
cd "$PROJECT_ROOT"

# Deploy App Service  
echo -e "${YELLOW}📱 Deploying App Service...${NC}"
cd app
railway link --service verby-app --environment production
railway up --detach
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ App Service deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy App Service${NC}"
    exit 1
fi
cd "$PROJECT_ROOT"

# Deploy Public Service
echo -e "${YELLOW}🌐 Deploying Public Service...${NC}"
cd www
railway link --service verby-public --environment production
railway up --detach
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Public Service deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy Public Service${NC}"
    exit 1
fi
cd "$PROJECT_ROOT"

echo ""
echo -e "${GREEN}🎉 All services deployed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "• API:    https://verby-api-production-d6bf.up.railway.app"
echo "• App:    https://verby-app-production-3025.up.railway.app"
echo "• Public: https://[public-service-url].up.railway.app"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update DNS records in GoDaddy to point to Railway IPs (66.33.22.1)"
echo "2. Update Google OAuth configuration with new domains"
echo "3. Test all services with custom domains"
echo "4. Monitor deployment logs: railway logs --tail"
echo ""
echo -e "${BLUE}🔗 Custom Domain URLs (after DNS update):${NC}"
echo "• API:    https://api.verby.eu"
echo "• App:    https://app.verby.eu"  
echo "• Public: https://verby.eu"
echo ""
echo -e "${GREEN}✨ Production deployment complete!${NC}" 