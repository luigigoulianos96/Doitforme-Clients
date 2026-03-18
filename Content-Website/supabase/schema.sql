-- Run this in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  title text,
  caption text,
  image_url text,
  image_path text,
  username text not null default 'gymway.official',
  like_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  english_language boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

alter table public.clients
  add column if not exists english_language boolean not null default false;

alter table public.posts
  add column if not exists approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'disapproved')),
  add column if not exists client_notes text not null default '',
  add column if not exists client_feedback_image_url text not null default '',
  add column if not exists client_feedback_image_path text not null default '',
  add column if not exists client_feedback_audio_url text not null default '',
  add column if not exists client_feedback_audio_path text not null default '',
  add column if not exists client_id uuid references public.clients(id);

create index if not exists posts_status_sort_idx on public.posts(status, sort_order, created_at desc);
create index if not exists posts_client_sort_idx on public.posts(client_id, status, sort_order, created_at desc);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.clients enable row level security;

-- Public can read only published posts
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
using (status = 'published');

-- Public reviewers can only update approval fields for published posts
grant update (
  approval_status,
  client_notes,
  client_feedback_image_url,
  client_feedback_image_path,
  client_feedback_audio_url,
  client_feedback_audio_path
) on public.posts to anon, authenticated;

drop policy if exists "Public can submit approvals on published posts" on public.posts;
create policy "Public can submit approvals on published posts"
on public.posts
for update
using (status = 'published')
with check (status = 'published');

-- Admin can read/write all posts
drop policy if exists "Admin full access posts" on public.posts;
create policy "Admin full access posts"
on public.posts
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

-- Public can read clients to resolve preview links by slug
drop policy if exists "Public can read clients" on public.clients;
create policy "Public can read clients"
on public.clients
for select
using (true);

-- Admin can read/write all clients
drop policy if exists "Admin full access clients" on public.clients;
create policy "Admin full access clients"
on public.clients
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

-- Admin can read/update own profile
drop policy if exists "Profile self read" on public.profiles;
create policy "Profile self read"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "Profile self update" on public.profiles;
create policy "Profile self update"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- Storage bucket: post-photos (public)
insert into storage.buckets (id, name, public)
values ('post-photos', 'post-photos', true)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Public can view post photos" on storage.objects;
create policy "Public can view post photos"
on storage.objects
for select
using (bucket_id = 'post-photos');

drop policy if exists "Admin can upload post photos" on storage.objects;
create policy "Admin can upload post photos"
on storage.objects
for insert
with check (
  bucket_id = 'post-photos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "Admin can update post photos" on storage.objects;
create policy "Admin can update post photos"
on storage.objects
for update
using (
  bucket_id = 'post-photos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  bucket_id = 'post-photos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "Admin can delete post photos" on storage.objects;
create policy "Admin can delete post photos"
on storage.objects
for delete
using (
  bucket_id = 'post-photos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create table if not exists public.web_push_subscriptions (
  id bigint generated always as identity primary key,
  endpoint text not null unique,
  p256dh_key text not null,
  auth_key text not null,
  user_id uuid references auth.users(id) on delete set null,
  user_agent text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists web_push_subscriptions_status_idx
  on public.web_push_subscriptions(status, updated_at desc);

alter table public.web_push_subscriptions enable row level security;

drop policy if exists "No direct public access to push subscriptions" on public.web_push_subscriptions;
create policy "No direct public access to push subscriptions"
on public.web_push_subscriptions
for all
using (false)
with check (false);

create table if not exists public.content_ideas (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  analysis text not null default '',
  requirements text not null default '',
  inspiration_links jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'disapproved')),
  client_notes text not null default '',
  client_feedback_image_url text not null default '',
  client_feedback_image_path text not null default '',
  client_feedback_audio_url text not null default '',
  client_feedback_audio_path text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

alter table public.content_ideas
  add column if not exists client_feedback_image_url text not null default '',
  add column if not exists client_feedback_image_path text not null default '',
  add column if not exists client_feedback_audio_url text not null default '',
  add column if not exists client_feedback_audio_path text not null default '';

create index if not exists content_ideas_client_sort_idx
  on public.content_ideas(client_id, status, sort_order, created_at desc);

create index if not exists content_ideas_client_approval_idx
  on public.content_ideas(client_id, approval_status, updated_at desc);

alter table public.content_ideas enable row level security;

drop policy if exists "Public can read published ideas" on public.content_ideas;
create policy "Public can read published ideas"
on public.content_ideas
for select
using (status = 'published');

grant select on public.content_ideas to anon, authenticated;

grant update (
  approval_status,
  client_notes,
  client_feedback_image_url,
  client_feedback_image_path,
  client_feedback_audio_url,
  client_feedback_audio_path
) on public.content_ideas to anon, authenticated;

drop policy if exists "Public can submit approvals on published ideas" on public.content_ideas;
create policy "Public can submit approvals on published ideas"
on public.content_ideas
for update
using (status = 'published')
with check (status = 'published');

drop policy if exists "Admin full access ideas" on public.content_ideas;
create policy "Admin full access ideas"
on public.content_ideas
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

-- Harden review notes audit table exposed in public schema
alter table if exists public.review_notes_history enable row level security;

drop policy if exists "No direct public access to review notes history" on public.review_notes_history;
create policy "No direct public access to review notes history"
on public.review_notes_history
for all
using (false)
with check (false);
