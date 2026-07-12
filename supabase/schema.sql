-- ═══════════════════════════════════════════════════════════════════
-- MUNDOCHILE — Schema Supabase v2.0
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ── PERFILES (vinculado a auth.users) ──────────────────────────────
create table if not exists perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text,
  rol        text not null default 'editor' check (rol in ('admin','editor','viewer')),
  created_at timestamptz default now()
);

-- Trigger: crear perfil automáticamente al registrar usuario
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into perfiles (id, nombre, rol)
  values (new.id, new.email, 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── CLIENTES ───────────────────────────────────────────────────────
create table if not exists clientes (
  id               bigint generated always as identity primary key,
  nombre_empresa   text not null,
  nombre_contacto  text,
  email_contacto   text,
  telefono         text,
  celular          text,
  whatsapp         text,
  notas            text,
  activo           boolean default true,
  created_at       timestamptz default now()
);

-- ── INTÉRPRETES ────────────────────────────────────────────────────
create table if not exists interpretes (
  id                bigint generated always as identity primary key,
  nombre            text not null,
  apellido          text,
  email             text,
  telefono          text,
  ciudad            text,
  modalidad_trabajo text default 'ambas' check (modalidad_trabajo in ('online','presencial','ambas')),
  es_host_zoom      boolean default false,
  notas             text,
  activo            boolean default true,
  created_at        timestamptz default now()
);

-- ── PARES DE IDIOMAS ───────────────────────────────────────────────
create table if not exists pares_idiomas (
  id             bigint generated always as identity primary key,
  idioma_origen  text not null,
  idioma_destino text not null default 'Español',
  descripcion    text generated always as (idioma_origen || ' → ' || idioma_destino) stored,
  activo         boolean default true,
  created_at     timestamptz default now()
);

-- ── PROVEEDORES AV ─────────────────────────────────────────────────
create table if not exists proveedores (
  id              bigint generated always as identity primary key,
  nombre          text not null,
  nombre_contacto text,
  email           text,
  telefono        text,
  notas           text,
  activo          boolean default true,
  created_at      timestamptz default now()
);

-- ── EVENTOS ────────────────────────────────────────────────────────
create table if not exists eventos (
  id                    bigint generated always as identity primary key,
  cliente_id            bigint references clientes(id),
  nro_oc                text default '',
  nombre_evento         text default '',
  tipo                  text default 'Simultánea' check (tipo in ('Simultánea','Consecutiva','Whispering')),
  fecha_inicio          date not null,
  fecha_termino         date not null,
  hora_inicio           time default '09:00',
  hora_termino          time default '13:00',
  jornada               text default 'Media Jornada',
  jornada_personalizada text default '',
  lugar                 text default '',
  lugar_detalle         text default '',
  modalidad             text default 'remoto' check (modalidad in ('remoto','presencial','hibrido')),
  plataforma            text default '',
  zoom_owner            text default 'mundochile',
  zoom_administrador    text default '',
  estado                text default 'Pendiente' check (estado in ('Pendiente','Facturado','Cancelado')),
  comentarios           text default '',
  created_by            uuid references auth.users(id),
  created_by_nombre     text default '',
  edited_by             uuid references auth.users(id),
  edited_by_nombre      text default '',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ── ASIGNACIONES (evento un día) ───────────────────────────────────
create table if not exists asignaciones (
  id                  bigint generated always as identity primary key,
  evento_id           bigint not null references eventos(id) on delete cascade,
  interprete_id       bigint references interpretes(id),
  par_id              bigint references pares_idiomas(id),
  nro_ot              text default '',
  nro_boleta          text default '',
  es_boleta_adicional boolean default false,
  es_host_zoom        boolean default false,
  rol                 text default 'Principal' check (rol in ('Principal','Apoyo')),
  hora_presentacion   text,
  estado_pago         text default 'Pendiente' check (estado_pago in ('Pendiente','Pagado')),
  created_at          timestamptz default now()
);

-- ── DÍAS DE EVENTO MULTIDÍA ────────────────────────────────────────
create table if not exists evento_dias (
  id                    bigint generated always as identity primary key,
  evento_id             bigint not null references eventos(id) on delete cascade,
  fecha                 date not null,
  orden                 int not null default 1,
  hora_inicio           time default '09:00',
  hora_termino          time default '13:00',
  jornada               text default 'Media Jornada',
  jornada_personalizada text default '',
  created_at            timestamptz default now()
);

-- ── ASIGNACIONES POR DÍA ───────────────────────────────────────────
create table if not exists asignaciones_dia (
  id                  bigint generated always as identity primary key,
  evento_dia_id       bigint not null references evento_dias(id) on delete cascade,
  interprete_id       bigint references interpretes(id),
  par_id              bigint references pares_idiomas(id),
  nro_ot              text default '',
  nro_boleta          text default '',
  es_boleta_adicional boolean default false,
  es_host_zoom        boolean default false,
  rol                 text default 'Principal' check (rol in ('Principal','Apoyo')),
  hora_presentacion   text,
  estado_pago         text default 'Pendiente' check (estado_pago in ('Pendiente','Pagado')),
  created_at          timestamptz default now()
);

-- ── EQUIPOS AV POR DÍA ────────────────────────────────────────────
create table if not exists equipos_dia (
  id                          bigint generated always as identity primary key,
  evento_dia_id               bigint not null references evento_dias(id) on delete cascade,
  tipo_equipo                 text default 'fijo' check (tipo_equipo in ('fijo','portatil','cabina_portatil')),
  proveedor_id                bigint references proveedores(id),
  proveedor_nombre            text default '',
  proveedor_contacto          text default '',
  proveedor_telefono          text default '',
  num_receptores              int default 0,
  num_cabinas                 int default 0,
  num_asistentes              int default 0,
  asistentes_origen           text default 'mismo_proveedor',
  asistentes_otro_proveedor   text default '',
  asistentes_mundochile_nombres text default '',
  portatiles_origen           text default 'mundochile',
  proveedor_portatiles        text default '',
  dia_montaje                 date,
  hora_montaje                time,
  contacto_in_situ            text default '',
  instrucciones               text default '',
  created_at                  timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════════════════
alter table perfiles        enable row level security;
alter table clientes        enable row level security;
alter table interpretes     enable row level security;
alter table pares_idiomas   enable row level security;
alter table proveedores     enable row level security;
alter table eventos         enable row level security;
alter table asignaciones    enable row level security;
alter table evento_dias     enable row level security;
alter table asignaciones_dia enable row level security;
alter table equipos_dia     enable row level security;

-- Política: usuarios autenticados leen todo
create policy "Autenticados leen todo" on perfiles        for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on clientes        for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on interpretes     for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on pares_idiomas   for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on proveedores     for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on eventos         for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on asignaciones    for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on evento_dias     for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on asignaciones_dia for select using (auth.role() = 'authenticated');
create policy "Autenticados leen todo" on equipos_dia     for select using (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden insert/update/delete (la app controla roles por JS)
create policy "Autenticados escriben" on clientes        for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on interpretes     for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on pares_idiomas   for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on proveedores     for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on eventos         for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on asignaciones    for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on evento_dias     for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on asignaciones_dia for all using (auth.role() = 'authenticated');
create policy "Autenticados escriben" on equipos_dia     for all using (auth.role() = 'authenticated');

-- Perfiles: cada usuario edita el suyo
create policy "Editar propio perfil" on perfiles for update using (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════
-- PASO FINAL: asignar rol admin al primer usuario
-- (ejecutar después de crear el primer usuario en Auth)
-- Reemplazar 'tu@email.com' con tu email real
-- ═══════════════════════════════════════════════════════════════════
-- update perfiles set rol = 'admin' where id = (
--   select id from auth.users where email = 'tu@email.com' limit 1
-- );
