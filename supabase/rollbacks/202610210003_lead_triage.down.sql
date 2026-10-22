-- M19 down: quita prioridad y área asignada de los leads.
--
-- ⚠️ Destructivo: borra la clasificación de todos los leads (el historial queda
-- en lead_events).

drop index if exists public.leads_status_created_idx;

alter table public.leads
  drop constraint if exists leads_priority_check,
  drop constraint if exists leads_assigned_area_check;

alter table public.leads
  drop column if exists priority,
  drop column if exists assigned_area;
