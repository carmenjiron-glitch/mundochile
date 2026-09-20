-- Plataforma MundoChile
-- Migration: RLS v1 — permisos alineados con la matriz definitiva
-- OBJETIVO:
--   1) Incorporar la relación perfil -> intérprete.
--   2) Eliminar las políticas RLS permisivas heredadas.
--   3) Aplicar permisos por rol a nivel de Supabase.
--
-- IMPORTANTE:
--   Este archivo se prepara para revisión. NO aplica cambios en Supabase por sí mismo.
--   La eliminación de registros maestros/eventos queda reservada a Admin.
--   Los campos sensibles/financieros requieren una segunda capa posterior
--   (vistas/columnas) si se desea ocultarlos también a nivel de datos.

begin;

-- ============================================================
-- 1. PERFIL -> INTÉRPRETE
-- ============================================================

alter table public.perfiles
  add column if not exists interprete_id bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
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

alter table public.perfiles
  drop constraint if exists perfiles_rol_check;

alter table public.perfiles
  add constraint perfiles_rol_check
  check (rol in ('admin','editor','interprete','viewer'));

-- ============================================================
-- 2. FUNCIONES DE SEGURIDAD
-- ============================================================

create or replace function public.get_user_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol
  from public.perfiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.get_interprete_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select interprete_id
  from public.perfiles
  where id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_user_rol() from public;
grant execute on function public.get_user_rol() to authenticated;

revoke all on function public.get_interprete_id() from public;
grant execute on function public.get_interprete_id() to authenticated;

-- ============================================================
-- 3. ELIMINAR POLÍTICAS RLS HEREDADAS
-- ============================================================

do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'perfiles',
        'clientes',
        'contactos',
        'interpretes',
        'pares_idiomas',
        'proveedores',
        'eventos',
        'evento_dias',
        'asignaciones',
        'asignaciones_dia',
        'equipos_dia',
        'lugares'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  end loop;
end $$;

-- ============================================================
-- 4. RLS ACTIVADO
-- ============================================================

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

-- ============================================================
-- 5. PERFILES
-- ============================================================

create policy perfiles_admin_all
on public.perfiles
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy perfiles_read_authenticated
on public.perfiles
for select to authenticated
using (true);

create policy perfiles_update_own_non_role
on public.perfiles
for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and rol = (select p.rol from public.perfiles p where p.id = auth.uid())
);

-- ============================================================
-- 6. CLIENTES
-- Admin: total
-- Editor: crear/editar, no eliminar
-- Viewer: lectura
-- Intérprete: sin acceso
-- ============================================================

create policy clientes_admin_all
on public.clientes
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy clientes_editor_insert
on public.clientes
for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy clientes_editor_update
on public.clientes
for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy clientes_read_admin_editor_viewer
on public.clientes
for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

-- ============================================================
-- 7. CONTACTOS
-- ============================================================

create policy contactos_admin_all
on public.contactos
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy contactos_editor_insert
on public.contactos
for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy contactos_editor_update
on public.contactos
for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy contactos_read_admin_editor_viewer
on public.contactos
for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

-- ============================================================
-- 8. INTÉRPRETES
-- Editor administra el directorio; intérprete solo su propio registro.
-- ============================================================

create policy interpretes_admin_all
on public.interpretes
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy interpretes_editor_insert
on public.interpretes
for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy interpretes_editor_update
on public.interpretes
for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy interpretes_read_admin_editor_viewer
on public.interpretes
for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

create policy interpretes_own_select
on public.interpretes
for select to authenticated
using (
  public.get_user_rol() = 'interprete'
  and id = public.get_interprete_id()
);

create policy interpretes_own_update
on public.interpretes
for update to authenticated
using (
  public.get_user_rol() = 'interprete'
  and id = public.get_interprete_id()
)
with check (
  public.get_user_rol() = 'interprete'
  and id = public.get_interprete_id()
);

-- ============================================================
-- 9. PARES DE IDIOMAS
-- Admin: total
-- Editor: crear/editar
-- Viewer: lectura
-- Intérprete: lectura
-- ============================================================

create policy pares_admin_all
on public.pares_idiomas
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy pares_editor_insert
on public.pares_idiomas
for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy pares_editor_update
on public.pares_idiomas
for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy pares_read_authenticated_roles
on public.pares_idiomas
for select to authenticated
using (public.get_user_rol() in ('admin','editor','interprete','viewer'));

-- ============================================================
-- 10. PROVEEDORES AV
-- ============================================================

create policy proveedores_admin_all
on public.proveedores
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy proveedores_editor_insert
on public.proveedores
for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy proveedores_editor_update
on public.proveedores
for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy proveedores_read_admin_editor_viewer
on public.proveedores
for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

-- ============================================================
-- 11. EVENTOS
-- Admin: total
-- Editor: crear/editar, no eliminar
-- Viewer: lectura
-- Intérprete: solo eventos asignados
-- ============================================================

create policy eventos_admin_all
on public.eventos
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy eventos_editor_insert
on public.eventos
for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy eventos_editor_update
on public.eventos
for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy eventos_read_editor_viewer
on public.eventos
for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

create policy eventos_interprete_own
on public.eventos
for select to authenticated
using (
  public.get_user_rol() = 'interprete'
  and (
    exists (
      select 1
      from public.asignaciones a
      where a.evento_id = eventos.id
        and a.interprete_id = public.get_interprete_id()
    )
    or exists (
      select 1
      from public.evento_dias ed
      join public.asignaciones_dia ad
        on ad.evento_dia_id = ed.id
      where ed.evento_id = eventos.id
        and ad.interprete_id = public.get_interprete_id()
    )
  )
);

-- ============================================================
-- 12. DÍAS DE EVENTO
-- ============================================================

create policy evento_dias_admin_all
on public.evento_dias
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy evento_dias_editor_all
on public.evento_dias
for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy evento_dias_viewer_select
on public.evento_dias
for select to authenticated
using (public.get_user_rol() = 'viewer');

create policy evento_dias_interprete_own
on public.evento_dias
for select to authenticated
using (
  public.get_user_rol() = 'interprete'
  and exists (
    select 1
    from public.asignaciones_dia ad
    where ad.evento_dia_id = evento_dias.id
      and ad.interprete_id = public.get_interprete_id()
  )
);

-- ============================================================
-- 13. ASIGNACIONES
-- Admin/Editor: gestionar
-- Intérprete: solo sus asignaciones
-- Viewer: lectura
-- ============================================================

create policy asignaciones_admin_all
on public.asignaciones
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy asignaciones_editor_all
on public.asignaciones
for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy asignaciones_viewer_select
on public.asignaciones
for select to authenticated
using (public.get_user_rol() = 'viewer');

create policy asignaciones_interprete_own
on public.asignaciones
for select to authenticated
using (
  public.get_user_rol() = 'interprete'
  and interprete_id = public.get_interprete_id()
);

-- ============================================================
-- 14. ASIGNACIONES POR DÍA
-- ============================================================

create policy asignaciones_dia_admin_all
on public.asignaciones_dia
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy asignaciones_dia_editor_all
on public.asignaciones_dia
for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy asignaciones_dia_viewer_select
on public.asignaciones_dia
for select to authenticated
using (public.get_user_rol() = 'viewer');

create policy asignaciones_dia_interprete_own
on public.asignaciones_dia
for select to authenticated
using (
  public.get_user_rol() = 'interprete'
  and interprete_id = public.get_interprete_id()
);

-- ============================================================
-- 15. EQUIPOS POR DÍA
-- Intérprete solo ve equipos de sus propios eventos.
-- ============================================================

create policy equipos_dia_admin_all
on public.equipos_dia
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy equipos_dia_editor_all
on public.equipos_dia
for all to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy equipos_dia_viewer_select
on public.equipos_dia
for select to authenticated
using (public.get_user_rol() = 'viewer');

create policy equipos_dia_interprete_own
on public.equipos_dia
for select to authenticated
using (
  public.get_user_rol() = 'interprete'
  and exists (
    select 1
    from public.evento_dias ed
    join public.asignaciones_dia ad
      on ad.evento_dia_id = ed.id
    where ed.id = equipos_dia.evento_dia_id
      and ad.interprete_id = public.get_interprete_id()
  )
);

-- ============================================================
-- 16. LUGARES
-- ============================================================

create policy lugares_admin_all
on public.lugares
for all to authenticated
using (public.get_user_rol() = 'admin')
with check (public.get_user_rol() = 'admin');

create policy lugares_editor_insert
on public.lugares
for insert to authenticated
with check (public.get_user_rol() = 'editor');

create policy lugares_editor_update
on public.lugares
for update to authenticated
using (public.get_user_rol() = 'editor')
with check (public.get_user_rol() = 'editor');

create policy lugares_read_admin_editor_viewer
on public.lugares
for select to authenticated
using (public.get_user_rol() in ('admin','editor','viewer'));

commit;

-- ============================================================
-- FIN
-- ============================================================
