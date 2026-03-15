"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProfileActionState = {
  success: boolean;
  message: string;
  updatedName?: string; // devuelto al cliente para sincronizar la sesión
} | null;

// Sanitiza el slug: minúsculas, espacios → guiones, elimina caracteres no permitidos
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")         // espacios a guiones
    .replace(/[^a-z0-9-]/g, "")  // elimina caracteres no permitidos
    .replace(/-{2,}/g, "-")       // colapsa guiones dobles
    .replace(/^-|-$/g, "");       // elimina guiones al inicio/fin
}

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  bio: z.string().optional(),
  slug: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeSlug(val) : undefined))
    .refine(
      (val) => !val || /^[a-z0-9-]+$/.test(val),
      "El slug solo puede contener letras minúsculas, números y guiones.",
    )
    .refine(
      (val) => !val || val.length >= 2,
      "El slug debe tener al menos 2 caracteres.",
    ),
});

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "No autorizado." };
  }

  const currentUserId = session.user.id;

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    slug: formData.get("slug") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const { name, bio, slug } = parsed.data;

  // Verificar unicidad del slug excluyendo al propio usuario
  if (slug) {
    const slugTaken = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (slugTaken && slugTaken.id !== currentUserId) {
      return {
        success: false,
        message: "Ese slug ya está en uso por otro usuario.",
      };
    }
  }

  await prisma.user.update({
    where: { id: currentUserId },
    data: {
      name,
      bio: bio ?? null,
      slug: slug ?? null,
    },
  });

  revalidatePath("/profile");

  return { success: true, message: "Perfil actualizado correctamente.", updatedName: name };
}
