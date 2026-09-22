-- Plataforma MundoChile
-- Migration: capa segura de lectura de asignaciones v1
-- Revisión: NO ejecutar todavía en Supabase.
--
-- Objetivo:
--   Mantener asignaciones/asignaciones_dia como tablas maestras para Admin/Editor,
--   pero evitar que Viewer o Intérprete reciban columnas financieras o información
--   de terceros que no necesitan.
--
-- Esta migración NO modifica las tablas maestras ni sus políticas RLS.
-- Crea dos funciones de lectura controlada:
--   1) get_my_interpreter_assignments(): solo asignaciones del intérprete autenticado.
--   2) get_viewer_assignments(): información operacional para Viewer.
--
-- Los resultados se construyen explícitamente y no devuelven:
--   nro_ot, nro_boleta, es_boleta_adicional, estado_pago.
--
-- En el caso del intérprete, tampoco se devuelve el nombre/id de otros intérpretes.

begin;

-- ============================================================
-- 1. LECTURA SEGURA PARA INTÉRPRETE
-- ============================================================

create or replace function public.get_my_interpreter_assignments()
returns table (
  asignacion_id bigint,
  evento_id bigint,
  evento_dia_id bigint,
  nombre_evento text,
  fecha date,
  hora_inicio time,
  hora_termino time,
  jornada text,
  jornada_personalizada text,
  modalidad text,
  plataforma text,
  lugar text,
  lugar_detalle text,
  zoom_link text,
  par_id bigint,
  idioma_origen text,
  idioma_destino text,
  descripcion_par text,
  rol text,
  es_host_zoom boolean,
  hora_presentacion text
)
language sql
stable
security definer
set search_path = public
as $$
  -- Asignaciones de eventos de un solo día.
  select
    a.id as asignacion_id,
    e.id as evento_id,
    null::bigint as evento_dia_id,
    e.nombre_evento,
    e.fecha_inicio as fecha,
    e.hora_inicio,
    e.hora_termino,
    e.jornada,
    e.jornada_personalizada,
    e.modalidad,
    e.plataforma,
    e.lugar,
    e.lugar_detalle,
    e.zoom_link,
    p.id as par_id,
    p.idioma_origen,
    p.idioma_destino,
    p.descripcion,
    a.rol,
    a.es_host_zoom,
    a.hora_presentacion::text
  from public.asignaciones a
  join public.eventos e
    on e.id = a.evento_id
  left join public.pares_idiomas p
    on p.id = a.par_id
  where public.get_user_rol() = 'interprete'
    and a.interprete_id = public.get_interprete_id()

  union all

  -- Asignaciones asociadas a días de eventos.
  select
    ad.id as asignacion_id,
    e.id as evento_id,
    ed.id as evento_dia_id,
    e.nombre_evento,
    ed.fecha,
    ed.hora_inicio,
    ed.hora_termino,
    ed.jornada,
    ed.jornada_personalizada,
    e.modalidad,
    e.plataforma,
    e.lugar,
    e.lugar_detalle,
    e.zoom_link,
    p.id as par_id,
    p.idioma_origen,
    p.idioma_destino,
    p.descripcion,
    null::text as rol,
    ad.es_host_zoom,
    ad.hora_presentacion::text
  from public.asignaciones_dia ad
  join public.evento_dias ed
    on ed.id = ad.evento_dia_id
  join public.eventos e
    on e.id = ed.evento_id
  left join public.pares_idiomas p
    on p.id = ad.par_id
  where public.get_user_rol() = 'interprete'
    and ad.interprete_id = public.get_interprete_id();
$$;

revoke all on function public.get_my_interpreter_assignments() from public;
grant execute on function public.get_my_interpreter_assignments() to authenticated;

-- ============================================================
-- 2. LECTURA SEGURA PARA VIEWER
-- ============================================================

create or replace function public.get_viewer_assignments()
returns table (
  asignacion_id bigint,
  evento_id bigint,
  evento_dia_id bigint,
  nombre_evento text,
  fecha date,
  hora_inicio time,
  hora_termino time,
  jornada text,
  jornada_personalizada text,
  modalidad text,
  plataforma text,
  lugar text,
  lugar_detalle text,
  par_id bigint,
  idioma_origen text,
  idioma_destino text,
  descripcion_par text,
  interprete_id bigint,
  interprete_nombre text,
  rol text,
  es_host_zoom boolean,
  hora_presentacion text
)
language sql
stable
security definer
set search_path = public
as $$
  -- Viewer recibe información operacional, incluyendo quién está asignado,
  -- pero nunca información financiera de la asignación.
  select
    a.id as asignacion_id,
    e.id as evento_id,
    null::bigint as evento_dia_id,
    e.nombre_evento,
    e.fecha_inicio as fecha,
    e.hora_inicio,
    e.hora_termino,
    e.jornada,
    e.jornada_personalizada,
    e.modalidad,
    e.plataforma,
    e.lugar,
    e.lugar_detalle,
    p.id as par_id,
    p.idioma_origen,
    p.idioma_destino,
    p.descripcion,
    i.id as interprete_id,
    trim(concat(i.nombre, ' ', coalesce(i.apellido, ''))) as interprete_nombre,
    a.rol,
    a.es_host_zoom,
    a.hora_presentacion::text
  from public.asignaciones a
  join public.eventos e
    on e.id = a.evento_id
  join public.interpretes i
    on i.id = a.interprete_id
  left join public.pares_idiomas p
    on p.id = a.par_id
  where public.get_user_rol() = 'viewer'

  union all

  select
    ad.id as asignacion_id,
    e.id as evento_id,
    ed.id as evento_dia_id,
    e.nombre_evento,
    ed.fecha,
    ed.hora_inicio,
    ed.hora_termino,
    ed.jornada,
    ed.jornada_personalizada,
    e.modalidad,
    e.plataforma,
    e.lugar,
    e.lugar_detalle,
    p.id as par_id,
    p.idioma_origen,
    p.idioma_destino,
    p.descripcion,
    i.id as interprete_id,
    trim(concat(i.nombre, ' ', coalesce(i.apellido, ''))) as interprete_nombre,
    null::text as rol,
    ad.es_host_zoom,
    ad.hora_presentacion::text
  from public.asignaciones_dia ad
  join public.evento_dias ed
    on ed.id = ad.evento_dia_id
  join public.eventos e
    on e.id = ed.evento_id
  join public.interpretes i
    on i.id = ad.interprete_id
  left join public.pares_idiomas p
    on p.id = ad.par_id
  where public.get_user_rol() = 'viewer';
$$;

revoke all on function public.get_viewer_assignments() from public;
grant execute on function public.get_viewer_assignments() to authenticated;

commit;

-- ============================================================
-- FIN
-- ============================================================

-- Nota para la siguiente revisión:
--   1) Verificar que hora_presentacion pueda exponerse como text de forma
--      consistente con los valores actuales.
--   2) Confirmar si el intérprete debe recibir zoom_link directamente o
--      mediante una capa posterior específica de "Mis eventos".
--   3) Probar las funciones con Admin, Editor, Intérprete y Viewer antes
--      de cambiar App.jsx.
