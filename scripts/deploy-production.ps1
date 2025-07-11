# Production Deployment Script for Railway (PowerShell)
# Deploy all services (API, App, Public) to Railway

param(
    [switch]$SkipLogin,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Production Deployment to Railway..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
} catch {
    Write-Host "❌ Railway CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Railway (unless skipped)
if (-not $SkipLogin) {
    try {
        railway whoami | Out-Null
    } catch {
        Write-Host "⚠️ Not logged in to Railway. Please login first:" -ForegroundColor Yellow
        Write-Host "railway login" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "📋 Deployment Plan:" -ForegroundColor Blue
Write-Host "1. Deploy API Service (Backend)"
Write-Host "2. Deploy App Service (Frontend)"  
Write-Host "3. Deploy Public Service (Landing Page)"
Write-Host "4. Verify all deployments"
Write-Host ""

# Function to deploy a service
function Deploy-Service {
    param(
        [string]$ServiceName,
        [string]$ServiceDir,
        [string]$ServiceId
    )
    
    Write-Host "🔄 Deploying $ServiceName..." -ForegroundColor Blue
    
    # Change to service directory
    Push-Location $ServiceDir
    
    try {
        # Link to specific service
        if ($Verbose) {
            Write-Host "Linking to service: $ServiceId" -ForegroundColor Gray
        }
        railway link --service $ServiceId --environment production
        
        # Deploy the service
        railway up --detach
        
        Write-Host "✅ $ServiceName deployed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to deploy $ServiceName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Pop-Location
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Get the project root directory
$ProjectRoot = Get-Location

# Deploy API Service
Write-Host "📡 Deploying API Service..." -ForegroundColor Yellow
Push-Location "api"
try {
    railway link --service verby-api --environment production
    railway up --detach
    Write-Host "✅ API Service deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to deploy API Service" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Deploy App Service  
Write-Host "📱 Deploying App Service..." -ForegroundColor Yellow
Push-Location "app"
try {
    railway link --service verby-app --environment production
    railway up --detach
    Write-Host "✅ App Service deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to deploy App Service" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# Deploy Public Service
Write-Host "🌐 Deploying Public Service..." -ForegroundColor Yellow
Push-Location "www"
try {
    railway link --service verby-public --environment production
    railway up --detach
    Write-Host "✅ Public Service deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to deploy Public Service" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "🎉 All services deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Blue
Write-Host "• API:    https://verby-api-production-d6bf.up.railway.app"
Write-Host "• App:    https://verby-app-production-3025.up.railway.app"
Write-Host "• Public: https://[public-service-url].up.railway.app"
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update DNS records in GoDaddy to point to Railway IPs (66.33.22.1)"
Write-Host "2. Update Google OAuth configuration with new domains"
Write-Host "3. Test all services with custom domains"
Write-Host "4. Monitor deployment logs: railway logs --tail"
Write-Host ""
Write-Host "🔗 Custom Domain URLs (after DNS update):" -ForegroundColor Blue
Write-Host "• API:    https://api.verby.eu"
Write-Host "• App:    https://app.verby.eu"  
Write-Host "• Public: https://verby.eu"
Write-Host ""
Write-Host "✨ Production deployment complete!" -ForegroundColor Green

# Optional: Open Railway dashboard
$OpenDashboard = Read-Host "Would you like to open the Railway dashboard? (y/N)"
if ($OpenDashboard -eq "y" -or $OpenDashboard -eq "Y") {
    Start-Process "https://railway.app/dashboard"
} 