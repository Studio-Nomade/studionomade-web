-- M03 up: shared types, identity, authorization and catalog tables.
create extension if not exists pgcrypto with schema extensions;

create type public.content_status as enum ('borrador', 'revision', 'publicado', 'archivado');
create type public.lead_status as enum ('nuevo', 'contactado', 'calificado', 'descartado', 'convertido');
create type public.area_relation_kind as enum ('principal', 'complementaria');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  avatar_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.roles (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, description text, created_at timestamptz not null default now()
);
create table public.permissions (
  id uuid primary key default extensions.gen_random_uuid(), code text not null unique,
  description text not null, created_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);
create table public.areas (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, description text, is_active boolean not null default true,
  sort_order integer not null default 0, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.user_area_permissions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  can_edit boolean not null default false, can_publish boolean not null default false,
  primary key (user_id, area_id)
);
create table public.services (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, description text, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.area_services (
  area_id uuid not null references public.areas(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (area_id, service_id)
);
create table public.industries (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, created_at timestamptz not null default now()
);
create table public.capabilities (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, created_at timestamptz not null default now()
);
create table public.clients (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, industry_id uuid references public.industries(id) on delete set null,
  website_url text, logo_path text, is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.team_members (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, role_title text, bio text, portrait_path text,
  is_published boolean not null default false, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Down (manual, reverse order): drop team_members, clients, capabilities, industries,
-- area_services, services, user_area_permissions, areas, user_roles,
-- permissions, roles, profiles; then area_relation_kind, lead_status and content_status.
