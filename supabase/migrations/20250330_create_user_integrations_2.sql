-- Enable RLS
alter table public.user_integrations enable row level security;

-- Create policies one by one
create policy "Users can view their own integrations"
    on public.user_integrations 
    for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own integrations"
    on public.user_integrations 
    for insert 
    with check (auth.uid() = user_id);

create policy "Users can update their own integrations"
    on public.user_integrations 
    for update 
    using (auth.uid() = user_id);

create policy "Users can delete their own integrations"
    on public.user_integrations 
    for delete 
    using (auth.uid() = user_id);
