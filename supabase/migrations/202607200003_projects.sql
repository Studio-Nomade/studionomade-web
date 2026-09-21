-- M03 up: projects and Digital Lab prototypes.
create table public.projects (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  title text not null, summary text, body jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'borrador', client_id uuid references public.clients(id) on delete set null,
  primary_area_id uuid not null references public.areas(id) on delete restrict,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((status = 'publicado' and published_at is not null) or status <> 'publicado')
);
create table public.project_areas (
  project_id uuid not null references public.projects(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete restrict,
  relation_kind public.area_relation_kind not null default 'complementaria',
  primary key (project_id, area_id)
);
create unique index project_one_principal_area on public.project_areas(project_id) where relation_kind = 'principal';
create table public.project_services (
  project_id uuid not null references public.projects(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  primary key (project_id, service_id)
);
create table public.project_capabilities (
  project_id uuid not null references public.projects(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  primary key (project_id, capability_id)
);
create table public.project_team (
  project_id uuid not null references public.projects(id) on delete cascade,
  team_member_id uuid not null references public.team_members(id) on delete restrict,
  credit_role text, sort_order integer not null default 0,
  primary key (project_id, team_member_id)
);
create table public.project_media (
  id uuid primary key default extensions.gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null default 'gallery', sort_order integer not null default 0,
  unique (project_id, media_asset_id)
);
create table public.project_links (
  id uuid primary key default extensions.gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  label text not null, url text not null, sort_order integer not null default 0
);
create table public.prototypes (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  title text not null, description text, external_url text,
  status public.content_status not null default 'borrador', published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((status = 'publicado' and published_at is not null) or status <> 'publicado')
);
create table public.prototype_features (
  id uuid primary key default extensions.gen_random_uuid(), prototype_id uuid not null references public.prototypes(id) on delete cascade,
  title text not null, description text, sort_order integer not null default 0,
  unique (prototype_id, sort_order)
);
create table public.prototype_media (
  id uuid primary key default extensions.gen_random_uuid(), prototype_id uuid not null references public.prototypes(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 0, unique (prototype_id, media_asset_id)
);

-- Down (manual, reverse order): drop prototype_media, prototype_features, prototypes,
-- project_links, project_media, project_team, project_capabilities, project_services,
-- project_areas (and project_one_principal_area), then projects.
