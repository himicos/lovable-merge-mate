# Lovable Merge Mate

A complete email and messaging management system with AI-powered processing capabilities, now fully migrated to Railway with custom authentication infrastructure.

## 🚀 **Migration Complete: Supabase → Railway + PostgreSQL + Redis**

This system has been completely migrated from Supabase to a custom infrastructure running on Railway with:
- **PostgreSQL** for data storage
- **Redis** for session management and caching  
- **Custom JWT authentication** system
- **Ready for Railway deployment**

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Database      │
│   React + Vite  │◄──►│   Express + TS  │◄──►│   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │  Session Cache  │
                       └─────────────────┘
```

## 📁 **Project Structure**

```
lovable-merge-mate/
├── api/                    # Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── services/
│   │   │   ├── auth/       # JWT Authentication
│   │   │   ├── database/   # PostgreSQL client
│   │   │   └── redis/      # Redis client
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Auth middleware
├── app/                    # Frontend (React + Vite)
│   ├── services/           # Auth service (JWT-based)
│   ├── context/            # Auth context
│   └── components/         # UI components
├── database/               # Database migrations
│   └── migrations/         # SQL migration files
├── scripts/                # Setup scripts
│   ├── setup-dev.sh       # Local development setup
│   └── deploy-railway.sh  # Railway deployment
├── docker-compose.dev.yml # Local development stack
└── railway.json           # Railway deployment config
```

## 🛠️ **Local Development Setup**

### Prerequisites
- **Node.js** 18+ 
- **Docker** & **Docker Compose**
- **Git**

### Quick Start

1. **Clone and setup:**
   ```bash
   git clone https://github.com/himicos/lovable-merge-mate.git
   cd lovable-merge-mate
   chmod +x scripts/setup-dev.sh
   ./scripts/setup-dev.sh
   ```

2. **Update environment variables:**
   Edit `.env` file with your Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Start development servers:**
   ```bash
   # Terminal 1: API Server
   cd api && npm run dev
   
   # Terminal 2: Frontend
   cd app && npm run dev
   ```

4. **Access the application:**
   - **Frontend:** http://localhost:5173
   - **API:** http://localhost:13337
   - **pgAdmin:** http://localhost:8080 (admin@lovable.com / admin)
   - **Redis Commander:** http://localhost:8082

## 🚀 **Railway Deployment**

### Prerequisites
- **Railway CLI:** `npm install -g @railway/cli`
- **Railway Account:** [railway.app](https://railway.app)

### Deploy Steps

1. **Login to Railway:**
   ```bash
   railway login
   ```

2. **Create services:**
   ```bash
   # Create PostgreSQL service
   railway add --service postgresql
   
   # Create Redis service  
   railway add --service redis
   ```

3. **Set environment variables in Railway dashboard:**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-super-secure-jwt-secret
   REFRESH_TOKEN_SECRET=your-super-secure-refresh-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://your-domain.railway.app/api/auth/google/callback
   CLAUDE_API_KEY=your-claude-api-key (optional)
   ELEVENLABS_API_KEY=your-elevenlabs-api-key (optional)
   ```

4. **Deploy:**
   ```bash
   ./scripts/deploy-railway.sh
   ```

5. **Run database migrations:**
   ```bash
   railway run --service=postgresql psql -f database/migrations/001_initial_schema.sql
   ```

## 🔐 **Authentication System**

### JWT-Based Authentication
- **Access Tokens:** 15-minute expiry
- **Refresh Tokens:** 7-day expiry  
- **Secure Storage:** Redis for session management
- **Auto-refresh:** Frontend automatically refreshes expired tokens

### Supported Authentication Methods
- ✅ Email/Password
- ✅ Google OAuth
- 🔄 Microsoft OAuth (planned)
- 🔄 GitHub OAuth (planned)

### API Endpoints
```
POST /api/auth/signup          # Sign up with email/password
POST /api/auth/signin          # Sign in with email/password  
POST /api/auth/google          # Google OAuth
POST /api/auth/refresh         # Refresh access token
POST /api/auth/signout         # Sign out
GET  /api/auth/me             # Get current user
```

## 📊 **Database Schema**

The system uses PostgreSQL with the following key tables:

- **`users`** - User accounts
- **`user_auth_providers`** - OAuth provider connections  
- **`gmail_connections`** - Gmail integration data
- **`slack_connections`** - Slack integration data
- **`teams_connections`** - Microsoft Teams integration data
- **`message_queue`** - Message processing queue
- **`processed_messages`** - AI-processed messages
- **`user_settings`** - User preferences

## 🔧 **Environment Variables**

### Required for Production
```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Authentication  
JWT_SECRET=your-secure-secret
REFRESH_TOKEN_SECRET=your-secure-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain/api/auth/google/callback
```

### Optional
```env
# AI Services
CLAUDE_API_KEY=your-claude-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## 📚 **API Documentation**

### Health Check
```bash
GET /health
# Returns system status including database and Redis connectivity
```

### Authentication
```bash
# Sign up
POST /api/auth/signup
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "secure-password"
}

# Sign in  
POST /api/auth/signin
Content-Type: application/json
{
  "email": "user@example.com", 
  "password": "secure-password"
}

# Authenticated requests
GET /api/auth/me
Authorization: Bearer <access-token>
```

## 🧪 **Testing**

```bash
# Install dependencies
npm install

# Run API tests
cd api && npm test

# Run frontend tests  
cd app && npm test

# Run e2e tests
npm run test:e2e
```

## 📈 **Monitoring & Logs**

### Railway Deployment
- **Logs:** `railway logs`
- **Metrics:** Railway dashboard
- **Health:** `/health` endpoint

### Local Development
- **API Logs:** Console output in terminal
- **Database:** pgAdmin at http://localhost:8080
- **Redis:** Redis Commander at http://localhost:8082

## 🚨 **Troubleshooting**

### Common Issues

**Database Connection Failed:**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/db
```

**Redis Connection Failed:**
```bash  
# Check Redis URL
echo $REDIS_URL
# Should be: redis://user:pass@host:port
```

**Authentication Not Working:**
- Verify JWT_SECRET is set
- Check Google OAuth credentials
- Ensure CORS origins are configured

### Reset Development Environment
```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down -v

# Restart setup
./scripts/setup-dev.sh
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ **Support**

- **Issues:** [GitHub Issues](https://github.com/himicos/lovable-merge-mate/issues)
- **Discussions:** [GitHub Discussions](https://github.com/himicos/lovable-merge-mate/discussions)
- **Email:** support@lovable.dev

---

**✨ Ready for Railway deployment with custom authentication infrastructure!** 🚀
