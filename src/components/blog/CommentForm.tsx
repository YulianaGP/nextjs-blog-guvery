"use client";

import { createComment } from "@/actions/comment.actions";
import { COMMENT_MAX_LENGTH } from "@/lib/constants";
import type { Session } from "next-auth";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRef, useState } from "react";

const MAX_LENGTH = COMMENT_MAX_LENGTH;

interface Props {
  postId: string;
  session: Session | null;
}

export function CommentForm({ postId, session }: Props) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sin sesión — mostrar banner de login
  if (!session) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Inicia sesión para dejar un comentario
        </p>
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar con Google
        </button>
      </div>
    );
  }

  const user = session.user;
  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const remaining = MAX_LENGTH - content.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 10) return;
    setStatus("sending");
    setErrorMsg("");

    const result = await createComment(postId, content);
    if (result.success) {
      setStatus("success");
      setContent("");
      textareaRef.current?.focus();
      // Volver a idle tras 3s
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setErrorMsg(result.error ?? "Error al publicar el comentario.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {/* Avatar del usuario */}
      <div className="shrink-0">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Usuario"}
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

      <div className="flex-1">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value.slice(0, MAX_LENGTH));
              if (status === "error") setStatus("idle");
            }}
            placeholder="Escribe tu comentario…"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-[#E86C2C] focus:outline-none focus:ring-1 focus:ring-[#E86C2C] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-[#E86C2C]"
          />
          <span
            className={`absolute bottom-2 right-3 text-xs ${
              remaining < 50 ? "text-red-400" : "text-gray-400"
            }`}
          >
            {remaining}
          </span>
        </div>

        {/* Feedback */}
        {status === "error" && (
          <p className="mt-1 text-xs text-red-500">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            Comentario publicado.
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Comentando como{" "}
            <span className="font-medium text-gray-600 dark:text-gray-300">
              {user.name ?? user.email}
            </span>
          </span>
          <button
            type="submit"
            disabled={status === "sending" || content.trim().length < 10}
            className="rounded-lg bg-[#E86C2C] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "sending" ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>
    </form>
  );
}
