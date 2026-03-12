# Plan de Arquitectura e Implementación
## blog.guvery.com — Next.js App Router + TypeScript + Prisma + Neon + NextAuth.js

> **Documento de referencia técnica** — Debe leerse y aprobarse antes de escribir cualquier línea de código.
> Versión: 1.0 | Fecha: 2026-03-08

---

## Tabla de Contenidos

1. [Análisis del Proyecto](#1-análisis-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Diseño de Base de Datos](#3-diseño-de-base-de-datos)
4. [Mapeo de Historias de Usuario](#4-mapeo-de-historias-de-usuario)
5. [Roadmap de Implementación](#5-roadmap-de-implementación)
6. [Estrategia SEO](#6-estrategia-seo)
7. [Autenticación y Seguridad](#7-autenticación-y-seguridad)
8. [Performance y Rendering](#8-performance-y-rendering)
9. [Revisión Crítica del Proyecto](#9-revisión-crítica-del-proyecto)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## 1. Análisis del Proyecto

### Objetivo General

Construir **blog.guvery.com**, un blog de contenido orientado a SEO para el marketplace peruano Guvery. El sistema tiene dos audiencias bien diferenciadas:

- **Visitantes públicos**: usuarios que buscan en Google cómo comprar desde USA/Amazon y llegan al blog.
- **Administradores**: equipo de Guvery que gestiona el contenido y monitorea suscriptores.

### Contexto de Negocio

Guvery es un marketplace digital peruano que conecta compradores en Perú con viajeros internacionales que traen productos del extranjero (principalmente desde Estados Unidos). Actualmente la plataforma **no tiene presencia orgánica en buscadores** para términos de alto volumen como _"comprar en Amazon desde Perú"_ o _"importaciones personales Peru"_. El blog resuelve esta brecha de contenido.

### Epics Identificados

| # | Epic | Historias de Usuario |
|---|------|----------------------|
| E1 | Blog Público | HU1, HU2, HU3, HU4, HU5 |
| E2 | Newsletter | HU6, HU7, HU8 |
| E3 | Gestión de Contenido (Admin) | HU9, HU10 |
| E4 | Funcionalidades Avanzadas | HU11 – HU20 |

### Funcionalidades Clave del Sistema

1. Listado paginado de artículos con filtro por categoría
2. Página de artículo individual con contenido rico (rich text)
3. SEO avanzado: metadata dinámica, Open Graph, JSON-LD, `sitemap.xml`
4. Sistema de newsletter con captura y confirmación de suscripción
5. Panel admin protegido con NextAuth.js
6. CRUD completo de artículos y categorías desde el admin
7. Vista de suscriptores en el panel admin
8. Búsqueda de artículos por texto
9. Artículos relacionados, populares y tabla de contenidos automática
10. Call to Action (CTA) integrado hacia la plataforma principal de Guvery

---

## 2. Arquitectura del Sistema

### Principio de Diseño: Route Groups

Se usarán los **Route Groups** de Next.js App Router (`(blog)` y `(admin)`) para separar completamente el blog público del panel de administración. Esto permite:

- Layouts completamente distintos sin compartir DOM ni estilos
- Separación clara de responsabilidades
- Middleware de autenticación aplicado únicamente al grupo `(admin)`

### Estructura de Carpetas

```
src/
├── app/
│   ├── (blog)/                            ← Grupo: Blog público
│   │   ├── layout.tsx                     ← Layout del blog (header, footer)
│   │   ├── page.tsx                       ← Home: listado de artículos
│   │   ├── blog/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx               ← Artículo individual
│   │   │   └── page.tsx                   ← Listado paginado completo
│   │   ├── categoria/
│   │   │   └── [slug]/
│   │   │       └── page.tsx               ← Artículos por categoría
│   │   └── buscar/
│   │       └── page.tsx                   ← Resultados de búsqueda
│   │
│   ├── (admin)/                           ← Grupo: Panel de administración
│   │   ├── layout.tsx                     ← Layout admin (sidebar, navbar)
│   │   └── admin/
│   │       ├── page.tsx                   ← Dashboard admin
│   │       ├── articulos/
│   │       │   ├── page.tsx               ← Lista de artículos
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx           ← Crear artículo
│   │       │   └── [id]/
│   │       │       └── page.tsx           ← Editar artículo
│   │       ├── categorias/
│   │       │   └── page.tsx               ← Gestión de categorías
│   │       └── suscriptores/
│   │           └── page.tsx               ← Lista de suscriptores
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts               ← NextAuth handler
│   │   ├── newsletter/
│   │   │   └── route.ts                   ← POST: suscribirse al newsletter
│   │   ├── posts/
│   │   │   ├── route.ts                   ← GET lista / POST crear post
│   │   │   └── [id]/
│   │   │       └── route.ts               ← GET / PUT / DELETE post individual
│   │   └── search/
│   │       └── route.ts                   ← GET búsqueda de artículos
│   │
│   ├── sitemap.ts                         ← Sitemap dinámico automático
│   ├── robots.ts                          ← robots.txt
│   ├── layout.tsx                         ← Root layout global
│   └── not-found.tsx                      ← Página 404 personalizada
│
├── components/
│   ├── blog/                              ← Componentes del blog público
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleGrid.tsx
│   │   ├── ArticleHeader.tsx
│   │   ├── CategoryBadge.tsx
│   │   ├── Pagination.tsx
│   │   ├── RelatedArticles.tsx
│   │   ├── PopularArticles.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── ShareButtons.tsx
│   │   ├── SearchBar.tsx
│   │   └── GuveryCtaBanner.tsx
│   │
│   ├── newsletter/
│   │   ├── NewsletterForm.tsx
│   │   └── ConfirmationMessage.tsx
│   │
│   ├── admin/                             ← Componentes exclusivos del admin
│   │   ├── PostEditor.tsx                 ← Editor de artículos (Tiptap)
│   │   ├── PostTable.tsx
│   │   ├── SubscriberTable.tsx
│   │   └── CategoryManager.tsx
│   │
│   ├── seo/
│   │   └── JsonLd.tsx                     ← Structured data (JSON-LD)
│   │
│   └── ui/                               ← Componentes base reutilizables
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       └── Skeleton.tsx
│
├── lib/
│   ├── prisma.ts                          ← Singleton de Prisma Client
│   ├── auth.ts                            ← Configuración NextAuth
│   └── utils.ts                           ← Helpers generales (slugify, etc.)
│
├── services/                              ← Capa de lógica de negocio (queries)
│   ├── posts.service.ts
│   ├── categories.service.ts
│   ├── subscribers.service.ts
│   └── search.service.ts
│
├── actions/                               ← Server Actions de Next.js
│   ├── post.actions.ts
│   ├── newsletter.actions.ts
│   └── category.actions.ts
│
└── types/
    ├── post.types.ts
    ├── category.types.ts
    └── subscriber.types.ts
```

### Capas de la Arquitectura

```
┌─────────────────────────────────────────┐
│           UI Layer (React)              │  ← Componentes / Pages
├─────────────────────────────────────────┤
│      Server Actions / API Routes        │  ← Punto de entrada de mutaciones
├─────────────────────────────────────────┤
│         Services Layer                  │  ← Lógica de negocio y queries
├─────────────────────────────────────────┤
│         Prisma ORM                      │  ← Acceso a datos tipado
├─────────────────────────────────────────┤
│       Neon PostgreSQL                   │  ← Base de datos en la nube
└─────────────────────────────────────────┘
```

---

## 3. Diseño de Base de Datos

### Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Neon PostgreSQL
}

// ─── USUARIO ADMIN ────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Hasheado con bcrypt
  role          Role      @default(EDITOR)
  posts         Post[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

enum Role {
  ADMIN
  EDITOR
}

// ─── ARTÍCULO ─────────────────────────────────────────

model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  excerpt     String     // Resumen para listados y meta description
  content     String     @db.Text  // HTML generado por Tiptap
  coverImage  String?    // URL de imagen en Cloudinary / Vercel Blob
  status      PostStatus @default(DRAFT)
  views       Int        @default(0)  // Para artículos populares (HU14)
  readingTime Int?       // Minutos estimados de lectura

  // Campos SEO opcionales (overrides del título/excerpt)
  metaTitle       String?
  metaDescription String?

  // Relaciones
  author     User     @relation(fields: [authorId], references: [id])
  authorId   String
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId String
  tags       Tag[]    @relation("PostTags")

  // Timestamps
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt  // Para HU19 (fecha de actualización)

  @@index([slug])
  @@index([categoryId])
  @@index([status])
  @@index([views])
  @@map("posts")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ─── CATEGORÍA ────────────────────────────────────────

model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  color       String?  // Color hex para badge visual
  posts       Post[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("categories")
}

// ─── TAG ──────────────────────────────────────────────

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  posts Post[] @relation("PostTags")

  @@map("tags")
}

// ─── SUSCRIPTOR ───────────────────────────────────────

model Subscriber {
  id          String           @id @default(cuid())
  email       String           @unique
  name        String?
  status      SubscriberStatus @default(PENDING)
  confirmedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  source      String?          // "blog-footer", "post-inline", etc.

  @@index([email])
  @@index([status])
  @@map("subscribers")
}

enum SubscriberStatus {
  PENDING       // Email ingresado, sin confirmar
  CONFIRMED     // Confirmó por email (double opt-in)
  UNSUBSCRIBED  // Se dio de baja
}
```

### Relaciones Entre Modelos

```
User      ──<  Post         (un usuario puede tener muchos posts)
Category  ──<  Post         (una categoría tiene muchos posts)
Post      >─<  Tag          (muchos posts pueden tener muchos tags)
```

### Decisiones de Diseño

| Campo | Modelo | Justificación |
|-------|--------|---------------|
| `slug` único | Post, Category | URLs limpias y SEO-friendly, garantizado a nivel de DB |
| `views` | Post | Calcula artículos populares (HU14) sin herramienta externa |
| `updatedAt` automático | Post | Fecha de actualización visible (HU19) y en sitemap |
| `SubscriberStatus` enum | Subscriber | Flujo completo de double opt-in |
| `source` | Subscriber | Rastrear origen de suscripciones para analítica |
| `metaTitle` / `metaDescription` | Post | Optimización SEO post a post sin cambiar el título visible |
| `readingTime` | Post | Calculado al guardar (palabras / 200 wpm) |

---

## 4. Mapeo de Historias de Usuario

### Epic 1 — Blog Público

| HU | Descripción | Página / Componente | Servicio / Acción |
|----|-------------|---------------------|-------------------|
| HU1 | Explorar artículos del blog | `(blog)/page.tsx` + `ArticleGrid` | `posts.service.getPosts()` |
| HU2 | Leer un artículo completo | `(blog)/blog/[slug]/page.tsx` + `ArticleHeader` | `posts.service.getPostBySlug()` |
| HU3 | Navegar artículos por categoría | `(blog)/categoria/[slug]/page.tsx` | `posts.service.getPostsByCategory()` |
| HU4 | Encontrar artículos desde Google | `generateMetadata()` + JSON-LD en `[slug]` | Metadata estática generada en build |
| HU5 | Compartir artículos en redes | `ShareButtons.tsx` en artículo | Web Share API + URLs de RRSS |

### Epic 2 — Newsletter

| HU | Descripción | Página / Componente | Servicio / Acción |
|----|-------------|---------------------|-------------------|
| HU6 | Suscribirme al newsletter | `NewsletterForm.tsx` (embebido en blog) | `newsletter.actions.ts` → `POST /api/newsletter` |
| HU7 | Confirmar mi suscripción | `ConfirmationMessage.tsx` (estado del form) | Server Action con respuesta optimista |
| HU8 | Ver la lista de suscriptores | `(admin)/admin/suscriptores/page.tsx` + `SubscriberTable` | `subscribers.service.getAll()` |

### Epic 3 — Gestión de Contenido

| HU | Descripción | Página / Componente | Servicio / Acción |
|----|-------------|---------------------|-------------------|
| HU9 | Crear un artículo | `(admin)/admin/articulos/nuevo/page.tsx` + `PostEditor` | `post.actions.createPost()` |
| HU10 | Editar artículos existentes | `(admin)/admin/articulos/[id]/page.tsx` + `PostEditor` | `post.actions.updatePost()` |

### Epic 4 — Funcionalidades Avanzadas

| HU | Descripción | Página / Componente | Servicio / Acción |
|----|-------------|---------------------|-------------------|
| HU11 | Buscar artículos | `SearchBar.tsx` + `(blog)/buscar/page.tsx` | `GET /api/search?q=` con `ILIKE` en PostgreSQL |
| HU12 | Ver artículos relacionados | `RelatedArticles.tsx` en `[slug]/page.tsx` | `posts.service.getRelated()` (misma categoría) |
| HU13 | Tabla de contenidos automática | `TableOfContents.tsx` | Parse de headings del HTML en client-side |
| HU14 | Ver artículos más populares | `PopularArticles.tsx` en sidebar | `posts.service.getPopular()` (ORDER BY views DESC) |
| HU15 | Call to Action hacia Guvery | `GuveryCtaBanner.tsx` | Componente estático con enlace externo |
| HU16 | Vista previa en redes sociales | `generateMetadata()` con `openGraph` y `twitter` | Metadata con imagen, título y descripción |
| HU17 | Paginación de artículos | `Pagination.tsx` en listados | Query param `?page=N` en Server Component |
| HU18 | Filtrar artículos por categoría | `CategoryBadge.tsx` + filtro en listado | URL param `?categoria=slug` (unificado con HU3) |
| HU19 | Ver fecha de actualización | Campo `updatedAt` en `ArticleHeader` | Dato directo desde Prisma |
| HU20 | Sitemap automático | `src/app/sitemap.ts` | Next.js sitemap route nativa con revalidación |

---

## 5. Roadmap de Implementación

### Fase 1 — Infraestructura y Base

**Objetivo:** Tener la base de datos, ORM y autenticación funcionando antes de cualquier feature.

| Tarea | Descripción |
|-------|-------------|
| Base de datos | Crear proyecto en Neon, obtener `DATABASE_URL` |
| Prisma | Instalar, inicializar y escribir el schema completo |
| Migraciones | Ejecutar `prisma migrate dev --name init` |
| Prisma Client | Crear singleton en `src/lib/prisma.ts` |
| NextAuth | Instalar y configurar Credentials provider en `src/lib/auth.ts` |
| API Route auth | Crear `src/app/api/auth/[...nextauth]/route.ts` |
| Middleware | Proteger `/admin/*` en `src/middleware.ts` |
| Login admin | Crear `(admin)/admin/login/page.tsx` |
| Seed | Usuario admin inicial con `prisma db seed` |

**Por qué primero:** Sin base de datos y autenticación, ninguna otra funcionalidad puede existir. La infraestructura es el cimiento de todo el sistema.

---

### Fase 2 — Blog Público

**Objetivo:** Blog completamente funcional con datos reales de prueba.

| Tarea | Descripción |
|-------|-------------|
| Layout blog | `(blog)/layout.tsx` con header, nav de categorías y footer |
| Home del blog | `(blog)/page.tsx` con listado paginado de posts |
| Artículo individual | `(blog)/blog/[slug]/page.tsx` con contenido completo |
| Página de categoría | `(blog)/categoria/[slug]/page.tsx` |
| Services | `posts.service.ts`: `getPosts`, `getPostBySlug`, `getPostsByCategory` |
| Componentes | `ArticleCard`, `ArticleGrid`, `Pagination`, `CategoryBadge` |
| Static Params | `generateStaticParams()` en `[slug]/page.tsx` |
| Seed de contenido | Posts y categorías de prueba sobre importaciones desde USA |

**Por qué segundo:** El blog público es el núcleo del producto. Debe estar funcional antes de agregar capas de SEO o admin encima.

---

### Fase 3 — SEO + Newsletter

**Objetivo:** El blog debe estar optimizado para indexación antes de publicar contenido real.

| Tarea | Descripción |
|-------|-------------|
| Metadata dinámica | `generateMetadata()` en todas las páginas del blog |
| JSON-LD | `JsonLd.tsx` con schema `BlogPosting` y `BreadcrumbList` |
| Sitemap | `src/app/sitemap.ts` dinámico con todos los posts y categorías |
| robots.txt | `src/app/robots.ts` |
| Newsletter Action | `actions/newsletter.actions.ts` con validación Zod |
| Newsletter API | `src/app/api/newsletter/route.ts` |
| Formulario | `NewsletterForm.tsx` con optimistic UI y mensaje de confirmación |
| Compartir | `ShareButtons.tsx` con Web Share API |
| CTA Guvery | `GuveryCtaBanner.tsx` en artículo y home |
| Verificación OG | Validar Open Graph con herramienta externa |

**Por qué tercero:** El SEO debe estar implementado antes del lanzamiento. Google indexa desde el primer día. El newsletter captura leads desde el primer artículo publicado.

---

### Fase 4 — Panel Admin

**Objetivo:** El equipo de Guvery puede gestionar contenido sin tocar código.

| Tarea | Descripción |
|-------|-------------|
| Layout admin | `(admin)/layout.tsx` reutilizando sidebar del dashboard base |
| Dashboard | `(admin)/admin/page.tsx` con métricas (posts, vistas, suscriptores) |
| Lista de posts | `(admin)/admin/articulos/page.tsx` con acciones (publicar, archivar, eliminar) |
| Crear post | `(admin)/admin/articulos/nuevo/page.tsx` + editor Tiptap |
| Editar post | `(admin)/admin/articulos/[id]/page.tsx` |
| Server Actions | `post.actions.ts`: `createPost`, `updatePost`, `deletePost`, `publishPost` |
| Revalidación | `revalidateTag` al publicar/editar para invalidar caché del blog |
| Categorías | `(admin)/admin/categorias/page.tsx` con CRUD |
| Suscriptores | `(admin)/admin/suscriptores/page.tsx` con exportación CSV |
| Seguridad | Verificar sesión activa en todas las Server Actions |

**Por qué cuarto:** El admin es una herramienta interna. Puede desarrollarse después de que el blog público esté funcionando, sabiendo exactamente qué necesita gestionar.

---

### Fase 5 — Funcionalidades Avanzadas

**Objetivo:** Enriquecer la experiencia de usuario y aumentar el tiempo en el sitio.

| Tarea | Descripción |
|-------|-------------|
| Búsqueda | `(blog)/buscar/page.tsx` + `GET /api/search?q=` con full-text search |
| Artículos relacionados | `RelatedArticles.tsx` por categoría |
| Artículos populares | `PopularArticles.tsx` ordenados por `views` |
| Tabla de contenidos | `TableOfContents.tsx` parseando headings del HTML |
| Contador de vistas | Server Action incremental al cargar artículo |
| Tiempo de lectura | Calculado y guardado al crear/editar post |
| OG Image dinámica | `@vercel/og` para imágenes generadas programáticamente _(opcional destacado)_ |
| RSS Feed | `src/app/feed.xml/route.ts` _(opcional destacado)_ |

**Por qué al final:** Son mejoras UX que enriquecen la experiencia pero no son bloqueantes. El blog es útil sin ellas.

---

## 6. Estrategia SEO

### Metadata Dinámica por Artículo

```typescript
// src/app/(blog)/blog/[slug]/page.tsx

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    alternates: {
      canonical: `https://blog.guvery.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://blog.guvery.com/blog/${post.slug}`,
      images: [{ url: post.coverImage ?? "", width: 1200, height: 630 }],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage ?? ""],
    },
  };
}
```

### JSON-LD — Datos Estructurados

**Schema `BlogPosting`** en cada artículo (rich snippets en Google):

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Cómo comprar en Amazon desde Perú",
  "image": "https://blog.guvery.com/images/articulo.jpg",
  "author": {
    "@type": "Person",
    "name": "Guvery Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Guvery",
    "logo": {
      "@type": "ImageObject",
      "url": "https://guvery.com/logo.png"
    }
  },
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-03-01T00:00:00Z",
  "description": "Guía completa para comprar productos en Amazon desde Perú...",
  "mainEntityOfPage": "https://blog.guvery.com/blog/como-comprar-en-amazon-desde-peru"
}
```

**Schema `BreadcrumbList`** para breadcrumbs en SERP:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://blog.guvery.com" },
    { "@type": "ListItem", "position": 2, "name": "Guías de Compra", "item": "https://blog.guvery.com/categoria/guias-de-compra" },
    { "@type": "ListItem", "position": 3, "name": "Cómo comprar en Amazon desde Perú" }
  ]
}
```

### Sitemap Dinámico

```typescript
// src/app/sitemap.ts

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedPosts();
  const categories = await getAllCategories();

  return [
    {
      url: "https://blog.guvery.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...posts.map((post) => ({
      url: `https://blog.guvery.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `https://blog.guvery.com/categoria/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
```

### Convención de URLs

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Home del blog | `/` | `blog.guvery.com` |
| Artículo | `/blog/[slug]` | `/blog/como-comprar-en-amazon-desde-peru` |
| Categoría | `/categoria/[slug]` | `/categoria/guias-de-compra` |
| Búsqueda | `/buscar?q=` | `/buscar?q=amazon` |
| Admin | `/admin/...` | `/admin/articulos/nuevo` |

- Slugs en minúsculas, sin acentos, con guiones medios
- Función `slugify()` en `lib/utils.ts` convierte títulos automáticamente
- Slug editable en el admin para control manual del SEO

### Estructura de Headings

```
H1  → Título del artículo (único por página, para posicionamiento principal)
  H2  → Secciones principales (indexadas en la Tabla de Contenidos)
    H3  → Subsecciones dentro de cada H2
      H4  → Detalle puntual (usar con moderación)
```

---

## 7. Autenticación y Seguridad

### Configuración NextAuth.js

```typescript
// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        return isValid ? user : null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
};
```

### Protección de Rutas con Middleware

```typescript
// src/middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

### Tabla de Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| SQL Injection | Prisma usa queries parametrizadas por defecto |
| XSS en contenido del editor | Sanitizar HTML con DOMPurify server-side antes de guardar |
| CSRF en formularios | NextAuth genera y valida tokens CSRF automáticamente |
| Acceso no autorizado a API | Verificar `getServerSession()` en cada API Route y Server Action |
| Contraseñas en texto plano | `bcryptjs` con `saltRounds = 12` mínimo |
| Exposición de variables de entorno | Nunca usar prefijo `NEXT_PUBLIC_` en variables sensibles (DB, auth secrets) |
| Fuerza bruta en login | Rate limiting con `@upstash/ratelimit` en la API de autenticación |
| Spam en newsletter | Rate limiting por IP en `POST /api/newsletter` |

---

## 8. Performance y Rendering

### Estrategia de Rendering por Página

| Página | Estrategia | Razón |
|--------|------------|-------|
| Home del blog (`/`) | **ISR** — revalidate: 3600s | Contenido frecuente pero no en tiempo real |
| Artículo (`/blog/[slug]`) | **SSG** + revalidación por tag | Máxima performance; se invalida al editar el post |
| Categoría (`/categoria/[slug]`) | **ISR** — revalidate: 3600s | Similar a home |
| Búsqueda (`/buscar`) | **SSR dinámico** | El parámetro `?q=` varía por usuario, no cacheable |
| Panel Admin | **SSR dinámico** | Datos siempre frescos, no debe cachearse |
| Sitemap | **ISR** — revalidate: 86400s | Actualización diaria es suficiente |
| Artículos populares | **ISR** — revalidate: 1800s | Actualización cada 30 min es aceptable |

### Caching con Cache Tags

```typescript
// Al leer un post en el blog:
unstable_cache(
  async () => posts.service.getPostBySlug(slug),
  [`post-${slug}`],
  { tags: [`post-${slug}`, "posts"] }
);

// Al publicar o editar un post en el admin (Server Action):
revalidateTag("posts");
revalidateTag(`post-${slug}`);
```

### Optimización de Imágenes

- Usar `next/image` para **todas** las imágenes con `width`, `height` explícitos
- Imagen hero del artículo: `priority={true}` para mejorar LCP
- Almacenamiento en **Cloudinary** o **Vercel Blob** (nunca en el repositorio)
- El campo `coverImage` en la DB almacena solo la URL

### Core Web Vitals — Objetivos

| Métrica | Objetivo | Implementación |
|---------|----------|----------------|
| LCP | < 2.5s | Imagen hero con `priority={true}` + preload |
| CLS | < 0.1 | Dimensiones explícitas en `next/image` |
| FID / INP | < 200ms | Server Components por defecto, mínimo JS en el cliente |

---

## 9. Revisión Crítica del Proyecto

### Qué está bien diseñado

- Las 20 historias de usuario están bien redactadas con formato estándar y cubren un producto real con valor de negocio claro.
- La separación blog público / panel admin es correcta arquitectónicamente y necesaria para este tipo de producto.
- El stack elegido (Next.js App Router + Prisma + Neon) es moderno, productivo y tiene excelente ecosistema en 2026.
- El campo `views` en `Post` para artículos populares es simple y efectivo sin necesidad de servicios externos como Google Analytics para esta funcionalidad.
- La separación por Epics refleja bien las prioridades del negocio.

### Qué se podría mejorar

| Aspecto | Problema | Solución |
|---------|----------|----------|
| Newsletter (HU6/HU7) | No incluye double opt-in | Agregar email de confirmación con token único |
| Admin suscriptores (HU8) | No especifica exportación | Agregar exportación CSV para campañas de email |
| HU3 y HU18 | Son la misma funcionalidad (filtrar por categoría) | Unificarlas en una sola implementación técnica |
| Imágenes | No hay estrategia de almacenamiento | Definir Cloudinary o Vercel Blob desde el inicio |
| Editor de contenido | No especificado en las HU | Decidir entre Tiptap (rich text) o MDX antes de comenzar |

### Funcionalidades Extra para Destacar

| Feature | Valor técnico |
|---------|---------------|
| OG Image dinámica con `@vercel/og` | Demuestra dominio de APIs avanzadas de Next.js |
| RSS Feed en `/feed.xml` | Credibilidad técnica y SEO adicional |
| Double opt-in en newsletter | Buenas prácticas de email marketing y privacidad |
| Exportación CSV de suscriptores | Utilidad real para el equipo de marketing |
| Búsqueda con PostgreSQL Full-Text Search (`ts_vector`) | Solución robusta sin herramientas externas |
| Vercel Analytics | Métricas de vistas sin cookies, privacy-first |

### Para Destacar en Evaluación Técnica

| Adición | Por qué destaca |
|---------|-----------------|
| Validación con Zod en Server Actions | Manejo profesional de errores en el servidor |
| Seed file de Prisma con datos realistas | Facilita la evaluación del proyecto sin configuración adicional |
| Rate limiting con `@upstash/ratelimit` | Demuestra thinking de seguridad en producción |
| Tests con Vitest para la services layer | Demuestra cultura de calidad de código |
| `robots.ts` bien configurado | Evita indexación del panel admin por buscadores |

---

## 10. Checklist de Implementación

### Fase 1 — Infraestructura

- [ ] Crear proyecto en Neon y obtener la `DATABASE_URL`
- [ ] `npm install prisma @prisma/client && npx prisma init`
- [ ] Escribir `prisma/schema.prisma` completo
- [ ] Ejecutar `npx prisma migrate dev --name init`
- [ ] Crear `src/lib/prisma.ts` (singleton client)
- [ ] `npm install next-auth bcryptjs @types/bcryptjs`
- [ ] Configurar `src/lib/auth.ts` con Credentials provider
- [ ] Crear `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Configurar `src/middleware.ts` para proteger `/admin/*`
- [ ] Crear `src/app/(admin)/admin/login/page.tsx`
- [ ] Crear seed con usuario admin: `npx prisma db seed`

### Fase 2 — Blog Público

- [ ] Crear layout `(blog)/layout.tsx` con header y footer
- [ ] Crear `(blog)/page.tsx` con listado de posts paginado
- [ ] Crear `(blog)/blog/[slug]/page.tsx` — artículo individual
- [ ] Crear `(blog)/categoria/[slug]/page.tsx` — posts por categoría
- [ ] Crear `src/services/posts.service.ts` con: `getPosts`, `getPostBySlug`, `getPostsByCategory`, `getRelated`, `getPopular`
- [ ] Crear componentes: `ArticleCard`, `ArticleGrid`, `Pagination`, `CategoryBadge`
- [ ] Implementar `generateStaticParams()` en `[slug]/page.tsx`
- [ ] Crear seed de posts con datos realistas sobre importaciones desde USA

### Fase 3 — SEO + Newsletter

- [ ] Implementar `generateMetadata()` en todas las páginas del blog
- [ ] Crear `src/components/seo/JsonLd.tsx` con schema `BlogPosting`
- [ ] Crear `src/app/sitemap.ts` dinámico con posts y categorías
- [ ] Crear `src/app/robots.ts`
- [ ] `npm install zod` y crear `actions/newsletter.actions.ts`
- [ ] Crear `src/app/api/newsletter/route.ts`
- [ ] Crear `src/components/newsletter/NewsletterForm.tsx` con optimistic UI
- [ ] Crear `src/components/blog/ShareButtons.tsx`
- [ ] Crear `src/components/blog/GuveryCtaBanner.tsx`
- [ ] Validar Open Graph con herramienta de validación

### Fase 4 — Panel Admin

- [ ] Crear layout `(admin)/layout.tsx` (adaptar sidebar del dashboard existente)
- [ ] Crear `(admin)/admin/page.tsx` — dashboard con métricas básicas
- [ ] Crear `(admin)/admin/articulos/page.tsx` — lista con acciones
- [ ] Crear `(admin)/admin/articulos/nuevo/page.tsx` — formulario creación
- [ ] Crear `(admin)/admin/articulos/[id]/page.tsx` — formulario edición
- [ ] `npm install @tiptap/react @tiptap/starter-kit` e integrar editor
- [ ] Crear `src/actions/post.actions.ts` (createPost, updatePost, deletePost, publishPost)
- [ ] Agregar `revalidateTag` al publicar/editar post
- [ ] Crear `(admin)/admin/categorias/page.tsx` con CRUD
- [ ] Crear `(admin)/admin/suscriptores/page.tsx` con exportación CSV
- [ ] Verificar sesión activa en todas las Server Actions del admin

### Fase 5 — Funcionalidades Avanzadas

- [ ] Crear `(blog)/buscar/page.tsx`
- [ ] Crear `src/app/api/search/route.ts` con PostgreSQL full-text search
- [ ] Crear `src/components/blog/RelatedArticles.tsx`
- [ ] Crear `src/components/blog/PopularArticles.tsx`
- [ ] Crear `src/components/blog/TableOfContents.tsx` (parse headings del HTML)
- [ ] Implementar conteo de vistas con Server Action al cargar artículo
- [ ] Calcular y guardar `readingTime` al crear/editar post
- [ ] _(Opcional)_ OG Image dinámica con `@vercel/og`
- [ ] _(Opcional)_ RSS Feed en `src/app/feed.xml/route.ts`

---

## Variables de Entorno Requeridas

```env
# .env.local

# Base de datos
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"

# Almacenamiento de imágenes (elegir uno)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
# o
BLOB_READ_WRITE_TOKEN=""   # Vercel Blob

# Email (para double opt-in en newsletter)
RESEND_API_KEY=""
```

---

## Dependencias a Instalar

```bash
# ORM y base de datos
npm install prisma @prisma/client

# Autenticación
npm install next-auth bcryptjs
npm install -D @types/bcryptjs

# Validación
npm install zod

# Editor de contenido
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link

# Almacenamiento de imágenes (elegir uno)
npm install cloudinary
# o
npm install @vercel/blob

# Email para newsletter
npm install resend

# Utilidades de contenido
npm install reading-time slugify

# Rate limiting (opcional, recomendado)
npm install @upstash/ratelimit @upstash/redis
```

---

> **Nota:** Este documento es el contrato técnico del proyecto. Cada decisión de arquitectura está justificada por los requerimientos de las historias de usuario y las restricciones del stack tecnológico. Actualizar este documento si la arquitectura cambia durante el desarrollo.
