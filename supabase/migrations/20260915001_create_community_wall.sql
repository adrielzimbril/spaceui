-- Community Wall table for Space UI
create table if not exists public.community_wall (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  creator_name text not null,
  creator_avatar_url text,
  message text not null,
  pattern_index integer default 0,
  rotation integer default 0,
  is_verified boolean default false,
  created_at timestamptz not null default now()
);

alter table public.community_wall enable row level security;

-- Allow public read access to all messages
drop policy if exists community_wall_select_all on public.community_wall;
create policy community_wall_select_all
  on public.community_wall
  for select using (true);

-- Allow public and authenticated inserts
drop policy if exists community_wall_insert_all on public.community_wall;
create policy community_wall_insert_all
  on public.community_wall
  for insert with check (true);

-- Allow users to update their own messages
drop policy if exists community_wall_update_own on public.community_wall;
create policy community_wall_update_own
  on public.community_wall
  for update using (auth.uid() = user_id);

-- Allow users to delete their own messages
drop policy if exists community_wall_delete_own on public.community_wall;
create policy community_wall_delete_own
  on public.community_wall
  for delete using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists community_wall_created_at_idx 
  on public.community_wall(created_at desc);

create index if not exists community_wall_user_id_idx 
  on public.community_wall(user_id);
