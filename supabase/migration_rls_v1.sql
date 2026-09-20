-- Plataforma MundoChile
-- Migration: RLS v1 — permisos alineados con la matriz definitiva
-- Esta migración es para revisión y posterior aplicación controlada en Supabase.
-- NO debe ejecutarse hasta completar la prueba de permisos.
--
-- Alcance:
--   1) Relación perfil -> intérprete.
--   2) Eliminación de políticas permisivas heredadas.
--   3) Permisos por rol a nivel de Supabase.
--
-- Nota de seguridad:
--   RLS controla FILAS, no columnas. Las tablas de asignaciones contienen
--   datos operacionales y algunos campos financieros/sensibles.
--   Por ello, esta V1 NO concede acceso a asignaciones a Viewer.
--   La lectura segura de asignaciones/eventos se hará mediante funciones
--   SECURITY DEFINER explícitas.

begin;

alter table public.perfiles add column if not exists interprete_id bigint;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'perfiles_interprete_id_fkey'
      and conrelid = 'public.perfiles'::regclass
  ) then
    alter table public.perfiles
      add constraint perfiles_interprete_id_fkey
      foreign key (interprete_id)
      references public.interpretes(id)
      on delete set null;
  end if;
end $$;

alter table public.perfiles drop constraint if exists perfiles_rol_check;

alter table public.perfiles
  add constraint perfiles_rol_check
  check (rol in ('admin','editor','interprete','viewer'));

create or replace function public.get_user_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid() limit 1;
$$;

create or replace function public.get_interprete_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select interprete_id from public.perfiles where id = auth.uid() limit 1;
$$;

revoke all on function public.get_user_rol() from public;
grant execute on function public.get_user_rol() to authenticated;
revoke all on function public.get_interprete_id() from public;
grant execute on function public.get_interprete_id() to authenticated;

do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'perfiles','clientes','contactos','interpretes','pares_idiomas',
        'proveedores','eventos','evento_dias','asignaciones',
        'asignaciones_dia','equipos_dia','lugares'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      r.policyname, r.schemaname, r.tablename
    );
  end loop;
end $$;

alter table public.perfiles enable row level security;
alter table public.clientes enable row level security;
alter table public.contactos enable row level security;
alter table public.interpretes enable row level security;
alter table public.pares_idiomas enable row level security;
alter table public.proveedores enable row level security;
alter table public.eventos enable row level security;
alter table public.evento_dias enable row level security;
alter table public.asignaciones enable row level security;
alter table public.asignaciones_dia enable row level security;
alter table public.equipos_dia enable row level security;
alter table public.lugares enable row level security;

-- PERFILES
create policy perfiles_admin_all
on public.perfiles for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy perfiles_own_select
on public.perfiles for select to authenticated
using (id = auth.uid());

-- CLIENTES
create policy clientes_admin_all
on public.clientes for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy clientes_editor_insert
on public.clientes for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy clientes_editor_update
on public.clientes for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy clientes_read_admin_editor_viewer
on public.clientes for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

-- CONTACTOS
create policy contactos_admin_all
on public.contactos for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy contactos_editor_insert
on public.contactos for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy contactos_editor_update
on public.contactos for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy contactos_read_admin_editor_viewer
on public.contactos for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

-- INTERPRETES
create policy interpretes_admin_all
on public.interpretes for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy interpretes_editor_insert
on public.interpretes for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy interpretes_editor_update
on public.interpretes for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy interpretes_read_admin_editor_viewer
on public.interpretes for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

create policy interpretes_own_select
on public.interpretes for select to authenticated
using (
  public.get_user_rol() = 'interprete'
  and id = public.get_interprete_id()
);

-- PARES DE IDIOMAS
create policy pares_admin_all
on public.pares_idiomas for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy pares_editor_insert
on public.pares_idiomas for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy pares_editor_update
on public.pares_idiomas for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy pares_read_admin_editor_viewer
on public.pares_idiomas for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

-- Intérprete: el catálogo completo de pares no se expone directamente.
-- Los pares relevantes se entregan mediante función segura.

-- PROVEEDORES AV
create policy proveedores_admin_all
on public.proveedores for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy proveedores_editor_insert
on public.proveedores for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy proveedores_editor_update
on public.proveedores for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy proveedores_read_admin_editor_viewer
on public.proveedores for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

-- EVENTOS
create policy eventos_admin_all
on public.eventos for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy eventos_editor_insert
on public.eventos for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy eventos_editor_update
on public.eventos for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy eventos_read_admin_editor
on public.eventos for select to authenticated
using (public.get_user_rol() in ('admin','editor'));

-- Intérprete y Viewer NO tienen SELECT directo sobre eventos.
-- Sus lecturas se entregan mediante funciones seguras.

-- DÍAS DE EVENTO
create policy evento_dias_admin_all
on public.evento_dias for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy evento_dias_editor_all
on public.evento_dias for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy evento_dias_viewer_select
on public.evento_dias for select to authenticated
using (public.get_user_rol() = 'viewer');

-- ASIGNACIONES
create policy asignaciones_admin_all
on public.asignaciones for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy asignaciones_editor_all
on public.asignaciones for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

-- Intérprete NO tiene SELECT directo sobre asignaciones.
-- "Mis asignaciones" se entrega mediante get_my_interpreter_assignments().
-- Viewer tampoco tiene SELECT directo.

-- ASIGNACIONES POR DÍA
create policy asignaciones_dia_admin_all
on public.asignaciones_dia for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy asignaciones_dia_editor_all
on public.asignaciones_dia for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

-- Intérprete/Viewer: lectura únicamente mediante funciones seguras.

-- EQUIPOS POR DÍA
create policy equipos_dia_admin_all
on public.equipos_dia for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy equipos_dia_editor_all
on public.equipos_dia for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy equipos_dia_viewer_select
on public.equipos_dia for select to authenticated
using (public.get_user_rol() = 'viewer');

-- Intérprete no tiene SELECT directo sobre equipos_dia en esta V1.
-- La lectura de equipamiento propio deberá pasar por una función segura,
-- evitando exponer proveedor/contactos de terceros.

-- LUGARES
create policy lugares_admin_all
on public.lugares for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy lugares_editor_insert
on public.lugares for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy lugares_editor_update
on public.lugares for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy lugares_read_admin_editor_viewer
on public.lugares for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

commit;

-- ============================================================
-- NOTA
-- Las funciones de lectura segura de asignaciones y eventos se
-- encuentran en migrations separadas y deben aplicarse después
-- de esta migración o dentro de una ejecución controlada.
-- ============================================================
