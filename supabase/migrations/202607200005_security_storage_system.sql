-- M03 up: audit trail, deny-by-default RLS, explicit public reads and Storage.
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references public.profiles(id) on delete set null,
  action text not null, entity_table text not null, entity_id text,
  before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','roles','permissions','user_roles','user_area_permissions',
    'pages','page_sections','areas','services','area_services','projects','project_areas',
    'project_services','project_capabilities','project_team','project_media','project_links',
    'clients','industries','capabilities','team_members','testimonials','media_assets','prototypes',
    'prototype_features','prototype_media','forms','form_fields','form_submissions','leads','lead_events',
    'navigation_menus','navigation_items','redirects','site_settings','seo_metadata','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
  end loop;
end $$;

create policy "public reads active areas" on public.areas for select to anon using (is_active);
create policy "public reads active services" on public.services for select to anon using (is_active);
create policy "public reads area services" on public.area_services for select to anon using (
  exists (select 1 from public.areas a where a.id = area_id and a.is_active)
  and exists (select 1 from public.services s where s.id = service_id and s.is_active)
);
create policy "public reads industries" on public.industries for select to anon using (true);
create policy "public reads capabilities" on public.capabilities for select to anon using (true);
create policy "public reads published clients" on public.clients for select to anon using (is_published);
create policy "public reads published team" on public.team_members for select to anon using (is_published);
create policy "public reads published pages" on public.pages for select to anon using (status = 'publicado');
create policy "public reads published page sections" on public.page_sections for select to anon using (
  exists (select 1 from public.pages p where p.id = page_id and p.status = 'publicado')
);
create policy "public reads published assets" on public.media_assets for select to anon using (is_published);
create policy "public reads published testimonials" on public.testimonials for select to anon using (status = 'publicado');
create policy "public reads published menus" on public.navigation_menus for select to anon using (is_published);
create policy "public reads published menu items" on public.navigation_items for select to anon using (
  is_published and exists (select 1 from public.navigation_menus m where m.id = menu_id and m.is_published)
);
create policy "public reads active redirects" on public.redirects for select to anon using (is_active);
create policy "public reads public settings" on public.site_settings for select to anon using (is_public);
create policy "public reads published seo" on public.seo_metadata for select to anon using (
  exists (select 1 from public.pages p where p.id = page_id and p.status = 'publicado')
);
create policy "public reads published projects" on public.projects for select to anon using (status = 'publicado');
create policy "public reads published project areas" on public.project_areas for select to anon using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'publicado')
);
create policy "public reads published project services" on public.project_services for select to anon using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'publicado')
);
create policy "public reads published project capabilities" on public.project_capabilities for select to anon using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'publicado')
);
create policy "public reads published project team" on public.project_team for select to anon using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'publicado')
);
create policy "public reads published project media" on public.project_media for select to anon using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'publicado')
);
create policy "public reads published project links" on public.project_links for select to anon using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'publicado')
);
create policy "public reads published prototypes" on public.prototypes for select to anon using (status = 'publicado');
create policy "public reads published prototype features" on public.prototype_features for select to anon using (
  exists (select 1 from public.prototypes p where p.id = prototype_id and p.status = 'publicado')
);
create policy "public reads published prototype media" on public.prototype_media for select to anon using (
  exists (select 1 from public.prototypes p where p.id = prototype_id and p.status = 'publicado')
);
create policy "public reads published forms" on public.forms for select to anon using (status = 'publicado');
create policy "public reads published form fields" on public.form_fields for select to anon using (
  exists (select 1 from public.forms f where f.id = form_id and f.status = 'publicado')
);

grant usage on schema public to anon, authenticated, service_role;
grant select on table
  public.areas, public.services, public.area_services, public.industries, public.capabilities,
  public.clients, public.team_members, public.pages, public.page_sections, public.media_assets,
  public.testimonials, public.navigation_menus, public.navigation_items, public.redirects,
  public.site_settings, public.seo_metadata, public.projects, public.project_areas,
  public.project_services, public.project_capabilities, public.project_team, public.project_media,
  public.project_links, public.prototypes, public.prototype_features, public.prototype_media,
  public.forms, public.form_fields
to anon;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-media', 'public-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml']),
  ('project-media', 'project-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']),
  ('team-media', 'team-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('private-documents', 'private-documents', false, 20971520, array['application/pdf']),
  ('temporary-uploads', 'temporary-uploads', false, 52428800, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "anonymous reads public media buckets" on storage.objects for select to anon
using (bucket_id in ('public-media', 'project-media', 'team-media'));

-- No INSERT/UPDATE/DELETE Storage policy is granted in M03. M04 will authorize writes.
-- Object keys must be generated server-side as UUIDs; private URLs must be signed server-side.
-- Down (manual): drop the Storage policy and five bucket rows; drop all policies above;
-- revoke grants; disable RLS only as part of a full local rollback; finally drop audit_logs.
