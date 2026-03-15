"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { getServerSession } from "next-auth";

// ── Helper interno ─────────────────────────────────────────────────────────────
// Usado por post.actions.ts para crear notificaciones al cambiar estado de un artículo.

export async function createNotifications({
  userIds,
  fromId,
  postId,
  type,
  message,
}: {
  userIds: string[];
  fromId?: string | null;
  postId?: string | null;
  type: NotificationType;
  message: string;
}) {
  if (userIds.length === 0) return;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      fromId: fromId ?? null,
      postId: postId ?? null,
      type,
      message,
    })),
  });
}

// ── Consultas del usuario actual ───────────────────────────────────────────────

/** Devuelve las últimas 20 notificaciones del usuario autenticado. */
export async function getUserNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      from: { select: { name: true, image: true } },
      post: { select: { id: true, title: true, slug: true } },
    },
  });
}

/** Devuelve el número de notificaciones no leídas del usuario autenticado. */
export async function getUnreadCount(): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });
}

// ── Mutaciones ─────────────────────────────────────────────────────────────────

/** Marca una notificación específica como leída (solo si pertenece al usuario actual). */
export async function markNotificationRead(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { read: true },
  });
}

/** Marca todas las notificaciones del usuario actual como leídas. */
export async function markAllNotificationsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
}
