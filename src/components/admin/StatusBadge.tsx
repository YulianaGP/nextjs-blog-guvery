// Componente servidor (sin "use client") — solo renderiza HTML estático.
// Recibe el estado del post y devuelve un badge de color correspondiente.

import { PostStatus } from "@prisma/client";

type Props = {
  status: PostStatus;
};

// Mapa de estado → clases de color Tailwind
const statusConfig: Record<PostStatus, { label: string; className: string }> = {
  PUBLISHED: {
    label: "Publicado",
    // Verde — indica que el artículo está visible al público
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  DRAFT: {
    label: "Borrador",
    // Amarillo — indica que el artículo está en progreso, no visible
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  ARCHIVED: {
    label: "Archivado",
    // Gris — indica que el artículo fue retirado del blog
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

export function StatusBadge({ status }: Props) {
  const { label, className } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
