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

-- Profiles table for username-based login lookup
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (length(trim(username)) >= 3),
  email text unique not null,
  created_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

-- Read: allow selecting username/email pairs (simple demo; consider restricting in prod)
create policy if not exists "profiles_select_all"
on public.profiles for select
using (true);

-- Insert/Update: only the owner can write their row
create policy if not exists "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy if not exists "profiles_update_own"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
