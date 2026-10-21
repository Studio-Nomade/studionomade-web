-- M18 up: blog del sitio público (notas), editable desde el admin.
--
-- El cuerpo es jsonb con bloques estructurados sin HTML (validados en
-- packages/content-schema/src/blog.ts). Lectura pública solo de lo publicado y
-- ya fechado; escritura para quien tenga content.write y publicación solo con
-- content.publish (mismo modelo que proyectos y páginas).
--
-- Down: supabase/rollbacks/202610210002_blog_posts.down.sql

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text check (excerpt is null or char_length(excerpt) <= 400),
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  cover_url text check (cover_url is null or cover_url ~ '^(/|https://)'),
  cover_alt text check (cover_alt is null or char_length(cover_alt) <= 300),
  category text not null default 'Estudio' check (char_length(category) between 1 and 60),
  tags text[] not null default '{}'::text[] check (cardinality(tags) <= 12),
  area text check (area is null or area in ('branding', 'architecture', 'audiovisual', 'web-design')),
  author_name text check (author_name is null or char_length(author_name) <= 120),
  status public.content_status not null default 'borrador',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_published_has_date
    check (status <> 'publicado' or published_at is not null)
);

comment on table public.blog_posts is
  'Notas del blog del sitio público. Cuerpo en bloques jsonb sin HTML.';

create index blog_posts_public_idx on public.blog_posts (published_at desc)
  where status = 'publicado';
create index blog_posts_category_idx on public.blog_posts (category);

create trigger blog_posts_touch_updated_at before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- Publicar (o despublicar) exige content.publish. El service_role (seeds,
-- importaciones) queda fuera de esta regla.
create function public.blog_posts_require_publish() returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(auth.role(), '') = 'authenticated'
     and (new.status = 'publicado' or (tg_op = 'UPDATE' and old.status = 'publicado'))
     and not public.has_permission('content.publish') then
    raise exception 'Publicar notas requiere el permiso content.publish'
      using errcode = '42501';
  end if;
  if new.status = 'publicado' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger blog_posts_require_publish before insert or update on public.blog_posts
  for each row execute function public.blog_posts_require_publish();

alter table public.blog_posts enable row level security;

create policy "public reads published posts" on public.blog_posts
  for select to anon, authenticated
  using (status = 'publicado' and published_at <= now());
create policy "content readers read all posts" on public.blog_posts
  for select to authenticated using (public.has_permission('content.read'));
create policy "content writers insert posts" on public.blog_posts
  for insert to authenticated with check (public.has_permission('content.write'));
create policy "content writers update posts" on public.blog_posts
  for update to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content publishers delete posts" on public.blog_posts
  for delete to authenticated using (public.has_permission('content.publish'));

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
