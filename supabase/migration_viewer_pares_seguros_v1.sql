-- Plataforma MundoChile
-- Migration: capas seguras de lectura para Viewer y pares de idioma
-- Revisión previa: no ejecutar todavía en Supabase.

begin;

-- ============================================================
-- 1. VIEWER: eventos sin campos financieros/administrativos
-- ============================================================

create or replace function public.get_viewer_events()
returns table (
  evento_id bigint,
  cliente_id bigint,
  nombre_evento text,
  tipo text[],
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
  estado text,
  comentarios text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.cliente_id,
    e.nombre_evento,
    e.tipo,
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
    e.estado,
    e.comentarios
  from public.eventos e
  where public.get_user_rol() = 'viewer'
  order by e.fecha_inicio nulls last, e.hora_inicio nulls last, e.id;
$$;

revoke all on function public.get_viewer_events() from public;
grant execute on function public.get_viewer_events() to authenticated;

-- ============================================================
-- 2. INTÉRPRETE: pares de idioma relevantes
-- ============================================================

create or replace function public.get_my_interpreter_language_pairs()
returns table (
  par_id bigint,
  idioma_origen text,
  idioma_destino text,
  descripcion text
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    p.id,
    p.idioma_origen,
    p.idioma_destino,
    p.descripcion
  from public.pares_idiomas p
  where public.get_user_rol() = 'interprete'
    and (
      exists (
        select 1
        from public.asignaciones a
        where a.interprete_id = public.get_interprete_id()
          and a.par_id = p.id
      )
      or exists (
        select 1
        from public.asignaciones_dia ad
        where ad.interprete_id = public.get_interprete_id()
          and ad.par_id = p.id
      )
    )
  order by p.idioma_origen, p.idioma_destino, p.id;
$$;

revoke all on function public.get_my_interpreter_language_pairs() from public;
grant execute on function public.get_my_interpreter_language_pairs() to authenticated;

commit;

-- ============================================================
-- Notas:
-- - Viewer deja de depender de SELECT directo sobre eventos cuando
--   se retire esa política en RLS.
-- - El intérprete deja de depender de SELECT directo sobre el
--   catálogo completo de pares.
-- - Los campos financieros de eventos no son parte de la salida.
-- ============================================================
