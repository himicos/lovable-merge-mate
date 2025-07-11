# Production Deployment Guide

## Overview
This guide covers deploying the entire Verby production environment to Railway, including:
- API Backend (Express.js)
- React Frontend App
- Public Landing Page

## Prerequisites

1. **Railway CLI** installed and authenticated:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Environment Variables** configured in Railway dashboard:
   - See `railway.env.template` for complete list
   - Critical variables must be set before deployment

3. **DNS Records** updated in GoDaddy to point to Railway IPs

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\deploy-production.ps1
```

**Linux/Mac (Bash):**
```bash
./scripts/deploy-production.sh
```

### Method 2: Manual Deployment

Deploy each service individually:

```bash
# 1. Deploy API Service
cd api
railway link --service verby-api --environment production
railway up --detach
cd ..

# 2. Deploy App Service
cd app
railway link --service verby-app --environment production
railway up --detach
cd ..

# 3. Deploy Public Service
cd www
railway link --service verby-public --environment production
railway up --detach
cd ..
```

## Environment Configuration

### Required Environment Variables

Set these in Railway dashboard for each service:

#### API Service (verby-api)
```env
NODE_ENV=production
JWT_SECRET=[64-char-random-string]
REFRESH_TOKEN_SECRET=[64-char-random-string]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
GOOGLE_REDIRECT_URI=https://api.verby.eu/api/gmail/callback
CLAUDE_API_KEY=[your-claude-key]
ELEVENLABS_API_KEY=[your-elevenlabs-key]
FRONTEND_URL=https://app.verby.eu
CORS_ORIGINS=https://app.verby.eu,https://verby.eu,https://api.verby.eu
```

#### App Service (verby-app)
```env
NODE_ENV=production
VITE_API_URL=https://api.verby.eu
VITE_APP_URL=https://app.verby.eu
VITE_GOOGLE_CLIENT_ID=[your-google-client-id]
VITE_ENVIRONMENT=production
```

#### Public Service (verby-public)
```env
NODE_ENV=production
VITE_APP_URL=https://app.verby.eu
VITE_API_URL=https://api.verby.eu
VITE_ENVIRONMENT=production
```

### Auto-configured by Railway
- `DATABASE_URL` (PostgreSQL service)
- `REDIS_URL` (Redis service)
- `PORT` (Railway assigns automatically)

## DNS Configuration

Update GoDaddy DNS records:

```
Type: A    Host: @    Points to: 66.33.22.1    TTL: 600
Type: A    Host: api  Points to: 66.33.22.1    TTL: 600
Type: A    Host: app  Points to: 66.33.22.1    TTL: 600
```

## Google OAuth Setup

1. **Authorized Domains** (OAuth consent screen):
   - `verby.eu`

2. **Authorized JavaScript Origins**:
   - `https://verby.eu`
   - `https://app.verby.eu`
   - `https://api.verby.eu`

3. **Authorized Redirect URIs**:
   - `https://api.verby.eu/api/gmail/callback`
   - `https://app.verby.eu/auth/callback`

## Service URLs

### Railway Direct URLs
- API: `https://verby-api-production-d6bf.up.railway.app`
- App: `https://verby-app-production-3025.up.railway.app`
- Public: `https://[public-service-url].up.railway.app`

### Custom Domain URLs (after DNS setup)
- API: `https://api.verby.eu`
- App: `https://app.verby.eu`
- Public: `https://verby.eu`

## Monitoring & Troubleshooting

### View Logs
```bash
# Link to specific service first
railway link --service verby-api
railway logs --tail

# Or view logs for all services
railway logs --service verby-api --tail
railway logs --service verby-app --tail
railway logs --service verby-public --tail
```

### Check Status
```bash
railway status
railway ps
```

### Environment Variables
```bash
railway variables
railway variables set KEY=value
```

## Deployment Checklist

- [ ] Railway CLI installed and authenticated
- [ ] All environment variables configured
- [ ] API service deployed successfully
- [ ] App service deployed successfully
- [ ] Public service deployed successfully
- [ ] DNS records updated in GoDaddy
- [ ] Google OAuth configuration updated
- [ ] All services accessible via custom domains
- [ ] Email integration working
- [ ] AI features working (Claude, ElevenLabs)
- [ ] Authentication flow working end-to-end

## Rollback Procedure

If deployment fails:

1. **Check logs**: `railway logs --tail`
2. **Revert to previous version**: Use Railway dashboard
3. **Emergency**: Point DNS back to old service temporarily

## Support

For deployment issues:
1. Check Railway logs for errors
2. Verify environment variables are set correctly
3. Ensure DNS propagation is complete (up to 48 hours)
4. Test OAuth flow with new domains

## Security Notes

- All secrets should be stored in Railway environment variables
- Never commit sensitive data to git
- Use strong, randomly generated JWT secrets
- Regularly rotate API keys and secrets 