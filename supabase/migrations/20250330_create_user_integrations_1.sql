-- Create user_integrations table
create table if not exists public.user_integrations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    provider text not null,
    access_token text not null,
    refresh_token text,
    expires_at bigint,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add unique constraint
alter table public.user_integrations 
    add constraint user_integrations_user_id_provider_key 
    unique (user_id, provider);
