-- Equipos AV v2: completar el esquema utilizado por los formularios y las Event Cards.
-- Cambios aditivos: no elimina ni modifica datos existentes.

alter table public.proveedores
  add column if not exists email text,
  add column if not exists rut text,
  add column if not exists ciudad text,
  add column if not exists contacto1_cargo text,
  add column if not exists contacto2_cargo text,
  add column if not exists contacto3_cargo text;

alter table public.equipos_dia
  add column if not exists proveedor_id bigint,
  add column if not exists proveedor_nombre text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'equipos_dia_proveedor_id_fkey'
      and conrelid = 'public.equipos_dia'::regclass
  ) then
    alter table public.equipos_dia
      add constraint equipos_dia_proveedor_id_fkey
      foreign key (proveedor_id)
      references public.proveedores(id)
      on delete set null;
  end if;
end $$;

-- Mantener compatibilidad con registros antiguos que usaban el campo proveedor.
update public.equipos_dia
set proveedor_nombre = proveedor
where coalesce(proveedor_nombre, '') = ''
  and coalesce(proveedor, '') <> '';
