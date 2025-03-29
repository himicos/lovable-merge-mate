-- Create enum types
CREATE TYPE message_source AS ENUM ('email', 'slack', 'teams');
CREATE TYPE message_category AS ENUM ('important', 'indirect', 'marketing', 'system_alert');
CREATE TYPE message_action AS ENUM ('generate_prompt', 'store_summary', 'mark_read', 'move_to_folder');

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

-- Create indexes
CREATE INDEX idx_processed_messages_user_id ON processed_messages(user_id);
CREATE INDEX idx_processed_messages_category ON processed_messages(category);
CREATE INDEX idx_processed_messages_processed_at ON processed_messages(processed_at);
CREATE INDEX idx_message_responses_message_id ON message_responses(message_id);
CREATE INDEX idx_message_responses_user_id ON message_responses(user_id);

-- Create RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_responses ENABLE ROW LEVEL SECURITY;

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

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
