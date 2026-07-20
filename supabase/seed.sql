insert into public.areas (slug, name, description, sort_order) values
  ('estrategia', 'Estrategia', 'Estrategia y dirección de marca.', 10),
  ('identidad', 'Identidad', 'Identidad visual y verbal.', 20),
  ('digital', 'Digital', 'Productos y experiencias digitales.', 30),
  ('contenidos', 'Contenidos', 'Sistemas y producción de contenidos.', 40),
  ('experiencias', 'Experiencias', 'Experiencias físicas y digitales.', 50)
on conflict (slug) do nothing;

insert into public.roles (slug, name, description) values
  ('admin', 'Administrador', 'Administración completa del CMS.'),
  ('editor', 'Editor', 'Edición y publicación de contenidos.'),
  ('author', 'Autor', 'Creación y edición de borradores.'),
  ('viewer', 'Lector', 'Acceso de solo lectura al CMS.')
on conflict (slug) do nothing;

insert into public.permissions (code, description) values
  ('content.read', 'Leer contenido administrativo.'),
  ('content.write', 'Crear y editar contenido.'),
  ('content.publish', 'Publicar contenido.'),
  ('users.manage', 'Administrar usuarios y permisos.'),
  ('settings.manage', 'Administrar configuración del sitio.')
on conflict (code) do nothing;

insert into public.industries (slug, name) values
  ('cultura', 'Cultura'), ('educacion', 'Educación'), ('hospitalidad', 'Hospitalidad'),
  ('retail', 'Retail'), ('tecnologia', 'Tecnología')
on conflict (slug) do nothing;

insert into public.capabilities (slug, name) values
  ('branding', 'Branding'), ('direccion-creativa', 'Dirección creativa'),
  ('diseno-digital', 'Diseño digital'), ('desarrollo-web', 'Desarrollo web'),
  ('estrategia-contenidos', 'Estrategia de contenidos')
on conflict (slug) do nothing;

insert into public.site_settings (key, value, is_public) values
  ('site_name', '"Studio Nomade"'::jsonb, true),
  ('default_locale', '"es-CL"'::jsonb, true)
on conflict (key) do nothing;

insert into public.pages (slug, title, status, published_at) values
  ('inicio', 'Inicio', 'publicado', now()),
  ('borrador-interno', 'Borrador interno', 'borrador', null)
on conflict (slug) do nothing;
