-- Messages table for chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamp with time zone not null default now()
);

alter table public.messages enable row level security;

-- Read: anyone can read messages (optional: restrict to authenticated only)
create policy if not exists "messages_select_all"
on public.messages for select
using (true);

-- Insert: only authenticated users, must insert own user_id
create policy if not exists "messages_insert_own"
on public.messages for insert
with check (auth.uid() = user_id);

-- Optional: allow users to delete their own messages
create policy if not exists "messages_delete_own"
on public.messages for delete
using (auth.uid() = user_id);

-- Storage bucket for avatars
-- Run once; if bucket exists this will error, you can ignore or create manually
-- select storage.create_bucket('avatars', true, 'public');

