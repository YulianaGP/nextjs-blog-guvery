"use client";

// Botón de eliminar categoría con confirmación — Client Component.
// Igual que DeletePostButton pero para categorías.

import { deleteCategory } from "@/actions/category.actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  categoryId: string;
  categoryName: string;
  // Número de posts que tiene la categoría — si > 0, mostramos advertencia
  postsCount: number;
};

export function DeleteCategoryButton({ categoryId, categoryName, postsCount }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (postsCount > 0) {
      alert(
        `No se puede eliminar "${categoryName}" porque tiene ${postsCount} artículo(s) asociados.\n\nPrimero reasigna o elimina esos artículos.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar la categoría "${categoryName}"?\n\nEsta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteCategory(categoryId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending || postsCount > 0}
      title={postsCount > 0 ? `Tiene ${postsCount} artículo(s)` : "Eliminar categoría"}
      className="rounded px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
