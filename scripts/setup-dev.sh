#!/bin/bash

# Setup script for local development

echo "🚀 Setting up Lovable Merge Mate for local development..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=13337
NODE_ENV=development

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=lovable_merge_mate
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=dev-jwt-secret-change-in-production
REFRESH_TOKEN_SECRET=dev-refresh-secret-change-in-production

# Google OAuth Configuration (you need to set these)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:13337/api/auth/google/callback

# AI Service API Keys (optional for development)
CLAUDE_API_KEY=your-claude-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:13337
EOF
    echo "✅ Created .env file. Please update it with your actual values."
else
    echo "ℹ️ .env file already exists."
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL connection..."
until docker exec lovable-postgres pg_isready -U postgres; do
    echo "⏳ Waiting for PostgreSQL..."
    sleep 2
done

# Check if Redis is ready
echo "🔍 Checking Redis connection..."
until docker exec lovable-redis redis-cli ping; do
    echo "⏳ Waiting for Redis..."
    sleep 2
done

# Run database migrations
echo "📊 Running database migrations..."
docker exec lovable-postgres psql -U postgres -d lovable_merge_mate -f /docker-entrypoint-initdb.d/001_initial_schema.sql

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd api && npm install && cd ..
cd app && npm install && cd ..
cd www && npm install && cd ..
cd desktop && npm install && cd ..

echo "✅ Development environment setup complete!"
echo ""
echo "🌐 Services:"
echo "  • API: http://localhost:13337"
echo "  • Frontend: http://localhost:5173 (run 'npm run dev' in app/)"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • pgAdmin: http://localhost:8080 (admin@lovable.com / admin)"
echo "  • Redis Commander: http://localhost:8082"
echo ""
echo "🔧 Next steps:"
echo "  1. Update .env file with your Google OAuth credentials"
echo "  2. Run 'cd api && npm run dev' to start the API server"
echo "  3. Run 'cd app && npm run dev' to start the frontend"
echo ""
echo "🛑 To stop services: docker-compose -f docker-compose.dev.yml down" 