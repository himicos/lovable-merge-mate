# Lovable Merge Mate Server

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in the environment variables:
   - **Google OAuth**:
     - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
     - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
     - `GOOGLE_REDIRECT_URI`: OAuth callback URL (default: http://localhost:3000/auth/gmail/callback)
   
   - **Supabase**:
     - `SUPABASE_URL`: Your Supabase project URL (default: https://gbhpprzcwearsppfwwon.supabase.co)
     - `SUPABASE_SERVICE_KEY`: Your Supabase service key
   
   - **Server**:
     - `PORT`: Server port (default: 10000)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

### Gmail Integration

- `GET /auth/gmail/url`: Get Gmail OAuth URL
- `GET /auth/gmail/callback`: Handle Gmail OAuth callback
- `POST /webhook/gmail`: Handle Gmail webhook notifications

### Health Check

- `GET /health`: Server health check endpoint
