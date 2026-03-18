"use server";

import { createNotifications } from "@/actions/notification.actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { viewRatelimit } from "@/lib/redis";
import { incrementPostViews } from "@/services/posts.service";
import { PostStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ── Incrementar vistas ────────────────────────────────────────────────────────

/**
 * Incrementa el contador de vistas con rate-limiting via Upstash Redis.
 * Permite máximo 1 incremento por IP+slug cada hora para evitar spam.
 * Llamado desde ViewIncrementer al montar la página del artículo.
 */
export async function incrementViews(slug: string) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "anonymous";

    const identifier = `${ip}:${slug}`;
    const { success } = await viewRatelimit.limit(identifier);

    if (!success) return; // Ya contó esta visita en la última hora

    await incrementPostViews(slug);
  } catch {
    // Silencioso — un fallo en el conteo no debe afectar al lector
  }
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type PostActionState = {
  success: boolean;
  message: string;
} | null;

// ── Esquema de validación ─────────────────────────────────────────────────────

const postSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .refine((val) => /^[a-z0-9-]+$/.test(val), "El slug solo puede contener letras minúsculas, números y guiones."),
  excerpt: z.string().min(10, "El resumen debe tener al menos 10 caracteres."),
  content: z.string().min(1, "El contenido no puede estar vacío."),
  categoryId: z.string().min(1, "Selecciona una categoría."),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean().optional(),
  coverImage: z
    .string()
    .refine((val) => {
      try { new URL(val); return true; } catch { return false; }
    }, "URL de imagen no válida.")
    .refine(
      (url) => {
        try {
          const { hostname } = new URL(url);
          const allowed = ["res.cloudinary.com", "images.unsplash.com", "blob.vercel-storage.com", "cdn.guvery.com"];
          return allowed.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
        } catch {
          return false;
        }
      },
      "La imagen debe provenir de un dominio permitido (Cloudinary, Unsplash, Vercel Blob).",
    )
    .optional()
    .or(z.literal("")),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// ── Helper: parsear formData ───────────────────────────────────────────────────

function extractPostData(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    status: formData.get("status") ?? "DRAFT",
    coverImage: formData.get("coverImage"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
  };
}

// ── Crear artículo ─────────────────────────────────────────────────────────────

export async function createPost(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const parsed = postSchema.safeParse(extractPostData(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { title, slug, excerpt, content, categoryId, status, featured, coverImage, metaTitle, metaDescription } =
    parsed.data;

  // Verificar que el slug no esté ya en uso
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, message: "Ya existe un artículo con ese slug." };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/admin/login");
  const authorId = session.user.id;

  let newPost: { id: string };
  try {
    newPost = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        authorId,
        status: status as PostStatus,
        featured: featured ?? false,
        coverImage: coverImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        readingTime: calcReadingTime(content),
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
  } catch {
    return { success: false, message: "Error al guardar el artículo. Inténtalo de nuevo." };
  }

  revalidatePath("/admin/articulos");
  if (status === "PUBLISHED") {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
  }

  if (status === "REVIEW") {
    const [admins, author] = await Promise.all([
      prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: authorId }, select: { name: true } }),
    ]);
    const adminIds = admins.map((a) => a.id).filter((id) => id !== authorId);
    if (adminIds.length > 0) {
      await createNotifications({
        userIds: adminIds,
        fromId: authorId,
        postId: newPost.id,
        type: "POST_SUBMITTED",
        message: `${author?.name ?? "Un autor"} ha enviado "${title}" para revisión.`,
      });
    }
  }

  redirect("/admin/articulos");
}

// ── Actualizar artículo ────────────────────────────────────────────────────────

export async function updatePost(
  id: string,
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const parsed = postSchema.safeParse(extractPostData(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { title, slug, excerpt, content, categoryId, status, featured, coverImage, metaTitle, metaDescription } =
    parsed.data;

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  if (!currentUserId) redirect("/admin/login");

  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { success: false, message: "Ya existe otro artículo con ese slug." };
  }

  const currentPost = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, publishedAt: true, status: true, authorId: true },
  });

  if (session.user.role === "EDITOR" && currentPost?.authorId !== currentUserId) {
    return { success: false, message: "No tienes permiso para editar este artículo." };
  }

  try {
    await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        status: status as PostStatus,
        featured: featured ?? false,
        coverImage: coverImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        readingTime: calcReadingTime(content),
        publishedAt:
          status === "PUBLISHED" && !currentPost?.publishedAt ? new Date() : currentPost?.publishedAt,
      },
    });
  } catch {
    return { success: false, message: "Error al actualizar el artículo. Inténtalo de nuevo." };
  }

  if (currentPost?.slug && currentPost.slug !== slug) {
    revalidatePath(`/blog/${currentPost.slug}`);
  }
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/articulos");
  revalidatePath("/blog");

  if (currentPost) {
    const oldStatus = currentPost.status;
    const authorId = currentPost.authorId;

    if (status === "REVIEW" && oldStatus !== "REVIEW") {
      // Autor envía a revisión → notificar a todos los admins
      const [admins, author] = await Promise.all([
        prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }),
        prisma.user.findUnique({ where: { id: currentUserId }, select: { name: true } }),
      ]);
      const adminIds = admins.map((a) => a.id).filter((aid) => aid !== currentUserId);
      if (adminIds.length > 0) {
        await createNotifications({
          userIds: adminIds,
          fromId: currentUserId,
          postId: id,
          type: "POST_SUBMITTED",
          message: `${author?.name ?? "Un autor"} ha enviado "${title}" para revisión.`,
        });
      }
    } else if (status === "PUBLISHED" && oldStatus !== "PUBLISHED" && currentUserId !== authorId) {
      // Admin publica → notificar al autor
      await createNotifications({
        userIds: [authorId],
        fromId: currentUserId,
        postId: id,
        type: "POST_APPROVED",
        message: `Tu artículo "${title}" ha sido publicado.`,
      });
    } else if (status === "ARCHIVED" && oldStatus === "REVIEW") {
      // Admin rechaza desde revisión → notificar al autor
      await createNotifications({
        userIds: [authorId],
        fromId: currentUserId,
        postId: id,
        type: "POST_REJECTED",
        message: `Tu artículo "${title}" no fue aprobado y ha sido archivado.`,
      });
    } else if (status === "DRAFT" && oldStatus === "REVIEW") {
      // Admin devuelve a borrador → notificar al autor que debe revisar
      await createNotifications({
        userIds: [authorId],
        fromId: currentUserId,
        postId: id,
        type: "POST_NEEDS_REVISION",
        message: `Tu artículo "${title}" necesita revisiones antes de ser publicado.`,
      });
    }
  }

  redirect("/admin/articulos");
}

// ── Eliminar artículo ──────────────────────────────────────────────────────────

export async function deletePost(id: string): Promise<PostActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/admin/login");

  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true, authorId: true } });

  // EDITOR solo puede eliminar sus propios artículos
  if (session.user.role === "EDITOR" && post?.authorId !== session.user.id) {
    return { success: false, message: "No tienes permiso para eliminar este artículo." };
  }

  try {
    await prisma.post.delete({ where: { id } });
  } catch {
    return { success: false, message: "Error al eliminar el artículo. Inténtalo de nuevo." };
  }

  if (post?.slug) {
    revalidatePath(`/blog/${post.slug}`);
  }
  revalidatePath("/admin/articulos");
  revalidatePath("/blog");

  return { success: true, message: "Artículo eliminado." };
}

// ── Cambiar estado rápido ──────────────────────────────────────────────────────

export async function changePostStatus(
  id: string,
  newStatus: PostStatus,
): Promise<PostActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/admin/login");
  const currentUserId = session.user.id;

  const currentPost = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, title: true, authorId: true, status: true },
  });

  if (!currentPost) return { success: false, message: "Artículo no encontrado." };

  if (session.user.role === "EDITOR" && currentPost.authorId !== currentUserId) {
    return { success: false, message: "No tienes permiso para modificar este artículo." };
  }

  try {
    await prisma.post.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === PostStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  } catch {
    return { success: false, message: "Error al cambiar el estado. Inténtalo de nuevo." };
  }

  revalidatePath(`/blog/${currentPost.slug}`);
  revalidatePath("/admin/articulos");
  revalidatePath("/blog");
  const { authorId, title, status: oldStatus } = currentPost;

  if (newStatus === PostStatus.PUBLISHED && oldStatus !== PostStatus.PUBLISHED && currentUserId !== authorId) {
    await createNotifications({
      userIds: [authorId],
      fromId: currentUserId,
      postId: id,
      type: "POST_APPROVED",
      message: `Tu artículo "${title}" ha sido publicado.`,
    });
  } else if (newStatus === PostStatus.ARCHIVED && oldStatus === PostStatus.REVIEW) {
    await createNotifications({
      userIds: [authorId],
      fromId: currentUserId,
      postId: id,
      type: "POST_REJECTED",
      message: `Tu artículo "${title}" no fue aprobado y ha sido archivado.`,
    });
  } else if (newStatus === PostStatus.DRAFT && oldStatus === PostStatus.REVIEW) {
    await createNotifications({
      userIds: [authorId],
      fromId: currentUserId,
      postId: id,
      type: "POST_NEEDS_REVISION",
      message: `Tu artículo "${title}" necesita revisiones antes de ser publicado.`,
    });
  } else if (newStatus === PostStatus.REVIEW && oldStatus !== PostStatus.REVIEW) {
    const [admins, author] = await Promise.all([
      prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: authorId }, select: { name: true } }),
    ]);
    const adminIds = admins.map((a) => a.id).filter((aid) => aid !== currentUserId);
    if (adminIds.length > 0) {
      await createNotifications({
        userIds: adminIds,
        fromId: currentUserId,
        postId: id,
        type: "POST_SUBMITTED",
        message: `${author?.name ?? "Un autor"} ha enviado "${title}" para revisión.`,
      });
    }
  }

  return { success: true, message: `Estado cambiado a ${newStatus}.` };
}

// ── Helpers internos ───────────────────────────────────────────────────────────

/**
 * Calcula el tiempo de lectura estimado en minutos a partir del HTML del contenido.
 * Asume una velocidad de lectura de 200 palabras por minuto.
 */
function calcReadingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]+>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

