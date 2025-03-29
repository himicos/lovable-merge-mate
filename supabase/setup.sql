-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE message_source AS ENUM ('email', 'slack', 'teams');
CREATE TYPE message_category AS ENUM ('important', 'indirectly_relevant', 'marketing', 'system_alert');
CREATE TYPE message_action AS ENUM ('generate_prompt', 'create_summary', 'mark_read', 'move');

-- Create user settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    marketing_email_policy TEXT NOT NULL DEFAULT 'leave',
    system_alert_policy TEXT NOT NULL DEFAULT 'leave',
    voice_enabled BOOLEAN NOT NULL DEFAULT true,
    auto_process_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_marketing_policy CHECK (marketing_email_policy IN ('trash', 'leave')),
    CONSTRAINT valid_system_policy CHECK (system_alert_policy IN ('trash', 'leave'))
);

-- Create processed messages table
CREATE TABLE processed_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_message_id TEXT NOT NULL,
    source message_source NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    category message_category NOT NULL,
    action message_action NOT NULL,
    summary TEXT,
    prompt TEXT,
    requires_voice_response BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    raw_data JSONB
);

-- Create message responses table
CREATE TABLE message_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES processed_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('voice', 'text')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message queue table
CREATE TABLE message_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    message_id TEXT NOT NULL,
    source TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    visible_after TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payload JSONB NOT NULL,
    error TEXT,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

-- Create indexes
CREATE INDEX idx_processed_messages_user_id ON processed_messages(user_id);
CREATE INDEX idx_processed_messages_category ON processed_messages(category);
CREATE INDEX idx_processed_messages_processed_at ON processed_messages(processed_at);
CREATE INDEX idx_message_responses_message_id ON message_responses(message_id);
CREATE INDEX idx_message_responses_user_id ON message_responses(user_id);
CREATE INDEX idx_message_queue_status_priority 
    ON message_queue(status, priority DESC, visible_after)
    WHERE status IN ('pending', 'processing');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_queue_updated_at
    BEFORE UPDATE ON message_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Processed messages policies
CREATE POLICY "Users can view their own messages"
    ON processed_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert processed messages"
    ON processed_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Message responses policies
CREATE POLICY "Users can view their own responses"
    ON message_responses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses"
    ON message_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Message queue policies
CREATE POLICY "Users can view their own queue items"
    ON message_queue FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all queue items"
    ON message_queue FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create secrets table if it doesn't exist
CREATE TABLE IF NOT EXISTS secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claude_api_key TEXT,
    google_client_id TEXT,
    google_client_secret TEXT,
    ms_client_id TEXT,
    ms_client_secret TEXT,
    elevenlabs_api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on secrets table
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access secrets
CREATE POLICY "Service role can manage secrets"
    ON secrets FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
