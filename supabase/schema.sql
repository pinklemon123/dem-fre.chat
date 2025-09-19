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

-- Posts table: only logged-in users can create; public readable
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  content text not null check (length(trim(content)) > 0),
  created_at timestamp with time zone not null default now()
);

alter table public.posts enable row level security;

-- Read: anyone can read posts (you can restrict to authenticated only if desired)
create policy if not exists "posts_select_all"
on public.posts for select
using (true);

-- Insert: only authenticated users; must write with their own user_id
create policy if not exists "posts_insert_own"
on public.posts for insert
with check (auth.uid() = user_id);

-- Optional: allow users to update/delete自己的帖子
create policy if not exists "posts_update_own"
on public.posts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "posts_delete_own"
on public.posts for delete
using (auth.uid() = user_id);
