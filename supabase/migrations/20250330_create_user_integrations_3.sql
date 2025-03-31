-- Create user_integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at BIGINT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own integrations"
    ON user_integrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
    ON user_integrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
    ON user_integrations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
    ON user_integrations FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_integrations_updated_at
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
