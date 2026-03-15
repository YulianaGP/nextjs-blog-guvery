"use client";

import { deleteComment, loadMoreComments } from "@/actions/comment.actions";
import type { CommentWithAuthor } from "@/services/comments.service";
import type { Session } from "next-auth";
import Image from "next/image";
import { useState, useTransition } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  initialComments: CommentWithAuthor[];
  totalCount: number;
  postId: string;
  session: Session | null;
}

export function CommentList({ initialComments, totalCount, postId, session }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hasMore = comments.length < totalCount;

  function handleLoadMore() {
    startTransition(async () => {
      const more = await loadMoreComments(postId, comments.length);
      setComments((prev) => [...prev, ...more]);
    });
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    const result = await deleteComment(commentId);
    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
    setDeletingId(null);
  }

  if (comments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Sé el primero en comentar.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => {
        const initials = (comment.user.name ?? "U")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const canDelete =
          session &&
          (session.user.id === comment.user.id || session.user.role === "ADMIN");

        return (
          <div key={comment.id} className="flex gap-3">
            {/* Avatar */}
            <div className="shrink-0">
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.name ?? "Usuario"}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-[#E86C2C] dark:bg-orange-900/20">
                  {initials}
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1">
              <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {comment.user.name ?? "Usuario"}
                    </span>
                    <time
                      dateTime={comment.createdAt.toISOString()}
                      title={dayjs(comment.createdAt).format("DD/MM/YYYY HH:mm")}
                      className="text-xs text-gray-400"
                    >
                      {dayjs(comment.createdAt).fromNow()}
                    </time>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      aria-label="Eliminar comentario"
                      className="text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Botón "Ver más" */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {isPending ? "Cargando…" : `Ver más comentarios (${totalCount - comments.length} restantes)`}
          </button>
        </div>
      )}
    </div>
  );
}
