-- M04 up: catálogo de roles real, mapeo rol→permiso, helpers de autorización,
-- aprovisionamiento de perfiles y RLS de escritura para usuarios autenticados.
--
-- M03 dejó la base deny-by-default: `anon` solo lee lo publicado y no existe ninguna
-- política de escritura ("M04 will authorize writes"). Esta migración añade esa capa.
--
-- Reconciliación de catálogo: M03 sembró 4 roles provisionales (admin, editor, author,
-- viewer) que no coinciden con la matriz de menor privilegio de 8 roles del threat-model.
-- Se añaden los 6 que faltan y se DESACTIVAN author/viewer en vez de borrarlos: es
-- reversible y no rompe referencias existentes en user_roles.

-- ---------------------------------------------------------------- catálogo de roles

alter table public.roles add column is_active boolean not null default true;

insert into public.roles (slug, name, description) values
  ('superadmin',   'Superadministrador', 'Control total, incluida la gestión de usuarios y seguridad.'),
  ('reviewer',     'Revisor',            'Revisa y aprueba contenido; no lo edita.'),
  ('area_editor',  'Editor de área',     'Edita solo las áreas asignadas en user_area_permissions.'),
  ('commercial',   'Comercial',          'Gestiona leads; sin acceso a contenido.'),
  ('analyst',      'Analista',           'Solo lectura y métricas.'),
  ('collaborator', 'Colaborador',        'Acceso temporal de solo lectura.')
on conflict (slug) do nothing;

update public.roles set is_active = false where slug in ('author', 'viewer');

-- -------------------------------------------------------------- mapeo rol → permiso

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- Matriz de menor privilegio (threat-model §3) sobre los 5 permission.code de M03.
-- `admin` no recibe users.manage: la gestión de usuarios es exclusiva de superadmin.
-- `commercial` no recibe permisos de contenido: su alcance son los leads, gobernados
-- por las políticas de public.leads más abajo.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any (
  case r.slug
    when 'superadmin'   then array['content.read','content.write','content.publish','settings.manage','users.manage']
    when 'admin'        then array['content.read','content.write','content.publish','settings.manage']
    when 'editor'       then array['content.read','content.write','content.publish']
    when 'reviewer'     then array['content.read','content.publish']
    when 'area_editor'  then array['content.read','content.write']
    when 'analyst'      then array['content.read']
    when 'collaborator' then array['content.read']
    else array[]::text[]
  end
)
on conflict do nothing;

-- ------------------------------------------------------- helpers de autorización

-- SECURITY DEFINER con search_path fijo: obligatorio para no ser vulnerable a
-- search_path hijacking. STABLE permite que el planner los cachee por statement.

create function public.current_role_slugs() returns text[]
language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(array_agg(r.slug), array[]::text[])
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = auth.uid() and r.is_active;
$$;

create function public.has_role(target text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select target = any (public.current_role_slugs());
$$;

create function public.has_permission(target text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id and r.is_active
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid() and p.code = target
  );
$$;

-- Un area_editor solo puede tocar sus áreas; el resto de roles con content.write
-- no está limitado por área.
create function public.can_edit_area(target uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select
    case
      when not public.has_permission('content.write') then false
      when public.has_role('area_editor') and not public.has_role('editor')
           and not public.has_role('admin') and not public.has_role('superadmin')
      then exists (
        select 1 from public.user_area_permissions uap
        where uap.user_id = auth.uid() and uap.area_id = target and uap.can_edit
      )
      else true
    end;
$$;

create function public.can_publish_area(target uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select
    case
      when not public.has_permission('content.publish') then false
      when public.has_role('area_editor') and not public.has_role('editor')
           and not public.has_role('admin') and not public.has_role('superadmin')
      then exists (
        select 1 from public.user_area_permissions uap
        where uap.user_id = auth.uid() and uap.area_id = target and uap.can_publish
      )
      else true
    end;
$$;

revoke execute on function public.current_role_slugs()      from public, anon;
revoke execute on function public.has_role(text)            from public, anon;
revoke execute on function public.has_permission(text)      from public, anon;
revoke execute on function public.can_edit_area(uuid)       from public, anon;
revoke execute on function public.can_publish_area(uuid)    from public, anon;
grant execute on function public.current_role_slugs()    to authenticated, service_role;
grant execute on function public.has_role(text)          to authenticated, service_role;
grant execute on function public.has_permission(text)    to authenticated, service_role;
grant execute on function public.can_edit_area(uuid)     to authenticated, service_role;
grant execute on function public.can_publish_area(uuid)  to authenticated, service_role;

-- ------------------------------------------------ aprovisionamiento de perfiles

-- profiles.display_name es NOT NULL con check de 1..120 caracteres, así que el
-- fallback nunca puede quedar vacío.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(btrim(split_part(coalesce(new.email, ''), '@', 1)), ''),
        'Usuario'
      ), 120),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Deny by default: un usuario recién creado obtiene perfil pero CERO roles, así que
-- no puede leer ni escribir nada del admin. La asignación de rol es explícita.

-- ----------------------------------------------------- auditoría automática

create function public.log_audit_event() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_entity text; v_before jsonb; v_after jsonb; v_row jsonb;
begin
  if tg_op = 'DELETE' then
    v_before := to_jsonb(old); v_after := null;
  elsif tg_op = 'UPDATE' then
    v_before := to_jsonb(old); v_after := to_jsonb(new);
  else
    v_before := null; v_after := to_jsonb(new);
  end if;

  -- El identificador se deriva del jsonb, no de new.id: user_roles y
  -- user_area_permissions tienen clave primaria compuesta y NO tienen columna id.
  v_row := coalesce(v_after, v_before);
  v_entity := coalesce(
    v_row ->> 'id',
    nullif(concat_ws(':', v_row ->> 'user_id', v_row ->> 'role_id', v_row ->> 'area_id'), ''),
    nullif(v_row ->> 'key', '')
  );

  insert into public.audit_logs (actor_id, action, entity_table, entity_id, before_data, after_data)
  values (auth.uid(), lower(tg_op), tg_table_name, v_entity, v_before, v_after);

  -- Trigger AFTER: el valor de retorno se ignora y referenciar NEW en un DELETE
  -- (o OLD en un INSERT) sería un error.
  return null;
end;
$$;

create trigger audit_user_roles
  after insert or update or delete on public.user_roles
  for each row execute function public.log_audit_event();

create trigger audit_user_area_permissions
  after insert or update or delete on public.user_area_permissions
  for each row execute function public.log_audit_event();

create trigger audit_site_settings
  after insert or update or delete on public.site_settings
  for each row execute function public.log_audit_event();

-- ------------------------------------------------------------ RLS: identidad

create policy "users read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "users update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "user managers read profiles" on public.profiles
  for select to authenticated using (public.has_permission('users.manage'));
create policy "user managers write profiles" on public.profiles
  for all to authenticated
  using (public.has_permission('users.manage'))
  with check (public.has_permission('users.manage'));

create policy "authenticated reads roles" on public.roles
  for select to authenticated using (true);
create policy "authenticated reads permissions" on public.permissions
  for select to authenticated using (true);
create policy "authenticated reads role permissions" on public.role_permissions
  for select to authenticated using (true);
create policy "user managers write role permissions" on public.role_permissions
  for all to authenticated
  using (public.has_permission('users.manage'))
  with check (public.has_permission('users.manage'));

create policy "users read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "user managers read all roles" on public.user_roles
  for select to authenticated using (public.has_permission('users.manage'));
create policy "user managers assign roles" on public.user_roles
  for all to authenticated
  using (public.has_permission('users.manage'))
  with check (public.has_permission('users.manage'));

create policy "users read own area permissions" on public.user_area_permissions
  for select to authenticated using (user_id = auth.uid());
create policy "user managers write area permissions" on public.user_area_permissions
  for all to authenticated
  using (public.has_permission('users.manage'))
  with check (public.has_permission('users.manage'));

-- --------------------------------------------------- RLS: lectura del admin

-- Quien tenga content.read ve TODO el contenido, no solo lo publicado: es la
-- diferencia entre el sitio público (anon) y el back-office.
create policy "content readers read pages" on public.pages
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read page sections" on public.page_sections
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read projects" on public.projects
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read media" on public.media_assets
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read testimonials" on public.testimonials
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read team" on public.team_members
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read areas" on public.areas
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read services" on public.services
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read prototypes" on public.prototypes
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read seo" on public.seo_metadata
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read menus" on public.navigation_menus
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read menu items" on public.navigation_items
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read redirects" on public.redirects
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read settings" on public.site_settings
  for select to authenticated using (public.has_permission('content.read'));

-- --------------------------------------------------- RLS: escritura del admin

-- Publicar (status = 'publicado') exige content.publish; editar exige content.write.
create policy "content writers insert pages" on public.pages
  for insert to authenticated with check (
    public.has_permission('content.write')
    and (status <> 'publicado' or public.has_permission('content.publish'))
  );
create policy "content writers update pages" on public.pages
  for update to authenticated
  using (public.has_permission('content.write'))
  with check (status <> 'publicado' or public.has_permission('content.publish'));
create policy "content writers delete pages" on public.pages
  for delete to authenticated using (public.has_permission('content.write'));

create policy "content writers write page sections" on public.page_sections
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));

-- Los proyectos sí se acotan por área: primary_area_id manda.
create policy "content writers insert projects" on public.projects
  for insert to authenticated with check (
    public.can_edit_area(primary_area_id)
    and (status <> 'publicado' or public.can_publish_area(primary_area_id))
  );
create policy "content writers update projects" on public.projects
  for update to authenticated
  using (public.can_edit_area(primary_area_id))
  with check (
    public.can_edit_area(primary_area_id)
    and (status <> 'publicado' or public.can_publish_area(primary_area_id))
  );
create policy "content writers delete projects" on public.projects
  for delete to authenticated using (public.can_edit_area(primary_area_id));

create policy "content writers write project areas" on public.project_areas
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write project services" on public.project_services
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write project capabilities" on public.project_capabilities
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write project team" on public.project_team
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write project media" on public.project_media
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write project links" on public.project_links
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));

create policy "content writers write media" on public.media_assets
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write testimonials" on public.testimonials
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write team" on public.team_members
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write seo" on public.seo_metadata
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write prototypes" on public.prototypes
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write prototype features" on public.prototype_features
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));
create policy "content writers write prototype media" on public.prototype_media
  for all to authenticated
  using (public.has_permission('content.write'))
  with check (public.has_permission('content.write'));

-- Taxonomías y navegación: estructura del sitio, exige settings.manage.
create policy "settings managers write areas" on public.areas
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write services" on public.services
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write area services" on public.area_services
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write menus" on public.navigation_menus
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write menu items" on public.navigation_items
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write redirects" on public.redirects
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write settings" on public.site_settings
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write clients" on public.clients
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write industries" on public.industries
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write capabilities" on public.capabilities
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));

create policy "content readers read clients" on public.clients
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read industries" on public.industries
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read capabilities" on public.capabilities
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read area services" on public.area_services
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read project areas" on public.project_areas
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read project services" on public.project_services
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read project capabilities" on public.project_capabilities
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read project team" on public.project_team
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read project media" on public.project_media
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read project links" on public.project_links
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read prototype features" on public.prototype_features
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read prototype media" on public.prototype_media
  for select to authenticated using (public.has_permission('content.read'));

-- ------------------------------------------------------------- RLS: leads

-- Los leads los escribe el BFF con service_role (bypass RLS). Aquí solo se define
-- quién puede consultarlos y gestionarlos desde el admin.
create policy "lead managers read leads" on public.leads
  for select to authenticated using (
    public.has_role('commercial') or public.has_role('admin') or public.has_role('superadmin')
  );
create policy "lead managers update leads" on public.leads
  for update to authenticated
  using (public.has_role('commercial') or public.has_role('admin') or public.has_role('superadmin'))
  with check (public.has_role('commercial') or public.has_role('admin') or public.has_role('superadmin'));

create policy "lead managers read submissions" on public.form_submissions
  for select to authenticated using (
    public.has_role('commercial') or public.has_role('admin') or public.has_role('superadmin')
  );
create policy "lead managers read lead events" on public.lead_events
  for select to authenticated using (
    public.has_role('commercial') or public.has_role('admin') or public.has_role('superadmin')
  );
create policy "lead managers insert lead events" on public.lead_events
  for insert to authenticated with check (
    public.has_role('commercial') or public.has_role('admin') or public.has_role('superadmin')
  );

create policy "settings managers write forms" on public.forms
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "settings managers write form fields" on public.form_fields
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));
create policy "content readers read forms" on public.forms
  for select to authenticated using (public.has_permission('content.read'));
create policy "content readers read form fields" on public.form_fields
  for select to authenticated using (public.has_permission('content.read'));

-- -------------------------------------------------------- RLS: auditoría

-- Solo lectura, y solo para quien gestiona usuarios/seguridad. Nadie escribe a mano:
-- las filas las ponen los triggers (SECURITY DEFINER).
create policy "user managers read audit logs" on public.audit_logs
  for select to authenticated using (public.has_permission('users.manage'));

-- ------------------------------------------------------------- Storage

-- M03 dejó los buckets sin ninguna política de escritura. Aquí se autoriza a los
-- roles de contenido, y la lectura de los buckets privados al personal autorizado.
create policy "content writers upload public media" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('public-media', 'project-media', 'team-media')
    and public.has_permission('content.write')
  );
create policy "content writers update public media" on storage.objects
  for update to authenticated
  using (bucket_id in ('public-media', 'project-media', 'team-media') and public.has_permission('content.write'))
  with check (bucket_id in ('public-media', 'project-media', 'team-media') and public.has_permission('content.write'));
create policy "content writers delete public media" on storage.objects
  for delete to authenticated using (
    bucket_id in ('public-media', 'project-media', 'team-media')
    and public.has_permission('content.write')
  );
create policy "authenticated reads public buckets" on storage.objects
  for select to authenticated using (
    bucket_id in ('public-media', 'project-media', 'team-media')
  );
create policy "lead managers read private documents" on storage.objects
  for select to authenticated using (
    bucket_id in ('private-documents', 'temporary-uploads')
    and (public.has_role('commercial') or public.has_role('admin') or public.has_role('superadmin'))
  );

-- --------------------------------------------------------------- grants

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
-- Las tablas siguen con RLS forzada: el grant abre la puerta, la política decide.
-- audit_logs es de solo lectura incluso para quien puede leerla.
revoke insert, update, delete on table public.audit_logs from authenticated;
