-- Plataforma MundoChile
-- Migration: capa segura de "Mi equipamiento" para intérpretes
-- Revisión previa: no ejecutar todavía en Supabase.
--
-- Expone únicamente el equipamiento asociado a eventos/días en los
-- que el intérprete autenticado tiene una asignación.
-- No expone el directorio de proveedores ni datos de contacto de terceros.

begin;

create or replace function public.get_my_interpreter_equipment()
returns table (
  evento_id bigint,
  evento_dia_id bigint,
  nombre_evento text,
  fecha date,
  hora_inicio time,
  hora_termino time,
  modalidad text,
  plataforma text,
  lugar text,
  tipo_equipo text,
  num_receptores integer,
  num_cabinas integer,
  num_asistentes integer,
  proveedor_portatiles text,
  dia_montaje date,
  hora_montaje time,
  contacto_in_situ text,
  instrucciones text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id as evento_id,
    ed.id as evento_dia_id,
    e.nombre_evento,
    ed.fecha,
    ed.hora_inicio,
    ed.hora_termino,
    e.modalidad,
    e.plataforma,
    e.lugar,
    eq.tipo_equipo,
    eq.num_receptores,
    eq.num_cabinas,
    eq.num_asistentes,
    eq.proveedor_portatiles,
    eq.dia_montaje,
    eq.hora_montaje,
    eq.contacto_in_situ,
    eq.instrucciones
  from public.equipos_dia eq
  join public.evento_dias ed
    on ed.id = eq.evento_dia_id
  join public.eventos e
    on e.id = ed.evento_id
  where public.get_user_rol() = 'interprete'
    and (
      exists (
        select 1
        from public.asignaciones a
        where a.evento_id = e.id
          and a.interprete_id = public.get_interprete_id()
      )
      or exists (
        select 1
        from public.asignaciones_dia ad
        where ad.evento_dia_id = ed.id
          and ad.interprete_id = public.get_interprete_id()
      )
    )
  order by ed.fecha nulls last, ed.hora_inicio nulls last, eq.id;
$$;

revoke all on function public.get_my_interpreter_equipment() from public;
grant execute on function public.get_my_interpreter_equipment() to authenticated;

commit;

-- ============================================================
-- Campos deliberadamente excluidos:
--   proveedor
--   proveedor_contacto
--   proveedor_telefono
--   asistentes_proveedor
--   asistentes_mundochile_nombres
-- ============================================================
