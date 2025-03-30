-- Add metadata column to user_integrations table
alter table public.user_integrations
    add column if not exists metadata jsonb default '{}'::jsonb;

-- Add index on metadata for better query performance
create index if not exists idx_user_integrations_metadata
    on public.user_integrations using gin (metadata);
