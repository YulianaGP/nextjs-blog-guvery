"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type AuthorActionState = {
  success: boolean;
  message: string;
} | null;

const authorSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Email no válido."),
  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres.")
    .refine((val) => /[A-Z]/.test(val), "La contraseña debe contener al menos una letra mayúscula.")
    .refine((val) => /[0-9]/.test(val), "La contraseña debe contener al menos un número.")
    .refine((val) => /[^a-zA-Z0-9]/.test(val), "La contraseña debe contener al menos un símbolo especial."),
  bio: z.string().optional(),
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres.")
    .refine((val) => /^[a-z0-9-]+$/.test(val), "Solo letras minúsculas, números y guiones.")
    .optional()
    .or(z.literal("")),
});

export async function createAuthor(
  _prevState: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  // Solo ADMIN puede crear autores
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, message: "No tienes permiso para realizar esta acción." };
  }

  const parsed = authorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    bio: formData.get("bio"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, email, password, bio, slug } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, message: "Ya existe un usuario con ese email." };
  }

  if (slug) {
    const slugTaken = await prisma.user.findUnique({ where: { slug } });
    if (slugTaken) {
      return { success: false, message: "Ese slug ya está en uso." };
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "EDITOR",
        accountType: "STAFF",
        bio: bio || null,
        slug: slug || null,
      },
    });
  } catch {
    return { success: false, message: "Error al crear el autor. Inténtalo de nuevo." };
  }

  revalidatePath("/admin/autores");
  return { success: true, message: "Autor creado correctamente." };
}

export async function deleteAuthor(id: string): Promise<AuthorActionState> {
  // Solo ADMIN puede eliminar autores
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, message: "No tienes permiso para realizar esta acción." };
  }

  try {
    // Reasignar posts y eliminar autor en una transacción atómica para evitar posts huérfanos
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });

    await prisma.$transaction(async (tx) => {
      if (admin && admin.id !== id) {
        await tx.post.updateMany({ where: { authorId: id }, data: { authorId: admin.id } });
      }
      await tx.user.delete({ where: { id } });
    });
  } catch {
    return { success: false, message: "Error al eliminar el autor. Inténtalo de nuevo." };
  }

  revalidatePath("/admin/autores");
  return { success: true, message: "Autor eliminado." };
}
