import { prisma } from "@/lib/prisma";
import { PostStatus, Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const POSTS_PER_PAGE = 6;

// ── Select reutilizable para listados ─────────────────────────────────────────
// No incluye `content` para evitar traer HTML largo en vistas de tarjeta
const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  featured: true,
  readingTime: true,
  views: true,
  publishedAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true, slug: true, color: true },
  },
} satisfies Prisma.PostSelect;

// ── Tipos exportados ───────────────────────────────────────────────────────────
export type PostCard = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;

export type PostDetail = Prisma.PostGetPayload<{
  include: {
    category: true;
    author: { select: { name: true; image: true } };
    tags: true;
  };
}>;

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Listado paginado de posts publicados.
 * Acepta filtro opcional por categorySlug.
 */
export async function getPosts({
  page = 1,
  pageSize = POSTS_PER_PAGE,
  categorySlug,
}: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
} = {}) {
  const where: Prisma.PostWhereInput = {
    status: PostStatus.PUBLISHED,
    ...(categorySlug && { category: { slug: categorySlug } }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: postCardSelect,
      orderBy: { publishedAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

/**
 * Post completo por slug — incluye content, author y tags.
 * Retorna null si no existe o no está publicado.
 */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return prisma.post.findUnique({
    where: { slug, status: PostStatus.PUBLISHED },
    include: {
      category: true,
      author: { select: { name: true, image: true } },
      tags: true,
    },
  });
}

/** Posts destacados (featured = true), ordenados por fecha. */
export async function getFeaturedPosts(limit = 3): Promise<PostCard[]> {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, featured: true },
    select: postCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** Posts más vistos — para widget sidebar "Artículos populares" (HU14). */
export async function getPopularPosts(limit = 5): Promise<PostCard[]> {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: postCardSelect,
    orderBy: { views: "desc" },
    take: limit,
  });
}

/** Posts de la misma categoría, excluyendo el post actual (HU12). */
export async function getRelatedPosts(
  postId: string,
  categoryId: string,
  limit = 3,
): Promise<PostCard[]> {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      categoryId,
      id: { not: postId },
    },
    select: postCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/**
 * Búsqueda de posts publicados por título o excerpt (case-insensitive).
 * Usado en la página /buscar y en la API route GET /api/search.
 */
export async function searchPosts(query: string, limit = 12): Promise<PostCard[]> {
  const q = query.trim();
  if (!q) return [];

  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      OR: [
        { title:   { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ],
    },
    select: postCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** Todos los slugs publicados — usado por generateStaticParams. */
export async function getAllPublishedSlugs() {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { slug: true, updatedAt: true },
  });
}

/** Incrementa el contador de vistas de un post (HU14). */
export async function incrementPostViews(slug: string) {
  return prisma.post.update({
    where: { slug },
    data: { views: { increment: 1 } },
    select: { views: true },
  });
}

// ── Admin queries ──────────────────────────────────────────────────────────────

/**
 * Admin: todos los posts sin filtro de estado, ordenados por fecha de actualización.
 * A diferencia de getPosts(), incluye DRAFT y ARCHIVED.
 * Cacheado 60s — se invalida con revalidateTag("admin-posts") tras mutaciones.
 */
export const getAdminPosts = unstable_cache(
  async () => {
    return prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        views: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  },
  ["admin-posts"],
  { revalidate: 60, tags: ["admin-posts"] },
);

/**
 * Editor: posts del autor autenticado (todos los estados).
 * A diferencia de getAdminPosts(), filtra por authorId y no usa caché global.
 */
export async function getAuthorPosts(authorId: string) {
  return prisma.post.findMany({
    where: { authorId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      featured: true,
      views: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Admin: post completo por id — incluye content y tags para el formulario de edición.
 * Retorna null si no existe.
 */
export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
      author: { select: { name: true } },
    },
  });
}

/**
 * Métricas agregadas para el dashboard del admin.
 * Usa Promise.all para ejecutar todas las queries en paralelo.
 * Cacheado 60s — se invalida con revalidateTag("dashboard-stats") tras mutaciones.
 */
export const getDashboardStats = unstable_cache(
  async () => {
    const [totalPosts, publishedPosts, totalViewsAgg, confirmedSubscribers, pendingSubscribers] =
      await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { status: "PUBLISHED" } }),
        prisma.post.aggregate({ _sum: { views: true } }),
        prisma.subscriber.count({ where: { status: "CONFIRMED" } }),
        prisma.subscriber.count({ where: { status: "PENDING" } }),
      ]);

    return {
      totalPosts,
      publishedPosts,
      totalViews: totalViewsAgg._sum.views ?? 0,
      confirmedSubscribers,
      pendingSubscribers,
    };
  },
  ["dashboard-stats"],
  { revalidate: 60, tags: ["dashboard-stats"] },
);
