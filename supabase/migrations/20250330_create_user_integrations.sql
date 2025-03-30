-- Create user_integrations table
create table if not exists public.user_integrations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    provider text not null,
    access_token text not null,
    refresh_token text,
    expires_at bigint,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (user_id, provider)
);

-- Set up RLS policies
alter table public.user_integrations enable row level security;

create policy "Users can view their own integrations"
    on public.user_integrations for select
    using (auth.uid() = user_id);

create policy "Users can insert their own integrations"
    on public.user_integrations for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own integrations"
    on public.user_integrations for update
    using (auth.uid() = user_id);

create policy "Users can delete their own integrations"
    on public.user_integrations for delete
    using (auth.uid() = user_id);
