import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

/** Todas las categorías con el conteo de posts publicados. */
export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: { where: { status: PostStatus.PUBLISHED } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

/** Categoría por slug — retorna null si no existe. */
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: { where: { status: PostStatus.PUBLISHED } },
        },
      },
    },
  });
}

export type CategoryWithCount = Awaited<
  ReturnType<typeof getCategories>
>[number];

/**
 * Admin: todas las categorías con el conteo TOTAL de posts (cualquier estado).
 * Usado en la página de gestión de categorías del admin.
 */
export async function getCategoriesWithTotalCount() {
  return prisma.category.findMany({
    include: {
      // _count sin filtro de estado → cuenta todos (DRAFT + PUBLISHED + ARCHIVED)
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });
}

export type CategoryWithTotalCount = Awaited<
  ReturnType<typeof getCategoriesWithTotalCount>
>[number];
