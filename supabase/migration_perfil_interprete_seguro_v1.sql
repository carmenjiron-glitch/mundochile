-- Plataforma MundoChile
-- Migration: capa segura de "Mi perfil" para intérpretes
-- Revisión previa: no ejecutar todavía en Supabase.
--
-- El intérprete puede consultar su propio perfil y actualizar únicamente
-- datos personales/operativos permitidos. No puede modificar:
--   rol del usuario, interprete_id, activo, ni es_host_zoom.
-- Los cambios se realizan mediante SECURITY DEFINER, evitando UPDATE
-- directo sobre public.interpretes.

begin;

create or replace function public.get_my_interpreter_profile()
returns table (
  id bigint,
  nombre text,
  apellido text,
  email text,
  telefono text,
  ciudad text,
  modalidad_trabajo text,
  notas text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    i.nombre,
    i.apellido,
    i.email,
    i.telefono,
    i.ciudad,
    i.modalidad_trabajo,
    i.notas
  from public.interpretes i
  where public.get_user_rol() = 'interprete'
    and i.id = public.get_interprete_id();
$$;

create or replace function public.update_my_interpreter_profile(
  p_nombre text,
  p_apellido text,
  p_email text,
  p_telefono text,
  p_ciudad text,
  p_modalidad_trabajo text,
  p_notas text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_user_rol() <> 'interprete' then
    raise exception 'Solo un intérprete puede usar esta función';
  end if;

  update public.interpretes
  set
    nombre = p_nombre,
    apellido = p_apellido,
    email = p_email,
    telefono = p_telefono,
    ciudad = p_ciudad,
    modalidad_trabajo = p_modalidad_trabajo,
    notas = p_notas
  where id = public.get_interprete_id();

  if not found then
    raise exception 'No existe un intérprete vinculado al usuario';
  end if;
end;
$$;

revoke all on function public.get_my_interpreter_profile() from public;
grant execute on function public.get_my_interpreter_profile() to authenticated;

revoke all on function public.update_my_interpreter_profile(text,text,text,text,text,text,text) from public;
grant execute on function public.update_my_interpreter_profile(text,text,text,text,text,text,text) to authenticated;

commit;

-- ============================================================
-- Nota de seguridad:
-- No se concede UPDATE directo a intérpretes sobre public.interpretes.
-- La asociación perfiles.interprete_id y el rol se administran
-- exclusivamente desde la configuración de Admin.
-- ============================================================
