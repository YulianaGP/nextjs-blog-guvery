# Funcionalidades de la Aplicación

Stack: Next.js 15, React 19, TypeScript, Prisma + PostgreSQL, NextAuth.js, Tailwind CSS.

---

## PANEL ADMINISTRATIVO (`/admin`)

### Autenticación
- Login en `/admin/login` con email y contraseña (bcrypt). Configurado en `src/lib/auth.ts`.
- Sesión JWT de 24 horas. El token almacena `id` y `role` del usuario.
- El middleware (`src/middleware.ts`) protege todas las rutas `/admin/*` y redirige al login si no hay sesión.
- Roles: `ADMIN` y `EDITOR`. El rol se define en la base de datos (`prisma/schema.prisma`).

### Dark Mode
- Implementado con `next-themes`. Toggle en el header (`src/components/Layouts/header/theme-toggle/index.tsx`).
- Persiste en `localStorage`. Usa la clase `dark` de Tailwind. Disponible en admin y blog.

### Dashboard Principal (`/admin`)
- Muestra métricas: total de artículos, publicados, vistas totales y suscriptores.
- Tabla con los 5 artículos más recientes.
- Accesos rápidos a crear artículo, gestionar autores, categorías y suscriptores.

### Gestión de Artículos (`/admin/articulos`)
- **ADMIN** ve todos los artículos. **EDITOR** solo ve los propios.
- Búsqueda por título o slug. Badge de estado visual (`src/components/admin/StatusBadge.tsx`).
- Acciones: crear, editar, eliminar.

### Flujo de Publicación de Artículos
Los artículos siguen el ciclo: `DRAFT → REVIEW → PUBLISHED | ARCHIVED`.

| Acción | Quién | Resultado | Notificación |
|--------|-------|-----------|--------------|
| Guardar borrador | ADMIN / EDITOR | Estado: DRAFT | — |
| Enviar a revisión | ADMIN / EDITOR | Estado: REVIEW | Todos los ADMINs reciben aviso |
| Publicar | ADMIN | Estado: PUBLISHED | El autor recibe aviso |
| Solicitar cambios | ADMIN | Estado: DRAFT | El autor recibe aviso |
| Rechazar | ADMIN | Estado: ARCHIVED | El autor recibe aviso |

- El tiempo de lectura se calcula automáticamente: palabras ÷ 200 WPM (mínimo 1 min).
- Editor de contenido enriquecido con Tiptap (`src/components/admin/ArticleForm.tsx`).
- Lógica de acciones en `src/actions/post.actions.ts`.

### Notificaciones
- Dropdown en el header con las últimas 20 notificaciones (`src/components/Layouts/header/notification/index.tsx`).
- Polling cada 30 segundos. Badge con conteo de no leídas.
- Al abrir el dropdown, todas se marcan como leídas. Click en una notificación navega al artículo o al editor.
- Tipos: `POST_SUBMITTED`, `POST_APPROVED`, `POST_REJECTED`, `POST_NEEDS_REVISION`.
- Lógica en `src/actions/notification.actions.ts`.

### Perfil de Administrador (`/profile`)
- El ADMIN puede editar nombre, bio y slug público.
- El slug se sanitiza automáticamente (minúsculas, espacios→guiones, sin caracteres especiales).
- Subida de foto de perfil (`src/app/(admin)/pages/settings/_components/upload-photo.tsx`).
- Al tener slug, se crea una página pública en `/autor/{slug}`.
- Lógica en `src/actions/profile.actions.ts`.

### Gestión de Autores (`/admin/autores`) — solo ADMIN
- Lista todos los usuarios con rol `EDITOR`.
- Crear nuevo autor: nombre, email, contraseña (bcrypt), bio y slug opcional.
- Eliminar autor: sus artículos se reasignan al primer admin disponible.
- Lógica en `src/actions/author.actions.ts`.

### Gestión de Categorías y Suscriptores — solo ADMIN
- Categorías con nombre, slug, descripción y color hex.
- Suscriptores con estado `PENDING / CONFIRMED / UNSUBSCRIBED` y token de confirmación (doble opt-in).

### Menú Lateral (Sidebar)
- Los ítems de solo ADMIN (Autores, Categorías, Suscriptores, Configuración) se ocultan para EDITORs.
- Configurado en `src/components/Layouts/sidebar/data/index.ts`.

---

## BLOG PÚBLICO (`/blog`)

### Listado de Artículos (`/blog`)
- Solo muestra artículos con estado `PUBLISHED`. Paginación de 6 por página.
- Sidebar con categorías y sus conteos. Sección de artículos populares por vistas.

### Detalle de Artículo (`/blog/[slug]`)
- Imagen de portada, autor, categoría, tiempo de lectura y contenido HTML renderizado.
- Tabla de contenidos automática generada desde los H2/H3 (`src/components/blog/TableOfContents.tsx`).
- Botones de compartir: Twitter, Facebook, LinkedIn, WhatsApp.
- Formulario de newsletter inline. Contador de vistas incrementado en cada visita.
- SEO: metadatos dinámicos, Open Graph, Twitter Card y JSON-LD (breadcrumb).
- Generación estática (SSG) con revalidación (ISR). Configurado en `src/app/(blog)/blog/[slug]/page.tsx`.

### Búsqueda (`/buscar?q=`)
- Búsqueda full-text en título, extracto y contenido. Filtro por categoría en sidebar.
- Renderizado servidor (SSR forzado). Componente `src/components/blog/SearchBar.tsx`.
- API route en `src/app/api/search/`.

### Página de Autor (`/autor/[slug]`)
- Muestra bio, foto y lista de artículos publicados del autor.
- Solo accesible si el usuario tiene slug configurado en su perfil.

### Página de Categoría (`/categoria/[slug]`)
- Lista paginada de artículos filtrados por categoría.

---

## BASE DE DATOS

Modelos principales en `prisma/schema.prisma`:
- **User**: id, email, password, role (ADMIN|EDITOR), name, image, slug, bio.
- **Post**: id, slug, title, content, status, authorId, categoryId, views, readingTime, publishedAt.
- **Notification**: type, message, userId (destinatario), fromId (remitente), postId, read.
- **Category**: name, slug, color.
- **Subscriber**: email, status, confirmationToken.
