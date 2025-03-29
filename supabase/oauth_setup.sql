-- Create OAuth connection tables
CREATE TABLE gmail_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email)
);

CREATE TABLE slack_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    scope TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

CREATE TABLE teams_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    scope TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- Create triggers for updated_at
CREATE TRIGGER update_gmail_connections_updated_at
    BEFORE UPDATE ON gmail_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slack_connections_updated_at
    BEFORE UPDATE ON slack_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_connections_updated_at
    BEFORE UPDATE ON teams_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE gmail_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own Gmail connections"
    ON gmail_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Gmail connections"
    ON gmail_connections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own Slack connections"
    ON slack_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Slack connections"
    ON slack_connections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own Teams connections"
    ON teams_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Teams connections"
    ON teams_connections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
