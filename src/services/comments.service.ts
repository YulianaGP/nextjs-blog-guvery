import { prisma } from "@/lib/prisma";

export const COMMENTS_PAGE_SIZE = 20;

export type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

/**
 * Obtiene los comentarios aprobados de un post, ordenados del más reciente al más antiguo.
 * Soporta paginación mediante `skip`.
 */
export async function getCommentsByPost(
  postId: string,
  skip = 0,
  take = COMMENTS_PAGE_SIZE,
): Promise<CommentWithAuthor[]> {
  return prisma.comment.findMany({
    where: { postId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

/**
 * Cuenta el total de comentarios aprobados de un post.
 * Usado para saber si hay más comentarios disponibles (paginación).
 */
export async function getCommentCount(postId: string): Promise<number> {
  return prisma.comment.count({
    where: { postId, status: "APPROVED" },
  });
}
