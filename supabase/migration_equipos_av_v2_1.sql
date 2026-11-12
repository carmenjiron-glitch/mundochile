-- Completa campos de procedencia de asistentes y equipos portátiles usados por el formulario AV.
alter table public.equipos_dia
  add column if not exists asistentes_origen text,
  add column if not exists asistentes_otro_proveedor text,
  add column if not exists portatiles_origen text;
