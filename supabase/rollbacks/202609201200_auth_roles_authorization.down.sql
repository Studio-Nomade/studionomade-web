-- M04 down: revierte el catálogo de roles, el mapeo de permisos, los helpers de
-- autorización, el aprovisionamiento de perfiles, la auditoría y toda la RLS de
-- escritura. Deja la base exactamente como la entregó M03.

-- ------------------------------------------------------------- Storage

drop policy if exists "lead managers read private documents" on storage.objects;
drop policy if exists "authenticated reads public buckets"   on storage.objects;
drop policy if exists "content writers delete public media"  on storage.objects;
drop policy if exists "content writers update public media"  on storage.objects;
drop policy if exists "content writers upload public media"  on storage.objects;

-- -------------------------------------------------------- RLS: auditoría

drop policy if exists "user managers read audit logs" on public.audit_logs;

-- ------------------------------------------------------------- RLS: leads

drop policy if exists "content readers read form fields"     on public.form_fields;
drop policy if exists "content readers read forms"           on public.forms;
drop policy if exists "settings managers write form fields"  on public.form_fields;
drop policy if exists "settings managers write forms"        on public.forms;
drop policy if exists "lead managers insert lead events"     on public.lead_events;
drop policy if exists "lead managers read lead events"       on public.lead_events;
drop policy if exists "lead managers read submissions"       on public.form_submissions;
drop policy if exists "lead managers update leads"           on public.leads;
drop policy if exists "lead managers read leads"             on public.leads;

-- --------------------------------------------------- RLS: lectura y escritura

drop policy if exists "content readers read prototype media"        on public.prototype_media;
drop policy if exists "content readers read prototype features"     on public.prototype_features;
drop policy if exists "content readers read project links"          on public.project_links;
drop policy if exists "content readers read project media"          on public.project_media;
drop policy if exists "content readers read project team"           on public.project_team;
drop policy if exists "content readers read project capabilities"   on public.project_capabilities;
drop policy if exists "content readers read project services"       on public.project_services;
drop policy if exists "content readers read project areas"          on public.project_areas;
drop policy if exists "content readers read area services"          on public.area_services;
drop policy if exists "content readers read capabilities"           on public.capabilities;
drop policy if exists "content readers read industries"             on public.industries;
drop policy if exists "content readers read clients"                on public.clients;

drop policy if exists "settings managers write capabilities"  on public.capabilities;
drop policy if exists "settings managers write industries"    on public.industries;
drop policy if exists "settings managers write clients"       on public.clients;
drop policy if exists "settings managers write settings"      on public.site_settings;
drop policy if exists "settings managers write redirects"     on public.redirects;
drop policy if exists "settings managers write menu items"    on public.navigation_items;
drop policy if exists "settings managers write menus"         on public.navigation_menus;
drop policy if exists "settings managers write area services" on public.area_services;
drop policy if exists "settings managers write services"      on public.services;
drop policy if exists "settings managers write areas"         on public.areas;

drop policy if exists "content writers write prototype media"       on public.prototype_media;
drop policy if exists "content writers write prototype features"    on public.prototype_features;
drop policy if exists "content writers write prototypes"            on public.prototypes;
drop policy if exists "content writers write seo"                   on public.seo_metadata;
drop policy if exists "content writers write team"                  on public.team_members;
drop policy if exists "content writers write testimonials"          on public.testimonials;
drop policy if exists "content writers write media"                 on public.media_assets;
drop policy if exists "content writers write project links"         on public.project_links;
drop policy if exists "content writers write project media"         on public.project_media;
drop policy if exists "content writers write project team"          on public.project_team;
drop policy if exists "content writers write project capabilities"  on public.project_capabilities;
drop policy if exists "content writers write project services"      on public.project_services;
drop policy if exists "content writers write project areas"         on public.project_areas;
drop policy if exists "content writers delete projects"             on public.projects;
drop policy if exists "content writers update projects"             on public.projects;
drop policy if exists "content writers insert projects"             on public.projects;
drop policy if exists "content writers write page sections"         on public.page_sections;
drop policy if exists "content writers delete pages"                on public.pages;
drop policy if exists "content writers update pages"                on public.pages;
drop policy if exists "content writers insert pages"                on public.pages;

drop policy if exists "content readers read settings"      on public.site_settings;
drop policy if exists "content readers read redirects"     on public.redirects;
drop policy if exists "content readers read menu items"    on public.navigation_items;
drop policy if exists "content readers read menus"         on public.navigation_menus;
drop policy if exists "content readers read seo"           on public.seo_metadata;
drop policy if exists "content readers read prototypes"    on public.prototypes;
drop policy if exists "content readers read services"      on public.services;
drop policy if exists "content readers read areas"         on public.areas;
drop policy if exists "content readers read team"          on public.team_members;
drop policy if exists "content readers read testimonials"  on public.testimonials;
drop policy if exists "content readers read media"         on public.media_assets;
drop policy if exists "content readers read projects"      on public.projects;
drop policy if exists "content readers read page sections" on public.page_sections;
drop policy if exists "content readers read pages"         on public.pages;

-- ------------------------------------------------------------ RLS: identidad

drop policy if exists "user managers write area permissions"  on public.user_area_permissions;
drop policy if exists "users read own area permissions"       on public.user_area_permissions;
drop policy if exists "user managers assign roles"            on public.user_roles;
drop policy if exists "user managers read all roles"          on public.user_roles;
drop policy if exists "users read own roles"                  on public.user_roles;
drop policy if exists "user managers write role permissions"  on public.role_permissions;
drop policy if exists "authenticated reads role permissions"  on public.role_permissions;
drop policy if exists "authenticated reads permissions"       on public.permissions;
drop policy if exists "authenticated reads roles"             on public.roles;
drop policy if exists "user managers write profiles"          on public.profiles;
drop policy if exists "user managers read profiles"           on public.profiles;
drop policy if exists "users update own profile"              on public.profiles;
drop policy if exists "users read own profile"                on public.profiles;

-- ------------------------------------------------------------- auditoría

drop trigger if exists audit_site_settings          on public.site_settings;
drop trigger if exists audit_user_area_permissions  on public.user_area_permissions;
drop trigger if exists audit_user_roles             on public.user_roles;
drop function if exists public.log_audit_event();

-- -------------------------------------------------- perfiles y autorización

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop function if exists public.can_publish_area(uuid);
drop function if exists public.can_edit_area(uuid);
drop function if exists public.has_permission(text);
drop function if exists public.has_role(text);
drop function if exists public.current_role_slugs();

-- --------------------------------------------------------------- grants

revoke select, insert, update, delete on all tables in schema public from authenticated;
revoke usage, select on all sequences in schema public from authenticated;

-- --------------------------------------------------------- catálogo de roles

drop table if exists public.role_permissions;

delete from public.roles
where slug in ('superadmin', 'reviewer', 'area_editor', 'commercial', 'analyst', 'collaborator');

update public.roles set is_active = true where slug in ('author', 'viewer');

alter table public.roles drop column if exists is_active;
