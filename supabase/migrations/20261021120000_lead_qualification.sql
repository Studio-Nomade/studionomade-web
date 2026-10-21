-- M17 up: calificación del lead desde el formulario dedicado de /contacto.
--
-- `company` ya existe desde 202609200006 (Empresa / Marca); no se toca.
-- Se suman áreas de interés, necesidades, rango de presupuesto, plazo y canal
-- por el que nos conocieron. Son texto con check (no enums) para poder sumar
-- opciones sin reescribir tipos. Los valores deben coincidir con LEAD_AREAS,
-- LEAD_NEEDS, LEAD_BUDGET_RANGES, LEAD_TIMELINES y LEAD_SOURCE_CHANNELS en
-- packages/validation/src/leads.ts.
--
-- Compatibilidad: `capture_lead(p jsonb)` conserva su firma. Las claves nuevas
-- son opcionales; si no vienen, las columnas quedan en null. Los formularios
-- existentes (campaña, áreas, lab) siguen funcionando sin cambios.
--
-- Down (manual): restaurar capture_lead de 202610200001_lead_click_ids.sql y
-- eliminar las restricciones y columnas de abajo (destructivo: exportar antes).

alter table public.leads
  add column if not exists areas text[],
  add column if not exists needs text[],
  add column if not exists budget_range text,
  add column if not exists timeline text,
  add column if not exists source_channel text;

alter table public.leads
  add constraint leads_areas_check
    check (
      areas is null
      or (
        cardinality(areas) between 1 and 4
        and areas <@ array['branding', 'architecture', 'audiovisual', 'web-design']::text[]
      )
    ),
  add constraint leads_needs_check
    check (
      needs is null
      or (
        cardinality(needs) between 1 and 8
        and needs <@ array[
          'imagen_marca',
          'redes_sociales',
          'produccion_audiovisual',
          'estrategia_comunicacional',
          'diseno_web',
          'interiores_stands',
          'asesoria_comunicacional',
          'otro'
        ]::text[]
      )
    ),
  add constraint leads_budget_range_check
    check (
      budget_range is null
      or budget_range in ('menos_1m', '1m_3m', '3m_8m', '8m_20m', 'mas_20m', 'sin_definir')
    ),
  add constraint leads_timeline_check
    check (
      timeline is null
      or timeline in ('lo_antes_posible', '1_3_meses', '3_6_meses', 'sin_fecha')
    ),
  add constraint leads_source_channel_check
    check (
      source_channel is null
      or source_channel in ('recomendacion', 'instagram', 'linkedin', 'behance', 'google', 'otro')
    );

comment on column public.leads.areas is
  'Áreas de interés declaradas: branding | architecture | audiovisual | web-design.';
comment on column public.leads.needs is
  'Necesidades declaradas (selección múltiple del formulario de contacto).';
comment on column public.leads.budget_range is
  'Rango de presupuesto declarado en CLP: menos_1m | 1m_3m | 3m_8m | 8m_20m | mas_20m | sin_definir.';
comment on column public.leads.timeline is
  'Plazo declarado: lo_antes_posible | 1_3_meses | 3_6_meses | sin_fecha.';
comment on column public.leads.source_channel is
  'Cómo nos conoció: recomendacion | instagram | linkedin | behance | google | otro.';

create index if not exists leads_budget_range_idx on public.leads (budget_range)
  where budget_range is not null;
create index if not exists leads_areas_idx on public.leads using gin (areas)
  where areas is not null;

-- Lista de texto desde una clave jsonb; null si no es un arreglo o viene vacío.
create or replace function public.lead_text_array(value jsonb) returns text[]
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when jsonb_typeof(value) = 'array' and jsonb_array_length(value) > 0
      then array(select jsonb_array_elements_text(value))
  end;
$$;

revoke execute on function public.lead_text_array(jsonb) from public, anon, authenticated;
grant execute on function public.lead_text_array(jsonb) to service_role;

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
      areas, needs, budget_range, timeline, source_channel,
      consent_given, consent_at, consent_purpose, consent_version,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      gclid, fbclid, fbp, fbc,
      referrer, landing_path, landing_url, origin_type, origin_slug
    )
    values (
      v_sub, p->>'name', p->>'email', p->>'phone', p->>'company', p->>'message',
      p->>'project_stage',
      public.lead_text_array(p->'areas'),
      public.lead_text_array(p->'needs'),
      p->>'budget_range', p->>'timeline', p->>'source_channel',
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
