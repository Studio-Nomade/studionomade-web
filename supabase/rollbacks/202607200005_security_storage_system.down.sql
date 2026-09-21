drop policy if exists "anonymous reads public media buckets" on storage.objects;
select set_config('storage.allow_delete_query', 'true', false);
delete from storage.buckets where id in ('public-media','project-media','team-media','private-documents','temporary-uploads');

do $$
declare item record;
begin
  for item in select schemaname, tablename, policyname from pg_policies where schemaname = 'public'
  loop execute format('drop policy if exists %I on %I.%I', item.policyname, item.schemaname, item.tablename); end loop;
end $$;

drop table if exists public.audit_logs;
