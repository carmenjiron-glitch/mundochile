# MundoChile — Gestión de Interpretaciones v2.0

App de gestión de eventos de interpretación para MundoChile.

---

## 🚀 Deploy en 3 pasos

### 1. Supabase — Crear schema

1. Ir a **Supabase → SQL Editor → New query**
2. Pegar el contenido de `supabase/schema.sql`
3. Hacer click en **Run**
4. Asignar rol admin: descomentar y ejecutar el `UPDATE` al final del SQL con tu email

### 2. GitHub — Subir proyecto

```bash
git init
git add .
git commit -m "MundoChile v2.0 — initial"
git remote add origin https://github.com/TU_USUARIO/mundochile.git
git push -u origin main
```

### 3. Vercel — Conectar y desplegar

1. Ir a **vercel.com → New Project → Import Git Repository**
2. Seleccionar el repo `mundochile`
3. En **Environment Variables** agregar:
   - `VITE_SUPABASE_URL` = `https://ebhetndpsowxocqaqyfs.supabase.co`
   - `VITE_SUPABASE_KEY` = `(tu anon key)`
4. Click en **Deploy** ✅

---

## 🏗 Desarrollo local

```bash
cp .env.example .env   # o crear .env con las variables
npm install
npm run dev
```

---

## 📋 Estructura de la base de datos

| Tabla | Descripción |
|-------|-------------|
| `perfiles` | Roles de usuario (admin / editor / viewer) |
| `clientes` | Empresas cliente |
| `interpretes` | Intérpretes activos e inactivos |
| `pares_idiomas` | Pares de idiomas (Inglés → Español, etc.) |
| `proveedores` | Proveedores de equipos AV |
| `eventos` | Eventos de interpretación |
| `asignaciones` | Intérpretes asignados a eventos de un día |
| `evento_dias` | Días individuales de eventos multidía |
| `asignaciones_dia` | Intérpretes por día (eventos multidía) |
| `equipos_dia` | Equipos AV por día (presencial/híbrido) |

---

## 👥 Roles de usuario

| Rol | Puede |
|-----|-------|
| `admin` | Todo: config + crear/editar/eliminar eventos |
| `editor` | Crear y editar eventos |
| `viewer` | Solo ver el calendario |

El primer usuario creado en Supabase Auth queda como `editor`. Ejecutar el UPDATE al final del schema SQL para promoverlo a `admin`.

---

## ⚠️ Pre-mortem — Notas importantes

- **`descripcion` en `pares_idiomas`**: es una columna **generada automáticamente** por el SQL (`idioma_origen || ' → ' || idioma_destino`). No intentar insertarla manualmente.
- **Cascade deletes**: el SQL tiene `ON DELETE CASCADE` en las tablas hijas. Eliminar un evento borra sus asignaciones y días automáticamente.
- **RLS activado**: todas las tablas tienen Row Level Security. Solo usuarios autenticados pueden leer y escribir.
- **Variables de entorno**: Vercel necesita `VITE_` como prefijo para que Vite las exponga al cliente.
