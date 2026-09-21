-- D5 up: public lead capture through a service-role-only atomic RPC.
create type public.lead_origin_type as enum
  ('campana', 'area', 'contacto', 'importacion', 'referido');

alter table public.leads
  add column company text,
  add column message text,
  add column consent_given boolean not null default false,
  add column consent_at timestamptz,
  add column consent_purpose text,
  add column consent_version text,
  add column utm_source text,
  add column utm_medium text,
  add column utm_campaign text,
  add column utm_term text,
  add column utm_content text,
  add column referrer text,
  add column landing_path text,
  add column origin_type public.lead_origin_type not null default 'contacto',
  add column origin_slug text,
  add column page_id uuid references public.pages(id) on delete set null,
  add column assigned_to uuid references public.profiles(id) on delete set null,
  add column discard_reason text,
  add constraint leads_consent_coherent
    check (consent_given = false or consent_at is not null);

alter table public.form_submissions
  add column submitter_ip_hash text,
  add column submitter_user_agent text;

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_email_idx on public.leads (lower(email));
create index leads_utm_campaign_idx on public.leads (utm_campaign)
  where utm_campaign is not null;
create index leads_origin_idx on public.leads (origin_type, origin_slug);
create index form_submissions_rate_idx
  on public.form_submissions (submitter_ip_hash, submitted_at desc);

insert into public.forms (slug, name, status, success_message) values
  ('campana-inmobiliarias', 'Campaña Inmobiliarias', 'publicado',
   'Gracias. Te contactaremos para coordinar una primera conversación.'),
  ('contacto-general', 'Contacto general', 'publicado', 'Gracias por escribirnos.')
on conflict (slug) do nothing;

create function public.capture_lead(p jsonb) returns uuid
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
