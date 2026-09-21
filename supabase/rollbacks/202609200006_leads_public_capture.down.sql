-- D5 down: remove lead capture additions in reverse dependency order.
drop function if exists public.capture_lead(jsonb);

drop index if exists public.form_submissions_rate_idx;
drop index if exists public.leads_origin_idx;
drop index if exists public.leads_utm_campaign_idx;
drop index if exists public.leads_email_idx;
drop index if exists public.leads_created_at_idx;

alter table public.form_submissions
  drop column if exists submitter_user_agent,
  drop column if exists submitter_ip_hash;

alter table public.leads
  drop constraint if exists leads_consent_coherent,
  drop column if exists discard_reason,
  drop column if exists assigned_to,
  drop column if exists page_id,
  drop column if exists origin_slug,
  drop column if exists origin_type,
  drop column if exists landing_path,
  drop column if exists referrer,
  drop column if exists utm_content,
  drop column if exists utm_term,
  drop column if exists utm_campaign,
  drop column if exists utm_medium,
  drop column if exists utm_source,
  drop column if exists consent_version,
  drop column if exists consent_purpose,
  drop column if exists consent_at,
  drop column if exists consent_given,
  drop column if exists message,
  drop column if exists company;

drop type if exists public.lead_origin_type;

delete from public.forms
where slug in ('campana-inmobiliarias', 'contacto-general');
