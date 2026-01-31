# 🎓 Eduflow Hub — MVP de Gestión Escolar

Eduflow Hub es un **MVP de plataforma de gestión escolar** diseñado para **escuelas primarias, secundarias y bachilleratos**.

Permite administrar **usuarios, roles, alumnos, pagos y calificaciones**, con una arquitectura moderna y lista para escalar.

🚀 Proyecto enfocado en **demos, pilotos con escuelas y validación comercial**.

---

## ✨ Funcionalidades actuales (MVP)

### 🔐 Autenticación

- Login con email y contraseña
- Roles por usuario:
  - `super_admin`
  - `directivo`
  - `administrativo`
  - `alumno`
- Protección de rutas
- Modo demo con switch de rol (solo en desarrollo)

### 👥 Gestión de usuarios

- Perfil de usuario (`profiles`)
- Roles asociados (`user_roles`)
- Carga automática de perfil y roles al iniciar sesión

### 📚 Módulos disponibles

- 📊 Dashboard
- 👩‍🎓 Alumnos
- 💳 Pagos
- 📝 Calificaciones

### 🚧 Módulos en preparación

- Documentos
- Materias
- Reportes
- Avisos
- Ciclos escolares
- Configuración
- Perfil

---

## 🧱 Stack tecnológico

### Frontend

- React + TypeScript
- Vite
- React Router
- TanStack Query
- TailwindCSS
- shadcn/ui

### Backend / BaaS

- Supabase
- Auth
- PostgreSQL
- Row Level Security (RLS)

---

## 📁 Estructura del proyecto

```text
src/
├── components/        # UI y layout
├── contexts/          # AuthContext (sesión, roles, perfil)
├── pages/             # Rutas (login, signup, dashboard, etc.)
├── integrations/
│   └── supabase/      # Cliente Supabase
├── types/             # Tipos de base de datos
└── App.tsx            # Router principal
```

---

## ⚙️ Configuración del proyecto

### 1️⃣ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL="https://TU_PROYECTO.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="TU_PUBLIC_ANON_KEY"
```

⚠ **Nunca uses la `service_role key` en el frontend.**

---

### 2️⃣ Base de datos (Supabase)

El esquema está definido en:

```text
supabase/migrations/
```

Configuración rápida (sin Supabase CLI):

1. Supabase → SQL Editor
2. Nueva query
3. Copiar el contenido del archivo grande de migración
4. Ejecutar la query

---

### 3️⃣ Row Level Security (RLS)

Ejecutar en **Supabase → SQL Editor**:

```sql
alter table profiles enable row level security;
alter table user_roles enable row level security;

create policy "Allow profile insert on signup"
on profiles
for insert
with check (
  auth.uid() = user_id OR auth.role() = 'anon'
);

create policy "Allow role insert on signup"
on user_roles
for insert
with check (
  auth.uid() = user_id OR auth.role() = 'anon'
);

create policy "Users can read own profile"
on profiles
for select
using (auth.uid() = user_id);

create policy "Users can read own roles"
on user_roles
for select
using (auth.uid() = user_id);
```

---

### 4️⃣ Emails (modo demo recomendado)

Para evitar bloqueos por email en Supabase:

- Authentication → Sign In / Providers → Email
- **Confirm email → OFF**

---

## ▶️ Ejecutar el proyecto

```bash
npm install
npm run dev
```

App disponible en:

```text
http://localhost:8080
```

---

## 🧪 Modo demo (switch de rol)

En desarrollo, puedes simular roles desde la consola del navegador:

```js
localStorage.setItem("eduflow:devRoleOverride", "directivo")
```

Roles disponibles:

- `super_admin`
- `directivo`
- `administrativo`
- `alumno`

Para limpiar:

```js
localStorage.removeItem("eduflow:devRoleOverride")
```

---

## 👤 Flujo recomendado para demos con escuelas

- Crear usuarios manualmente en Supabase (Auth → Users)
- Asignar roles en `user_roles`
- Los usuarios solo hacen login
- Usar el switch de rol para mostrar vistas

✔ Más realista
✔ Más seguro
✔ Ideal para preventa

---

## 🔐 Seguridad

- Row Level Security habilitado
- Acceso limitado por usuario
- Roles controlan vistas y permisos
- Sin credenciales sensibles en frontend

---

## 🚀 Roadmap sugerido

- CRUD completo de alumnos
- Gestión de grupos y materias
- Pagos recurrentes
- Reportes PDF
- Control escolar por ciclo
- Invitaciones por email
- Panel administrativo avanzado
