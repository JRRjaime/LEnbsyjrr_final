-- Run this in Supabase SQL editor
create extension if not exists "pgcrypto";

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  tags text[] not null default '{}',
  image_url text not null,
  url text,
  storage_path text,
  likes int not null default 0,
  is_liked boolean not null default false,
  comments jsonb not null default '[]'::jsonb,
  reactions jsonb not null default '{"heart":0,"love":0,"fire":0,"clap":0}',
  user_reaction text,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "Public read photos" on public.photos;
create policy "Public read photos"
on public.photos for select
to anon, authenticated
using (true);

drop policy if exists "anon insert photos (dev)" on public.photos;
create policy "anon insert photos (dev)"
on public.photos for insert
to anon, authenticated
with check (true);

drop policy if exists "anon update photos reactions/comments (dev)" on public.photos;
create policy "anon update photos reactions/comments (dev)"
on public.photos for update
to anon, authenticated
using (true);

-- bucket
select storage.create_bucket('blog-images', public := true);

drop policy if exists "public read blog-images" on storage.objects;
create policy "public read blog-images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'blog-images');

drop policy if exists "Anon upload blog-images (dev)" on storage.objects;
create policy "Anon upload blog-images (dev)"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'blog-images');
