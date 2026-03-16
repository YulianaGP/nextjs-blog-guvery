"use client";

import { markAllNotificationsRead } from "@/actions/notification.actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function MarkAllReadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50 dark:border-dark-3 dark:text-dark-6 dark:hover:bg-dark-3"
    >
      {isPending ? "Marcando..." : "Marcar todo como leído"}
    </button>
  );
}
