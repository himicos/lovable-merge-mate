-- Initial database schema migration
-- Based on existing Supabase schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE message_action AS ENUM (
    'generate_prompt',
    'create_summary', 
    'mark_read',
    'move'
);

CREATE TYPE message_category AS ENUM (
    'important',
    'indirectly_relevant',
    'marketing',
    'system_alert'
);

CREATE TYPE message_source AS ENUM (
    'email',
    'slack', 
    'teams'
);

CREATE TYPE queue_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
);

-- Users table (for custom auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User authentication providers table
CREATE TABLE user_auth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);

-- Gmail connections table
CREATE TABLE gmail_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- Slack connections table
CREATE TABLE slack_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    scope TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- Teams connections table
CREATE TABLE teams_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    scope TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- User integrations table (generic)
CREATE TABLE user_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at BIGINT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Message queue table
CREATE TABLE message_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id VARCHAR(255) NOT NULL,
    source message_source NOT NULL,
    priority INTEGER DEFAULT 0,
    status queue_status DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    payload JSONB NOT NULL,
    error TEXT,
    visible_after TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processed messages table
CREATE TABLE processed_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_message_id VARCHAR(255) NOT NULL,
    source message_source NOT NULL,
    sender VARCHAR(255) NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    category message_category NOT NULL,
    action message_action NOT NULL,
    summary TEXT,
    prompt TEXT,
    raw_data JSONB,
    requires_voice_response BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message responses table
CREATE TABLE message_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES processed_messages(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    response_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auto_process_enabled BOOLEAN DEFAULT TRUE,
    voice_enabled BOOLEAN DEFAULT FALSE,
    marketing_email_policy VARCHAR(50) DEFAULT 'allow',
    system_alert_policy VARCHAR(50) DEFAULT 'allow',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secrets table (for app-level secrets)
CREATE TABLE secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_client_id VARCHAR(255) NOT NULL,
    google_client_secret VARCHAR(255) NOT NULL,
    supabase_url VARCHAR(255),
    supabase_anon_key VARCHAR(255),
    supabase_jwt_secret VARCHAR(255),
    claude_api_key VARCHAR(255),
    elevenlabs_api_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_auth_providers_user_id ON user_auth_providers(user_id);
CREATE INDEX idx_user_auth_providers_provider ON user_auth_providers(provider, provider_id);
CREATE INDEX idx_gmail_connections_user_id ON gmail_connections(user_id);
CREATE INDEX idx_slack_connections_user_id ON slack_connections(user_id);
CREATE INDEX idx_teams_connections_user_id ON teams_connections(user_id);
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_message_queue_user_id ON message_queue(user_id);
CREATE INDEX idx_message_queue_status ON message_queue(status);
CREATE INDEX idx_message_queue_visible_after ON message_queue(visible_after);
CREATE INDEX idx_processed_messages_user_id ON processed_messages(user_id);
CREATE INDEX idx_processed_messages_source ON processed_messages(source);
CREATE INDEX idx_message_responses_user_id ON message_responses(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_auth_providers_updated_at BEFORE UPDATE ON user_auth_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gmail_connections_updated_at BEFORE UPDATE ON gmail_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slack_connections_updated_at BEFORE UPDATE ON slack_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_connections_updated_at BEFORE UPDATE ON teams_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_integrations_updated_at BEFORE UPDATE ON user_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_queue_updated_at BEFORE UPDATE ON message_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secrets_updated_at BEFORE UPDATE ON secrets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 