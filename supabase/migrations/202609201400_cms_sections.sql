-- M06 up: soporte de servidor para el editor de bloques.
--
-- Tres cosas que M03 no dejó resueltas:
--   1. `page_sections` no tiene forma de ocultar un bloque ni de elegir variante.
--   2. `unique (page_id, sort_order)` es NO DIFERIBLE, así que reordenar N bloques
--      choca con el constraint en cuanto dos filas comparten posición durante el
--      intercambio. Con PostgREST no hay transacciones multi-sentencia, de modo que
--      el reorden es imposible desde el cliente.
--   3. No hay registro de quién tocó una sección por última vez.

alter table public.page_sections
  add column is_hidden  boolean not null default false,
  add column variant    text,
  add column updated_at timestamptz not null default now();

-- El constraint pasa a DEFERRABLE para que el reorden pueda pasar por estados
-- intermedios con posiciones repetidas dentro de una misma transacción.
-- El nombre se busca en el catálogo en vez de asumirlo.
do $$
declare v_name text;
begin
  select conname into v_name
  from pg_constraint
  where conrelid = 'public.page_sections'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) like '%page_id, sort_order%';

  if v_name is not null then
    execute format('alter table public.page_sections drop constraint %I', v_name);
  end if;
end $$;

alter table public.page_sections
  add constraint page_sections_page_sort_key unique (page_id, sort_order)
  deferrable initially immediate;

create index page_sections_page_order_idx on public.page_sections (page_id, sort_order);

-- ------------------------------------------------------------- reorden atómico

-- SECURITY INVOKER a propósito (es el modo por defecto): el reorden debe quedar
-- sujeto a RLS con la identidad de quien llama. Un SECURITY DEFINER aquí
-- permitiría reordenar páginas sobre las que no se tiene permiso de escritura.
create function public.reorder_page_sections(p_page_id uuid, p_ordered_ids uuid[])
returns integer
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_expected integer;
  v_matched  integer;
  v_given    integer := coalesce(array_length(p_ordered_ids, 1), 0);
begin
  select count(*) into v_expected from public.page_sections where page_id = p_page_id;

  select count(*) into v_matched
  from public.page_sections
  where page_id = p_page_id and id = any (p_ordered_ids);

  -- La lista debe ser exactamente el conjunto de secciones de la página: ni faltan,
  -- ni sobran, ni se cuelan ids de otra página. Cualquier desajuste aborta la
  -- transacción entera y el orden anterior queda intacto.
  if v_given <> v_expected or v_matched <> v_expected then
    raise exception
      'orden inconsistente para la página %: % ids recibidos, % coincidentes, % esperados',
      p_page_id, v_given, v_matched, v_expected
      using errcode = '23514';
  end if;

  set constraints all deferred;

  update public.page_sections ps
     set sort_order = idx.position - 1,
         updated_at = now()
    from unnest(p_ordered_ids) with ordinality as idx(id, position)
   where ps.id = idx.id and ps.page_id = p_page_id;

  return v_expected;
end;
$$;

revoke execute on function public.reorder_page_sections(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_page_sections(uuid, uuid[]) to authenticated, service_role;

-- --------------------------------------------------- updated_at automático

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger page_sections_touch_updated_at
  before update on public.page_sections
  for each row execute function public.touch_updated_at();
