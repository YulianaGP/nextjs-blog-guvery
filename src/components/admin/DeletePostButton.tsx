"use client";

import { deletePost } from "@/actions/post.actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  postId: string;
  postTitle: string;
};

export function DeletePostButton({ postId, postTitle }: Props) {
  // useTransition nos da isPending (true mientras el servidor procesa)
  // y startTransition para envolver la llamada al Server Action.
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    // Pedimos confirmación antes de borrar — no hay vuelta atrás
    const confirmed = window.confirm(
      `¿Eliminar "${postTitle}"?\n\nEsta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    // startTransition le dice a React que esto es una transición no urgente;
    // mientras dura, isPending = true y podemos mostrar feedback al usuario.
    startTransition(async () => {
      await deletePost(postId);
      // Refrescamos la página para que la tabla se actualice sin recargar todo
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
