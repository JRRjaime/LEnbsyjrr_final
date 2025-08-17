-- sql/setup.sql — crea tabla `photos`, bucket `blog-images` y políticas básicas

-- 0) Extensiones
create extension if not exists "pgcrypto";

-- 1) Tabla principal
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  tags text[] not null default '{}',
  image_url text not null,
  storage_path text,
  likes int not null default 0,
  is_liked boolean not null default false,
  comments jsonb not null default '[]'::jsonb,
  reactions jsonb not null default '{"heart":0,"love":0,"fire":0,"clap":0}',
  user_reaction text,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

-- 2) Policies para la tabla (desarrollo sin auth)
-- ⚠️ Mientras desarrollas puedes permitir inserts/updates anónimos.
--    Cuando actives login, cambia 'anon, authenticated' por 'authenticated'.
create policy if not exists "public read photos"
on public.photos for select
to anon, authenticated
using (true);

create policy if not exists "anon insert photos (dev)"
on public.photos for insert
to anon, authenticated
with check (true);

create policy if not exists "anon update photos reactions/comments (dev)"
on public.photos for update
to anon, authenticated
using (true);

-- 3) Bucket de Storage (público)
select storage.create_bucket('blog-images', public := true);

-- 4) Policies para el bucket
create policy if not exists "public read blog-images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'blog-images');

create policy if not exists "anon upload blog-images (dev)"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'blog-images');

create policy if not exists "anon update blog-images (dev)"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'blog-images');

create policy if not exists "anon delete blog-images (dev)"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'blog-images');
