"use server";

import { prisma } from "@/lib/prisma";
import { incrementPostViews } from "@/services/posts.service";
import { PostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ── Incrementar vistas (ya existía) ───────────────────────────────────────────

/**
 * Incrementa el contador de vistas de un post.
 * Llamado desde ViewIncrementer (componente cliente) al montar la página.
 */
export async function incrementViews(slug: string) {
  try {
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

// z.object define los campos que esperamos del formulario y sus reglas.
// Si el campo no cumple la regla, Zod devuelve el mensaje de error.
const postSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones."),
  excerpt: z.string().min(10, "El resumen debe tener al menos 10 caracteres."),
  content: z.string().min(1, "El contenido no puede estar vacío."),
  categoryId: z.string().min(1, "Selecciona una categoría."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean().optional(),
  coverImage: z.string().url("URL de imagen no válida.").optional().or(z.literal("")),
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
    // Los checkboxes solo envían valor cuando están marcados; si no, el campo no existe.
    // formData.get("featured") devuelve "on" si marcado, null si no.
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

  const authorId = await getDefaultAuthorId();

  await prisma.post.create({
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
      // Si se publica directamente, guardamos la fecha de publicación
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  // Borramos la caché de la lista de artículos del admin
  revalidatePath("/admin/articulos");
  // Si se publicó, también borramos la caché del blog público
  if (status === "PUBLISHED") {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
  }

  // redirect() lanza una excepción especial de Next.js para navegar al usuario.
  // Debe llamarse FUERA de un try/catch para que funcione correctamente.
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

  // Verificar que el slug no esté en uso por OTRO post
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { success: false, message: "Ya existe otro artículo con ese slug." };
  }

  const currentPost = await prisma.post.findUnique({ where: { id }, select: { slug: true, publishedAt: true, status: true } });

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
      // Solo establecemos publishedAt si se está publicando por primera vez
      publishedAt:
        status === "PUBLISHED" && !currentPost?.publishedAt ? new Date() : currentPost?.publishedAt,
    },
  });

  // Invalida la caché del slug anterior (por si cambió) y el nuevo
  if (currentPost?.slug && currentPost.slug !== slug) {
    revalidatePath(`/blog/${currentPost.slug}`);
  }
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/articulos");
  revalidatePath("/blog");

  redirect("/admin/articulos");
}

// ── Eliminar artículo ──────────────────────────────────────────────────────────

export async function deletePost(id: string): Promise<PostActionState> {
  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } });

  await prisma.post.delete({ where: { id } });

  // Borramos la caché de la página del artículo eliminado
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
  const post = await prisma.post.update({
    where: { id },
    data: {
      status: newStatus,
      // Si se publica y no tenía fecha, la asignamos ahora
      publishedAt: newStatus === PostStatus.PUBLISHED ? new Date() : undefined,
    },
    select: { slug: true },
  });

  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/articulos");
  revalidatePath("/blog");

  return { success: true, message: `Estado cambiado a ${newStatus}.` };
}

// ── Helpers internos ───────────────────────────────────────────────────────────

/**
 * Obtiene el id del primer usuario ADMIN disponible.
 * Se usa al crear un post sin un authorId explícito del formulario.
 */
async function getDefaultAuthorId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (!admin) throw new Error("No se encontró usuario ADMIN en la base de datos.");
  return admin.id;
}
