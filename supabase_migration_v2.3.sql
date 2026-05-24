-- MundoChile v2.3 migration
-- Run in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS lugares (
  id bigint generated always as identity primary key,
  nombre text not null,
  direccion text,
  activo boolean default true,
  created_at timestamptz default now()
);

ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS nro_hes text default '',
  ADD COLUMN IF NOT EXISTS nro_otros text default '';
