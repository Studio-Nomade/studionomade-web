-- M06 down: revierte el soporte de servidor del editor de bloques y deja
-- `page_sections` exactamente como la entregó M03.

drop trigger if exists page_sections_touch_updated_at on public.page_sections;
drop function if exists public.touch_updated_at();

drop function if exists public.reorder_page_sections(uuid, uuid[]);

drop index if exists public.page_sections_page_order_idx;

-- Se restituye el constraint NO diferible con el nombre que le puso Postgres en M03.
alter table public.page_sections
  drop constraint if exists page_sections_page_sort_key;

alter table public.page_sections
  add constraint page_sections_page_id_sort_order_key unique (page_id, sort_order);

alter table public.page_sections
  drop column if exists updated_at,
  drop column if exists variant,
  drop column if exists is_hidden;
