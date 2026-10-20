-- M16 up: atribución de clics (Google/Meta), URL de aterrizaje y etapa del
-- proyecto como dato propio del lead.
--
-- `referrer` y `landing_path` ya existen desde 202609200006; no se tocan.
-- `project_stage` es texto con check (no enum) para poder sumar etapas sin
-- reescribir el tipo. Los valores deben coincidir con PROJECT_STAGES en
-- packages/validation/src/leads.ts.

alter table public.leads
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists fbp text,
  add column if not exists fbc text,
  add column if not exists landing_url text,
  add column if not exists project_stage text;

alter table public.leads
  add constraint leads_project_stage_check
    check (project_stage is null or project_stage in ('idea', 'en_desarrollo', 'en_venta')),
  add constraint leads_attribution_length_check
    check (
      coalesce(length(gclid), 0) <= 512
      and coalesce(length(fbclid), 0) <= 512
      and coalesce(length(fbp), 0) <= 255
      and coalesce(length(fbc), 0) <= 1024
      and coalesce(length(landing_url), 0) <= 2048
    );

comment on column public.leads.gclid is 'Google Click ID del primer contacto de la sesión.';
comment on column public.leads.fbclid is 'Meta Click ID del primer contacto de la sesión.';
comment on column public.leads.fbp is 'Cookie _fbp del navegador al enviar (Conversions API).';
comment on column public.leads.fbc is 'Cookie _fbc, o derivada de fbclid si no existía (Conversions API).';
comment on column public.leads.landing_url is 'URL completa de aterrizaje del primer contacto de la sesión.';
comment on column public.leads.project_stage is 'Etapa declarada del proyecto: idea | en_desarrollo | en_venta.';

create index if not exists leads_gclid_idx on public.leads (gclid) where gclid is not null;
create index if not exists leads_fbclid_idx on public.leads (fbclid) where fbclid is not null;

-- Rescata la etapa de los leads que la tenían pegada al inicio de `message`
-- ("Etapa: En desarrollo\n\n..."). El mensaje original se conserva.
update public.leads
  set project_stage = case split_part(message, E'\n', 1)
    when 'Etapa: Idea' then 'idea'
    when 'Etapa: En desarrollo' then 'en_desarrollo'
    when 'Etapa: En venta' then 'en_venta'
  end
  where project_stage is null and message like 'Etapa: %';

create or replace function public.capture_lead(p jsonb) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_form uuid;
  v_sub uuid;
  v_lead uuid;
begin
  select id into strict v_form
    from public.forms
    where slug = p->>'form_slug' and status = 'publicado';

  insert into public.form_submissions
      (form_id, payload, source_path, submitter_ip_hash, submitter_user_agent)
    values (
      v_form,
      coalesce(p->'payload', '{}'::jsonb),
      p->>'source_path',
      p->>'ip_hash',
      p->>'user_agent'
    )
    returning id into v_sub;

  insert into public.leads (
      submission_id, name, email, phone, company, message, project_stage,
      consent_given, consent_at, consent_purpose, consent_version,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      gclid, fbclid, fbp, fbc,
      referrer, landing_path, landing_url, origin_type, origin_slug
    )
    values (
      v_sub, p->>'name', p->>'email', p->>'phone', p->>'company', p->>'message',
      p->>'project_stage',
      coalesce((p->>'consent_given')::boolean, false),
      (p->>'consent_at')::timestamptz,
      p->>'consent_purpose', p->>'consent_version',
      p->>'utm_source', p->>'utm_medium', p->>'utm_campaign',
      p->>'utm_term', p->>'utm_content',
      p->>'gclid', p->>'fbclid', p->>'fbp', p->>'fbc',
      p->>'referrer', p->>'landing_path', p->>'landing_url',
      coalesce((p->>'origin_type')::public.lead_origin_type, 'contacto'),
      p->>'origin_slug'
    )
    returning id into v_lead;

  insert into public.lead_events (lead_id, event_type, to_status, metadata)
    values (
      v_lead,
      'creado',
      'nuevo',
      jsonb_build_object('origen', p->>'origin_slug')
    );

  return v_lead;
end;
$$;

revoke execute on function public.capture_lead(jsonb) from public, anon, authenticated;
grant execute on function public.capture_lead(jsonb) to service_role;
