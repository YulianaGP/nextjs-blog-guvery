# Guvery Blog — Panel de Administración

> Plataforma de blog con panel de administración construida con **Next.js 15**, **TypeScript** y **PostgreSQL**. Permite a los autores crear y gestionar artículos con un flujo editorial completo, y a los lectores explorar, buscar y comentar el contenido publicado.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00e5bf?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelos de base de datos](#modelos-de-base-de-datos)
- [Requisitos previos](#requisitos-previos)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Flujo editorial](#flujo-editorial)
- [Roles de usuario](#roles-de-usuario)
- [Deploy en Vercel](#deploy-en-vercel)
- [Licencia](#licencia)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL (Neon) via Prisma ORM |
| Autenticación | NextAuth v4 (Credentials + Google OAuth) |
| Editor de texto | Tiptap |
| Email | Resend |
| Validación | Zod |
| Deploy | Vercel |

---

## Funcionalidades

### Blog público
- Listado paginado de artículos con filtro por categoría
- Página de detalle con tabla de contenidos, tiempo de lectura y contador de vistas
- Artículos relacionados y populares
- Búsqueda de texto completo
- Sistema de comentarios con rate limiting (5 comentarios/hora por usuario)
- Newsletter con doble opt-in por email
- Perfiles de autor
- Compartir en redes sociales

### Panel de administración
- Dashboard con métricas: artículos, vistas, suscriptores
- Gestión de artículos con editor enriquecido (Tiptap)
- Flujo editorial: Borrador → Revisión → Publicado → Archivado
- Sistema de notificaciones en tiempo real entre autores y admins
- Gestión de autores y categorías
- Exportación de suscriptores a CSV
- Configuración de perfil y foto de usuario
- Soporte para modo oscuro

### Seguridad y acceso
- Control de acceso por roles: ADMIN, EDITOR, MEMBER
- Middleware de protección de rutas `/admin/*`
- Validación de datos con Zod en todas las acciones del servidor
- Sanitización de contenido HTML con `sanitize-html`
- Rate limiting en comentarios

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (admin)/          # Panel de administración (protegido)
│   │   ├── admin/        # Dashboard, artículos, autores, categorías
│   │   └── pages/        # Configuración y perfil
│   ├── (blog)/           # Blog público
│   │   ├── blog/         # Listado y detalle de artículos
│   │   ├── autor/        # Perfil de autor
│   │   ├── buscar/       # Búsqueda
│   │   └── categoria/    # Artículos por categoría
│   ├── admin/login/      # Login público
│   └── api/              # API routes (auth, search, newsletter, export)
├── actions/              # Server Actions (CRUD con validación Zod)
├── services/             # Queries a base de datos
├── components/
│   ├── admin/            # Formularios y componentes del panel
│   └── blog/             # Componentes del blog público
└── lib/                  # Auth, Prisma, constantes, utilidades
```

---

## Modelos de base de datos

| Modelo | Descripción |
|---|---|
| **User** | Usuarios con roles (ADMIN, EDITOR) y tipos de cuenta (STAFF, MEMBER) |
| **Post** | Artículos con estados, SEO, tiempo de lectura y vistas |
| **Category** | Categorías con slug y color |
| **Tag** | Etiquetas de artículos |
| **Comment** | Comentarios con estado de aprobación |
| **Subscriber** | Suscriptores del newsletter con doble opt-in |
| **Notification** | Notificaciones del sistema para el flujo editorial |

---

## Requisitos previos

- Node.js 18+
- PostgreSQL (o cuenta en [Neon](https://neon.tech))
- Cuenta en [Resend](https://resend.com) (para emails del newsletter)
- Cuenta en [Google Cloud Console](https://console.cloud.google.com) (para OAuth)

---

## Instalación local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd nextjs-admin-dashboard

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales reales

# 4. Ejecutar migraciones
npm run db:migrate

# 5. (Opcional) Cargar datos de prueba
npm run db:seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth — genera el secret con: openssl rand -hex 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Google OAuth — configura en console.cloud.google.com
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Resend — para el newsletter
RESEND_API_KEY=""

# URL pública del sitio
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> **Importante:** `.env.local` está en `.gitignore` y nunca debe subirse al repositorio.

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo en localhost:3000
npm run build        # Build de producción
npm run start        # Iniciar servidor en producción
npm run lint         # Linter ESLint

npm run db:migrate   # Ejecutar migraciones de Prisma
npm run db:push      # Sincronizar schema sin generar migración
npm run db:seed      # Poblar base de datos con datos iniciales
npm run db:studio    # Abrir Prisma Studio (GUI de base de datos)
npm run db:generate  # Regenerar Prisma Client
```

---

## Flujo editorial

```
DRAFT → REVIEW → PUBLISHED → ARCHIVED
  ↑         |
  └─────────┘ (devolver a borrador)
```

1. El **Editor** crea un artículo en borrador y lo envía a revisión
2. El **Admin** recibe una notificación y puede publicar, devolver a borrador o archivar
3. El **Editor** recibe una notificación con el resultado

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| **ADMIN** | Acceso total: publicar artículos, gestionar autores, categorías y suscriptores |
| **EDITOR** | Crear y editar sus propios artículos, enviar a revisión |
| **MEMBER** | Leer artículos publicados, comentar, suscribirse al newsletter |

---

## Deploy en Vercel

### 1. Preparar el repositorio

Asegúrate de que el build local funcione sin errores:

```bash
npm run build
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **Add New Project** e importa tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Next.js

### 3. Configurar variables de entorno

En **Settings → Environment Variables**, agrega todas las variables de `.env.example` con sus valores de producción:

| Variable | Valor en producción |
|---|---|
| `DATABASE_URL` | Tu URL de Neon con `pgbouncer=true` |
| `DIRECT_URL` | Tu URL directa de Neon |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` |
| `NEXTAUTH_SECRET` | Genera con `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Tu Client ID de Google |
| `GOOGLE_CLIENT_SECRET` | Tu Client Secret de Google |
| `RESEND_API_KEY` | Tu API Key de Resend |
| `NEXT_PUBLIC_BASE_URL` | `https://tu-app.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-app.vercel.app` |

### 4. Configurar Google OAuth para producción

En [Google Cloud Console](https://console.cloud.google.com):
1. Ve a **APIs & Services → Credentials**
2. Edita tu OAuth 2.0 Client
3. Agrega en **Authorized redirect URIs**: `https://tu-app.vercel.app/api/auth/callback/google`

### 5. Desplegar

Haz click en **Deploy**. Vercel desplegará automáticamente en cada push a `main`.

> **Nota:** No necesitas ejecutar `db:migrate` en Vercel — las migraciones deben ejecutarse desde tu máquina local apuntando a la base de datos de producción.

---

## Licencia

MIT — libre para uso personal y comercial.
