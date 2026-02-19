-- Run this in Supabase SQL editor

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

create index if not exists posts_status_sort_idx on public.posts(status, sort_order, created_at desc);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- Public can read only published posts
create policy if not exists "Public can read published posts"
on public.posts
for select
using (status = 'published');

-- Admin can read/write all posts
create policy if not exists "Admin full access posts"
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

-- Admin can read/update own profile
create policy if not exists "Profile self read"
on public.profiles
for select
using (id = auth.uid());

create policy if not exists "Profile self update"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- Storage bucket: post-photos (public)
insert into storage.buckets (id, name, public)
values ('post-photos', 'post-photos', true)
on conflict (id) do nothing;

-- Storage policies
create policy if not exists "Public can view post photos"
on storage.objects
for select
using (bucket_id = 'post-photos');

create policy if not exists "Admin can upload post photos"
on storage.objects
for insert
with check (
  bucket_id = 'post-photos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy if not exists "Admin can update post photos"
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

create policy if not exists "Admin can delete post photos"
on storage.objects
for delete
using (
  bucket_id = 'post-photos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);
