-- M03 up: configurable forms, submissions, leads and their event history.
create table public.forms (
  id uuid primary key default extensions.gen_random_uuid(), slug text not null unique,
  name text not null, status public.content_status not null default 'borrador',
  success_message text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.form_fields (
  id uuid primary key default extensions.gen_random_uuid(), form_id uuid not null references public.forms(id) on delete cascade,
  field_key text not null, label text not null, field_type text not null,
  is_required boolean not null default false, options jsonb, sort_order integer not null default 0,
  unique (form_id, field_key), unique (form_id, sort_order)
);
create table public.form_submissions (
  id uuid primary key default extensions.gen_random_uuid(), form_id uuid not null references public.forms(id) on delete restrict,
  payload jsonb not null, source_path text, submitted_at timestamptz not null default now()
);
create table public.leads (
  id uuid primary key default extensions.gen_random_uuid(), submission_id uuid unique references public.form_submissions(id) on delete set null,
  status public.lead_status not null default 'nuevo', name text, email text, phone text,
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.lead_events (
  id uuid primary key default extensions.gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade,
  event_type text not null, from_status public.lead_status, to_status public.lead_status,
  metadata jsonb not null default '{}'::jsonb, actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Down (manual, reverse order): drop lead_events, leads, form_submissions, form_fields and forms.
