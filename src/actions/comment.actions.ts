"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  COMMENTS_PAGE_SIZE,
  getCommentsByPost,
  type CommentWithAuthor,
} from "@/services/comments.service";
import { COMMENT_MAX_LENGTH, COMMENT_MIN_LENGTH } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// ── Validación ─────────────────────────────────────────────────────────────

const MIN_LENGTH = COMMENT_MIN_LENGTH;
const MAX_LENGTH = COMMENT_MAX_LENGTH;

function validateContent(content: unknown): string {
  if (typeof content !== "string") throw new Error("Contenido inválido.");
  const trimmed = content.trim();
  if (trimmed.length < MIN_LENGTH)
    throw new Error(`El comentario debe tener al menos ${MIN_LENGTH} caracteres.`);
  if (trimmed.length > MAX_LENGTH)
    throw new Error(`El comentario no puede superar los ${MAX_LENGTH} caracteres.`);
  return trimmed;
}

// ── Actions ────────────────────────────────────────────────────────────────

/**
 * Publica un nuevo comentario en un artículo.
 * Requiere sesión activa (cualquier accountType).
 * El contenido se guarda como texto plano — sin HTML.
 */
export async function createComment(
  postId: string,
  rawContent: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión para comentar." };
  }

  let content: string;
  try {
    content = validateContent(rawContent);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  // Rate limiting: máximo 5 comentarios por usuario por hora
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.comment.count({
    where: { userId: session.user.id, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= 5) {
    return { success: false, error: "Has alcanzado el límite de comentarios por hora. Inténtalo más tarde." };
  }

  // Verificar que el post existe y está publicado
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { status: true, slug: true },
  });

  if (!post || post.status !== "PUBLISHED") {
    return { success: false, error: "El artículo no está disponible." };
  }

  await prisma.comment.create({
    data: {
      content,
      postId,
      userId: session.user.id,
      status: "APPROVED",
    },
  });

  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}

/**
 * Elimina un comentario.
 * Solo el autor del comentario o un ADMIN puede eliminarlo.
 */
export async function deleteComment(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });

  if (!comment) {
    return { success: false, error: "Comentario no encontrado." };
  }

  const isAuthor = comment.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return { success: false, error: "No tienes permiso para eliminar este comentario." };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/blog/${comment.post.slug}`);
  return { success: true };
}

/**
 * Carga más comentarios (paginación).
 * Retorna los siguientes N comentarios a partir de `skip`.
 */
export async function loadMoreComments(
  postId: string,
  skip: number,
): Promise<CommentWithAuthor[]> {
  return getCommentsByPost(postId, skip, COMMENTS_PAGE_SIZE);
}
