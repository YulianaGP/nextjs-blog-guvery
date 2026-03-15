"use client";

import { deleteAuthor } from "@/actions/author.actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  authorId: string;
  authorName: string | null;
};

export function DeleteAuthorButton({ authorId, authorName }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar a ${authorName ?? "este autor"}? Sus artículos se reasignarán al admin.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteAuthor(authorId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
