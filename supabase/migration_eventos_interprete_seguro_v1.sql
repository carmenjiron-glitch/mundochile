-- Plataforma MundoChile
-- Migration: capa segura de "Mis eventos" para intérpretes
-- Revisión previa: no ejecutar todavía en Supabase.
--
-- La función expone únicamente información operacional necesaria para
-- un intérprete y evita entregar la fila completa de public.eventos.
-- La relación de acceso se determina por las asignaciones propias.

begin;

create or replace function public.get_my_interpreter_events()
returns table (
  evento_id bigint,
  nombre_evento text,
  fecha_inicio date,
  fecha_termino date,
  hora_inicio time,
  hora_termino time,
  jornada text,
  jornada_personalizada text,
  lugar text,
  lugar_detalle text,
  modalidad text,
  plataforma text,
  zoom_link text,
  estado text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id as evento_id,
    e.nombre_evento,
    e.fecha_inicio,
    e.fecha_termino,
    e.hora_inicio,
    e.hora_termino,
    e.jornada,
    e.jornada_personalizada,
    e.lugar,
    e.lugar_detalle,
    e.modalidad,
    e.plataforma,
    e.zoom_link,
    e.estado
  from public.eventos e
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
        from public.evento_dias ed
        join public.asignaciones_dia ad
          on ad.evento_dia_id = ed.id
        where ed.evento_id = e.id
          and ad.interprete_id = public.get_interprete_id()
      )
    )
  order by e.fecha_inicio nulls last, e.hora_inicio nulls last, e.id;
$$;

revoke all on function public.get_my_interpreter_events() from public;
grant execute on function public.get_my_interpreter_events() to authenticated;

commit;

-- ============================================================
-- Nota de seguridad para la migración RLS V1:
-- Al aplicar el esquema definitivo, las políticas que entregan al
-- intérprete SELECT directo sobre public.eventos y public.evento_dias
-- deben eliminarse. El acceso de "Mis eventos" debe realizarse por
-- esta función segura, no por SELECT directo de la tabla.
-- ============================================================
