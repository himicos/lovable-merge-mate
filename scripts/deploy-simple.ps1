# Simple Production Deployment Script for Railway
# Deploy all services to Railway

Write-Host "Starting Production Deployment to Railway..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
    Write-Host "Railway CLI found" -ForegroundColor Green
} catch {
    Write-Host "Railway CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Railway
try {
    railway whoami | Out-Null
    Write-Host "Railway authentication verified" -ForegroundColor Green
} catch {
    Write-Host "Not logged in to Railway. Please login first:" -ForegroundColor Yellow
    Write-Host "railway login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Deployment Plan:" -ForegroundColor Blue
Write-Host "1. Deploy API Service"
Write-Host "2. Deploy App Service"  
Write-Host "3. Deploy Public Service"
Write-Host ""

# Deploy API Service
Write-Host "Deploying API Service..." -ForegroundColor Yellow
Set-Location "api"
try {
    Write-Host "Linking to verby-api service..." -ForegroundColor Gray
    railway link --service verby-api --environment production
    
    Write-Host "Deploying API..." -ForegroundColor Gray
    railway up --detach
    
    Write-Host "API Service deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "Failed to deploy API Service" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."

# Deploy App Service  
Write-Host "Deploying App Service..." -ForegroundColor Yellow
Set-Location "app"
try {
    Write-Host "Linking to verby-app service..." -ForegroundColor Gray
    railway link --service verby-app --environment production
    
    Write-Host "Deploying App..." -ForegroundColor Gray
    railway up --detach
    
    Write-Host "App Service deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "Failed to deploy App Service" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."

# Deploy Public Service
Write-Host "Deploying Public Service..." -ForegroundColor Yellow
Set-Location "www"
try {
    Write-Host "Linking to verby-public service..." -ForegroundColor Gray
    railway link --service verby-public --environment production
    
    Write-Host "Deploying Public site..." -ForegroundColor Gray
    railway up --detach
    
    Write-Host "Public Service deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "Failed to deploy Public Service" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."

Write-Host ""
Write-Host "All services deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Deployment Summary:" -ForegroundColor Blue
Write-Host "- API:    https://verby-api-production-d6bf.up.railway.app"
Write-Host "- App:    https://verby-app-production-3025.up.railway.app"
Write-Host "- Public: [public-service-url].up.railway.app"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update DNS records in GoDaddy to point to Railway IPs (66.33.22.1)"
Write-Host "2. Update Google OAuth configuration with new domains"
Write-Host "3. Test all services with custom domains"
Write-Host ""
Write-Host "Custom Domain URLs (after DNS update):" -ForegroundColor Blue
Write-Host "- API:    https://api.verby.eu"
Write-Host "- App:    https://app.verby.eu"  
Write-Host "- Public: https://verby.eu"
Write-Host ""
Write-Host "Production deployment complete!" -ForegroundColor Green 