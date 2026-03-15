# Guvery Blog — Panel de Administración

Plataforma de blog con panel de administración construida con **Next.js 15**, **TypeScript** y **PostgreSQL**. Permite a los autores crear y gestionar artículos con un flujo editorial completo, y a los lectores explorar, buscar y comentar el contenido publicado.

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
- Sanitización de contenido HTML
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
├── actions/              # Server Actions (CRUD)
├── services/             # Queries a base de datos con caché
├── components/
│   ├── admin/            # Formularios y componentes del panel
│   └── blog/             # Componentes del blog público
└── lib/                  # Auth, Prisma, constantes, utilidades
```

---

## Modelos de base de datos

- **User** — Usuarios con roles (ADMIN, EDITOR) y tipos de cuenta (STAFF, MEMBER)
- **Post** — Artículos con estados, SEO, tiempo de lectura y vistas
- **Category** — Categorías con slug y color
- **Tag** — Etiquetas de artículos
- **Comment** — Comentarios con estado de aprobación
- **Subscriber** — Suscriptores del newsletter con doble opt-in
- **Notification** — Notificaciones del sistema para el flujo editorial

---

## Requisitos previos

- Node.js 18+
- PostgreSQL (o cuenta en [Neon](https://neon.tech))
- Cuenta en [Resend](https://resend.com) (para emails)
- Cuenta en Google Cloud Console (para OAuth)

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
# Editar .env.local con tus credenciales

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

Crea un archivo `.env.local` con las siguientes variables:

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-con: openssl rand -hex 32"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Resend (para newsletter)
RESEND_API_KEY=""

# URL pública del sitio
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> El archivo `.env.local` está en `.gitignore` y nunca debe subirse al repositorio.

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar en producción
npm run lint         # Linter ESLint

npm run db:migrate   # Ejecutar migraciones de Prisma
npm run db:push      # Sync schema sin migraciones
npm run db:seed      # Poblar base de datos con datos iniciales
npm run db:studio    # Abrir Prisma Studio (UI de base de datos)
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
| ADMIN | Acceso total: publicar, gestionar autores, categorías, suscriptores |
| EDITOR | Crear y editar sus propios artículos, enviar a revisión |
| MEMBER | Leer artículos publicados, comentar, suscribirse al newsletter |

---

## Deploy en Vercel

Consulta la sección de [Deploy](#deploy) más abajo o sigue la [guía oficial de Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs).

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en **Settings → Environment Variables**
3. Ejecuta `npm run db:migrate` una vez en tu base de datos de producción
4. Vercel desplegará automáticamente en cada push a `main`

---

## Licencia

MIT
