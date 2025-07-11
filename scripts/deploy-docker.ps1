# Docker Deployment Script for Verby
# Deploy the entire system using Docker Compose

Write-Host "🐳 Starting Docker Deployment for Verby..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if Docker is installed and running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop and make sure it's running" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
try {
    docker compose version | Out-Null
    Write-Host "✅ Docker Compose found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ No .env file found" -ForegroundColor Yellow
    Write-Host "Creating .env file from template..." -ForegroundColor Blue
    
    if (Test-Path "env.docker.template") {
        Copy-Item "env.docker.template" ".env"
        Write-Host "✅ Created .env file from template" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔑 IMPORTANT: Please update the following in your .env file:" -ForegroundColor Red
        Write-Host "- JWT_SECRET (generate a 64-character random string)" -ForegroundColor Yellow
        Write-Host "- REFRESH_TOKEN_SECRET (generate a 64-character random string)" -ForegroundColor Yellow
        Write-Host "- GOOGLE_CLIENT_ID (from Google Cloud Console)" -ForegroundColor Yellow
        Write-Host "- GOOGLE_CLIENT_SECRET (from Google Cloud Console)" -ForegroundColor Yellow
        Write-Host "- CLAUDE_API_KEY (optional, for AI features)" -ForegroundColor Yellow
        Write-Host "- ELEVENLABS_API_KEY (optional, for voice features)" -ForegroundColor Yellow
        Write-Host ""
        
        $continue = Read-Host "Press Enter to continue after updating .env file, or 'q' to quit"
        if ($continue -eq "q") {
            exit 0
        }
    } else {
        Write-Host "❌ env.docker.template not found" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🏗️ Building and starting containers..." -ForegroundColor Blue

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Gray
docker compose down --remove-orphans

# Build and start the services
Write-Host "Building Docker images..." -ForegroundColor Blue
docker compose build

Write-Host "Starting services..." -ForegroundColor Blue
docker compose up -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Blue
docker compose ps

# Health check
Write-Host ""
Write-Host "🔍 Health Check:" -ForegroundColor Blue
$maxAttempts = 12
$attempt = 1

while ($attempt -le $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:10000/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Application is healthy and responding!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "⏳ Attempt $attempt/$maxAttempts - Waiting for application to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        $attempt++
    }
}

if ($attempt -gt $maxAttempts) {
    Write-Host "❌ Application failed to respond after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "Check the logs with: docker compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Application URLs:" -ForegroundColor Blue
Write-Host "• Main App:  http://localhost:10000" -ForegroundColor White
Write-Host "• API:       http://localhost:10000/api" -ForegroundColor White
Write-Host "• Health:    http://localhost:10000/health" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Database Management:" -ForegroundColor Blue
Write-Host "• PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "• Redis:      localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Blue
Write-Host "• View logs:     docker compose logs -f" -ForegroundColor White
Write-Host "• Stop services: docker compose down" -ForegroundColor White
Write-Host "• Restart:       docker compose restart" -ForegroundColor White
Write-Host "• Update:        docker compose pull && docker compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "✨ Verby is now running!" -ForegroundColor Green 