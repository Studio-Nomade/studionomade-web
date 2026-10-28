drop trigger if exists testimonials_require_authorization on public.testimonials;
drop trigger if exists projects_require_authorization on public.projects;
drop function if exists public.block_unauthorized_publication();
alter table public.media_assets drop column if exists visibility, drop column if exists height,
  drop column if exists width, drop column if exists copyright_notice, drop column if exists caption;
alter table public.testimonials drop column if exists authorization_granted;
alter table public.team_members drop column if exists authorization_granted;
alter table public.projects drop column if exists authorization_granted;
