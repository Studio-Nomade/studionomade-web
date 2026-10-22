-- M19 up: clasificación de leads en el admin antes de derivarlos a NOMA.
--
-- Se suman prioridad y área asignada. Estado, responsable (assigned_to), motivo
-- de descarte y notas internas (notes) ya existen. Cada cambio queda en
-- lead_events desde el admin.
--
-- Down: supabase/rollbacks/202610210003_lead_triage.down.sql

alter table public.leads
  add column if not exists priority text,
  add column if not exists assigned_area text;

alter table public.leads
  add constraint leads_priority_check
    check (priority is null or priority in ('alta', 'media', 'baja')),
  add constraint leads_assigned_area_check
    check (
      assigned_area is null
      or assigned_area in ('branding', 'architecture', 'audiovisual', 'web-design')
    );

comment on column public.leads.priority is 'Prioridad comercial asignada en el admin: alta | media | baja.';
comment on column public.leads.assigned_area is
  'Área del Studio que toma el lead: branding | architecture | audiovisual | web-design.';

create index if not exists leads_status_created_idx on public.leads (status, created_at desc);
