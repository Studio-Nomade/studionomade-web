-- M18 down: elimina el blog.
--
-- ⚠️ Destructivo: borra todas las notas. Exportarlas antes si hay contenido real.

drop table if exists public.blog_posts;
drop function if exists public.blog_posts_require_publish();
