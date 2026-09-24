alter table public.projects add column authorization_granted boolean not null default false;
alter table public.team_members add column authorization_granted boolean not null default false;
alter table public.testimonials add column authorization_granted boolean not null default false;
alter table public.media_assets
  add column caption text,
  add column copyright_notice text,
  add column width integer check (width is null or width > 0),
  add column height integer check (height is null or height > 0),
  add column visibility text not null default 'public' check (visibility in ('public','private'));

create or replace function public.block_unauthorized_publication()
returns trigger language plpgsql as $$
begin
  if new.status = 'publicado' and not new.authorization_granted then
    raise exception 'authorization_required';
  end if;
  return new;
end;
$$;

create trigger projects_require_authorization before insert or update of status, authorization_granted
on public.projects for each row execute function public.block_unauthorized_publication();
create trigger testimonials_require_authorization before insert or update of status, authorization_granted
on public.testimonials for each row execute function public.block_unauthorized_publication();
