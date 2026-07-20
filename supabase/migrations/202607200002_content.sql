-- M03 up: pages, reusable content, navigation and SEO.
create table public.pages (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  title text not null, status public.content_status not null default 'borrador',
  published_at timestamptz, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'publicado' and published_at is not null) or status <> 'publicado')
);
create table public.page_sections (
  id uuid primary key default extensions.gen_random_uuid(), page_id uuid not null references public.pages(id) on delete cascade,
  section_type text not null, content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0, created_at timestamptz not null default now(),
  unique (page_id, sort_order)
);
create table public.media_assets (
  id uuid primary key default extensions.gen_random_uuid(), bucket_id text not null,
  object_path text not null, alt_text text, mime_type text not null, size_bytes bigint not null check (size_bytes > 0),
  is_published boolean not null default false, created_at timestamptz not null default now(),
  unique (bucket_id, object_path)
);
create table public.testimonials (
  id uuid primary key default extensions.gen_random_uuid(), quote text not null,
  author_name text not null, author_role text, client_id uuid references public.clients(id) on delete set null,
  status public.content_status not null default 'borrador', sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.navigation_menus (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, is_published boolean not null default false, created_at timestamptz not null default now()
);
create table public.navigation_items (
  id uuid primary key default extensions.gen_random_uuid(), menu_id uuid not null references public.navigation_menus(id) on delete cascade,
  parent_id uuid references public.navigation_items(id) on delete cascade, label text not null,
  href text not null, sort_order integer not null default 0, is_published boolean not null default false,
  unique (menu_id, parent_id, sort_order)
);
create table public.redirects (
  id uuid primary key default extensions.gen_random_uuid(), source_path text not null unique,
  destination_path text not null, status_code smallint not null default 308 check (status_code in (301, 302, 307, 308)),
  is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.site_settings (
  id uuid primary key default extensions.gen_random_uuid(), key text not null unique,
  value jsonb not null, is_public boolean not null default false, updated_at timestamptz not null default now()
);
create table public.seo_metadata (
  id uuid primary key default extensions.gen_random_uuid(), page_id uuid not null unique references public.pages(id) on delete cascade,
  title text, description text, canonical_url text, image_path text, robots text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Down (manual, reverse order): drop seo_metadata, site_settings, redirects,
-- navigation_items, navigation_menus, testimonials, media_assets, page_sections and pages.
