-- M17 down: vuelve capture_lead a su versión de 202610200001_lead_click_ids.sql
-- y elimina la calificación del lead (áreas, necesidades, presupuesto, plazo y
-- canal).
--
-- ⚠️ Destructivo: borra areas, needs, budget_range, timeline y source_channel de
-- todos los leads. Exportarlos antes si hay datos reales (también quedan copiados
-- en form_submissions.payload).

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

drop function if exists public.lead_text_array(jsonb);

alter table public.leads
  drop constraint if exists leads_areas_check,
  drop constraint if exists leads_needs_check,
  drop constraint if exists leads_budget_range_check,
  drop constraint if exists leads_timeline_check,
  drop constraint if exists leads_source_channel_check;

alter table public.leads
  drop column if exists areas,
  drop column if exists needs,
  drop column if exists budget_range,
  drop column if exists timeline,
  drop column if exists source_channel;
