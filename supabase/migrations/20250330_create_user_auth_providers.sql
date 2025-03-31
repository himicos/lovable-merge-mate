-- Create user auth providers table
CREATE TABLE user_auth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_id),
    UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE user_auth_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own auth providers"
    ON user_auth_providers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own auth providers"
    ON user_auth_providers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auth providers"
    ON user_auth_providers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auth providers"
    ON user_auth_providers FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_auth_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
