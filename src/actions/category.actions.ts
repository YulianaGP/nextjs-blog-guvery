"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Tipo de estado ─────────────────────────────────────────────────────────────

export type CategoryActionState = {
  success: boolean;
  message: string;
} | null;

// ── Esquema de validación ─────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones."),
  description: z.string().optional(),
  // Color en formato hexadecimal, por ejemplo: #E86C2C
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido. Usa formato hexadecimal, ej: #E86C2C.")
    .optional()
    .or(z.literal("")),
});

// ── Crear categoría ───────────────────────────────────────────────────────────

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, slug, description, color } = parsed.data;

  // Verificar que el slug no esté en uso
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, message: "Ya existe una categoría con ese slug." };
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
      color: color || null,
    },
  });

  revalidatePath("/admin/categorias");

  return { success: true, message: `Categoría "${name}" creada correctamente.` };
}

// ── Eliminar categoría ────────────────────────────────────────────────────────

export async function deleteCategory(id: string): Promise<CategoryActionState> {
  // Antes de borrar, verificar que no haya posts usando esta categoría.
  // Si hay posts, rechazamos la operación con un mensaje amigable.
  const postsCount = await prisma.post.count({ where: { categoryId: id } });

  if (postsCount > 0) {
    return {
      success: false,
      message: `No se puede eliminar: hay ${postsCount} artículo(s) en esta categoría.`,
    };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categorias");

  return { success: true, message: "Categoría eliminada." };
}
