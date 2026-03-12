# Proyecto — blog.guvery.com

Blog SEO-optimizado para la plataforma peruana de importaciones **Guvery**, construido sobre un template de dashboard Next.js. Permite a editores crear y publicar artículos desde un panel de administración, y a los lectores suscribirse al newsletter con double opt-in.

---

## Tecnologías y Librerías

| Tecnología | Versión | Para qué sirve |
|---|---|---|
| **Next.js** | 16 | Framework principal. Maneja el routing, renderizado del servidor (SSR/SSG/ISR) y Server Actions |
| **React** | 19 | Librería de UI. Next.js la usa por debajo para construir componentes |
| **TypeScript** | 5 | Tipado estático. Detecta errores antes de ejecutar el código |
| **Prisma** | 5 | ORM (Object-Relational Mapper). Permite hablar con la base de datos usando TypeScript en vez de SQL |
| **PostgreSQL** (Neon) | — | Base de datos relacional en la nube, sin servidor propio |
| **NextAuth** | v4 | Maneja el login, sesiones y cookies de autenticación |
| **Tailwind CSS** | 3 | Framework de estilos. En vez de escribir CSS, usas clases directamente en el HTML |
| **Tiptap** | 3 | Editor de texto enriquecido (como un mini Word) para crear artículos |
| **Resend** | 6 | Servicio para enviar emails transaccionales (confirmación de newsletter) |
| **Zod** | 4 | Librería de validación. Verifica que los datos del formulario sean correctos antes de guardarlos |
| **bcryptjs** | 3 | Convierte contraseñas en texto plano a hashes seguros irreversibles |

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│              NEXT.JS 16 (App Router)                 │
├─────────────┬───────────────────┬────────────────────┤
│  BLOG       │    ADMIN PANEL    │      API           │
│  (público)  │    (protegido)    │                    │
│             │                  │  /api/auth          │
│  /          │  /admin          │  /api/newsletter    │
│  /blog      │  /admin/articulos│  /api/admin/csv     │
│  /blog/[slug│  /admin/categorias                     │
│  /categoria │  /admin/suscriptor                     │
├─────────────┴───────────────────┴────────────────────┤
│           SERVER ACTIONS (lógica de negocio)         │
│     post.actions  │  newsletter.actions  │ category  │
├──────────────────────────────────────────────────────┤
│           SERVICES (consultas a BD)                  │
│     posts.service.ts    │   categories.service.ts    │
├──────────────────────────────────────────────────────┤
│           PRISMA ORM  ←→  NEON POSTGRESQL            │
│   User │ Post │ Category │ Tag │ Subscriber           │
└──────────────────────────────────────────────────────┘
```

---

## CAPA DE BASE DE DATOS

### `prisma/schema.prisma`
Es el **mapa completo de la base de datos**. Define 7 tablas (llamadas modelos):

- **`User`** — Los administradores del blog. Tiene `email`, `password` (guardado como hash bcrypt), y `role` (ADMIN o EDITOR)
- **`Post`** — Los artículos. Tiene título, slug, contenido HTML, estado (DRAFT/PUBLISHED/ARCHIVED), vistas, y se conecta con `User`, `Category` y `Tag`
- **`Category`** — Categorías de artículos (ej: "Guías de Compra"). Tiene nombre, slug y color hex
- **`Tag`** — Etiquetas de artículos (ej: "amazon", "aranceles"). Relación muchos-a-muchos con Post
- **`Subscriber`** — Personas suscritas al newsletter. Tiene email, estado (PENDING/CONFIRMED/UNSUBSCRIBED) y un token de confirmación único
- **`Account`** y **`Session`** — Tablas requeridas por NextAuth para guardar sesiones de login

### `src/lib/prisma.ts`
Es el **cliente único de Prisma** (patrón Singleton). En vez de crear una nueva conexión a la base de datos en cada archivo, este archivo crea una sola instancia y la reutiliza. En Next.js dev mode, sin este patrón se crearían decenas de conexiones y la base de datos se saturaría.

### `src/services/posts.service.ts`
Es el **repositorio de consultas de artículos**. Todas las queries de posts viven aquí:

| Función | Descripción |
|---|---|
| `getPosts()` | Lista paginada de posts PUBLICADOS (para el blog público) |
| `getPostBySlug()` | Un artículo completo por su URL (para la página de detalle) |
| `getFeaturedPosts()` | Posts destacados para el home |
| `getPopularPosts()` | Posts ordenados por vistas (widget "más leídos") |
| `getRelatedPosts()` | Posts de la misma categoría (para el final del artículo) |
| `getAllPublishedSlugs()` | Todos los slugs publicados (para generar el sitemap y SSG) |
| `incrementPostViews()` | Suma +1 a las vistas cuando alguien abre un artículo |
| `getAdminPosts()` | **Admin**: todos los posts sin filtrar el estado |
| `getPostById()` | **Admin**: post completo por ID para el formulario de edición |
| `getDashboardStats()` | **Admin**: cuenta artículos, vistas totales y suscriptores para el dashboard |

### `src/services/categories.service.ts`
Es el **repositorio de consultas de categorías**:

| Función | Descripción |
|---|---|
| `getCategories()` | Todas las categorías con conteo de posts PUBLICADOS (para el blog público) |
| `getCategoryBySlug()` | Una categoría por su URL (para la página de filtro por categoría) |
| `getCategoriesWithTotalCount()` | **Admin**: categorías con conteo total de posts (cualquier estado) |

---

## CAPA DE API

### `src/lib/auth.ts`
Es la **configuración de NextAuth**. Define cómo funciona el login:
- Usa `CredentialsProvider` (email + contraseña, no Google ni GitHub)
- Verifica la contraseña con `bcrypt.compare()` — nunca guarda ni compara texto plano
- Usa estrategia JWT (un token firmado en una cookie) en vez de sessions en base de datos
- Extiende el tipo de sesión para incluir el `role` del usuario (ADMIN/EDITOR)

### `src/lib/resend.ts`
Es la **instancia única del cliente de Resend** (patrón Singleton). Solo una línea: `new Resend(process.env.RESEND_API_KEY)`. Cualquier archivo que necesite enviar emails importa este objeto.

### `src/actions/post.actions.ts`
Son los **Server Actions para gestionar artículos** (CRUD completo). Un Server Action es una función que corre en el servidor pero se puede llamar desde un formulario cliente:

| Función | Descripción |
|---|---|
| `incrementViews()` | Suma una vista cuando se monta la página de un artículo |
| `createPost()` | Valida con Zod, verifica slug único, crea el artículo y limpia la caché |
| `updatePost()` | Actualiza el artículo, maneja el caso de slug cambiado |
| `deletePost()` | Elimina el artículo y limpia su caché |
| `changePostStatus()` | Cambia el estado rápido (DRAFT → PUBLISHED → ARCHIVED) |

### `src/actions/newsletter.actions.ts`
Es el **Server Action para suscribirse al newsletter**. Flujo:
1. Valida el email con Zod
2. Busca si ya existe ese email en BD (evita duplicados)
3. Genera un token UUID único
4. Guarda el suscriptor como PENDING en BD
5. Envía el email de confirmación con Resend (incluye link con el token)
6. Retorna mensaje de éxito o error al componente cliente

### `src/actions/category.actions.ts`
Son los **Server Actions para gestionar categorías**:

| Función | Descripción |
|---|---|
| `createCategory()` | Valida nombre y slug con Zod, verifica que el slug no exista, crea la categoría |
| `deleteCategory()` | Cuenta posts de la categoría; si tiene alguno, rechaza con mensaje amigable |

### `src/app/api/auth/[...nextauth]/route.ts`
Es el **endpoint de NextAuth**. El `[...nextauth]` captura todas las rutas de autenticación en un solo archivo (`/api/auth/session`, `/api/auth/signin`, `/api/auth/signout`, etc.).

### `src/app/api/newsletter/confirm/route.ts`
Es la **ruta de confirmación del newsletter** (double opt-in). Cuando el suscriptor hace click en el link del email:
1. Lee el `?token=xxx` de la URL
2. Busca ese token en BD
3. Si existe y está PENDING: lo cambia a CONFIRMED y borra el token
4. Si no existe o ya fue usado: redirige a `/confirmacion?error=invalid`
5. Si todo OK: redirige a `/confirmacion?success=1`

### `src/app/api/admin/subscribers/export/route.ts`
Es la **ruta de exportación CSV de suscriptores**, protegida con autenticación:
1. Verifica la sesión con `getServerSession()` — si no hay sesión, devuelve 401
2. Obtiene todos los suscriptores de BD
3. Construye el texto CSV manualmente (email, nombre, estado, origen, fechas)
4. Añade BOM (`\uFEFF`) al inicio para que Excel abra los acentos correctamente
5. Responde con `Content-Disposition: attachment` para que el navegador descargue el archivo

### `src/app/sitemap.ts`
Genera el **archivo `sitemap.xml`** automáticamente. Next.js lo sirve en `/sitemap.xml`. Incluye las rutas estáticas (home, /blog) más todas las páginas de artículos y categorías con su fecha de última modificación. Google lo usa para indexar el blog.

### `src/app/robots.ts`
Genera el **archivo `robots.txt`**. Le dice a los bots de Google qué rastrear y qué no. Permite todo excepto `/admin/` y `/api/` (datos privados que no deben aparecer en buscadores).

---

## CAPA DE UI (Interfaz de Usuario)

### Páginas Públicas del Blog

| Archivo | Ruta | Descripción |
|---|---|---|
| `src/app/(blog)/page.tsx` | `/` | Página de inicio. Carga posts destacados, populares y categorías en paralelo con `Promise.all()` |
| `src/app/(blog)/blog/page.tsx` | `/blog` | Listado paginado de artículos. Lee `?page=` de la URL, muestra 6 artículos por página |
| `src/app/(blog)/blog/[slug]/page.tsx` | `/blog/[slug]` | Detalle de artículo. SSG + ISR (revalida cada hora). Incluye JSON-LD, artículos relacionados y botones de compartir |
| `src/app/(blog)/categoria/[slug]/page.tsx` | `/categoria/[slug]` | Artículos filtrados por categoría con paginación |
| `src/app/(blog)/confirmacion/page.tsx` | `/confirmacion` | Respuesta al confirmar el newsletter. Lee `?success=1` o `?error=invalid` |

### Páginas del Panel Admin

| Archivo | Ruta | Descripción |
|---|---|---|
| `src/app/(admin)/admin/page.tsx` | `/admin` | Dashboard con 4 tarjetas de métricas reales y tabla de artículos recientes |
| `src/app/(admin)/admin/articulos/page.tsx` | `/admin/articulos` | Lista completa de artículos (todos los estados) con acciones de editar/eliminar |
| `src/app/(admin)/admin/articulos/nuevo/page.tsx` | `/admin/articulos/nuevo` | Formulario de creación de artículo con editor Tiptap |
| `src/app/(admin)/admin/articulos/[id]/editar/page.tsx` | `/admin/articulos/[id]/editar` | Formulario de edición pre-llenado con los datos del artículo |
| `src/app/(admin)/admin/categorias/page.tsx` | `/admin/categorias` | Tabla de categorías con conteo de posts, formulario de creación y botón de eliminar |
| `src/app/(admin)/admin/suscriptores/page.tsx` | `/admin/suscriptores` | Tabla de suscriptores con tabs de filtro por estado y descarga CSV |
| `src/app/admin/login/page.tsx` | `/admin/login` | Formulario de login. Tiene Suspense boundary por el uso de `useSearchParams()` |

### Componentes del Blog

| Archivo | Descripción |
|---|---|
| `src/components/blog/NewsletterForm.tsx` | Formulario de suscripción. Usa `useActionState` (React 19) para spinner y mensajes de resultado |
| `src/components/blog/ShareButtons.tsx` | Botones de compartir. Usa Web Share API nativa; fallback a Twitter/X, WhatsApp y copiar link |

### Componentes del Admin

| Archivo | Descripción |
|---|---|
| `src/components/admin/TiptapEditor.tsx` | Editor de texto enriquecido con barra de herramientas. Sincroniza el HTML a un `<textarea>` oculto para el Server Action |
| `src/components/admin/ArticleForm.tsx` | Formulario compartido de crear/editar artículos. Auto-genera el slug desde el título. Detecta el modo según si recibe el prop `post` |
| `src/components/admin/StatusBadge.tsx` | Badge de color para el estado del artículo (verde=Publicado, amarillo=Borrador, gris=Archivado) |
| `src/components/admin/DeletePostButton.tsx` | Botón de eliminar con `window.confirm()`. Usa `useTransition` para el estado de carga |
| `src/components/admin/DeleteCategoryButton.tsx` | Botón de eliminar categoría. Bloquea con `alert()` si la categoría tiene artículos asociados |
| `src/app/(admin)/admin/categorias/CreateCategoryForm.tsx` | Formulario inline de crear categoría con selector visual de color (`input type="color"`) |

### Componentes de SEO

| Archivo | Descripción |
|---|---|
| `src/components/seo/JsonLd.tsx` | Inyecta `<script type="application/ld+json">` en artículos. Incluye helpers `buildBlogPostingSchema()` y `buildBreadcrumbSchema()` para que Google entienda la estructura del contenido |

---

## Variables de Entorno (`.env.local`)

```env
# Base de datos
DATABASE_URL=""        # URL con pooler de Neon (para Prisma Client en runtime)
DIRECT_URL=""          # URL directa de Neon (para Prisma CLI: migrate, studio)

# Autenticación
NEXTAUTH_SECRET=""     # Clave secreta para firmar los JWT de sesión (mín. 32 chars)
NEXTAUTH_URL=""        # URL base de la aplicación (http://localhost:3000 en dev)

# Email
RESEND_API_KEY=""      # API Key de Resend para enviar emails

# Blog
NEXT_PUBLIC_BASE_URL="" # URL pública del blog (https://blog.guvery.com en prod)
```

---

## Comandos Útiles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Compila el proyecto para producción
npm run db:migrate   # Aplica migraciones de Prisma a la BD
npm run db:seed      # Carga datos iniciales (categorías, posts, usuario admin)
npm run db:studio    # Abre Prisma Studio (interfaz visual de la BD)
npm run db:push      # Sincroniza el schema con la BD sin crear migración
```

---

## Credenciales de Prueba (seed)

```
Email:    admin@guvery.com
Password: admin123
```

> ⚠️ Solo para desarrollo local. Cambiar antes de desplegar a producción.
