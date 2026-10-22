-- M16 down: vuelve capture_lead a su versión de 202609200006 y elimina las
-- columnas de atribución y etapa. `referrer` y `landing_path` no se tocan:
-- pertenecen a 202609200006.
--
-- ⚠️ Destructivo: borra gclid, fbclid, fbp, fbc, landing_url y project_stage
-- de todos los leads. Exportarlos antes si hay datos reales.

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
      submission_id, name, email, phone, company, message,
      consent_given, consent_at, consent_purpose, consent_version,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      referrer, landing_path, origin_type, origin_slug
    )
    values (
      v_sub, p->>'name', p->>'email', p->>'phone', p->>'company', p->>'message',
      coalesce((p->>'consent_given')::boolean, false),
      (p->>'consent_at')::timestamptz,
      p->>'consent_purpose', p->>'consent_version',
      p->>'utm_source', p->>'utm_medium', p->>'utm_campaign',
      p->>'utm_term', p->>'utm_content',
      p->>'referrer', p->>'landing_path',
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

drop index if exists public.leads_fbclid_idx;
drop index if exists public.leads_gclid_idx;

alter table public.leads
  drop constraint if exists leads_attribution_length_check,
  drop constraint if exists leads_project_stage_check,
  drop column if exists project_stage,
  drop column if exists landing_url,
  drop column if exists fbc,
  drop column if exists fbp,
  drop column if exists fbclid,
  drop column if exists gclid;
