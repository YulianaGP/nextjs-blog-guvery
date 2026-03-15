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
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  DRAFT: {
    label: "Borrador",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  REVIEW: {
    label: "En revisión",
    // Azul — enviado por el autor, pendiente de aprobación del admin
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  ARCHIVED: {
    label: "Archivado",
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
