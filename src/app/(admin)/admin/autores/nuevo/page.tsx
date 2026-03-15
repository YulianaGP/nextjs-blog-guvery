"use client";

import { createAuthor, type AuthorActionState } from "@/actions/author.actions";
import Link from "next/link";
import { useActionState } from "react";

export default function NuevoAutorPage() {
  const [state, formAction, isPending] = useActionState<AuthorActionState, FormData>(
    createAuthor,
    null,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/autores" className="hover:text-primary">
            Autores
          </Link>
          <span>/</span>
          <span className="text-dark dark:text-white">Nuevo autor</span>
        </nav>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Nuevo autor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crea una cuenta de editor. El autor podrá crear y enviar artículos para tu revisión.
        </p>
      </div>

      {state && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-5 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Nombre completo *
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Ana García"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Email *
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="ana@ejemplo.com"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Contraseña temporal *
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500">
            El autor deberá cambiarla en su primer inicio de sesión.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Slug (URL pública)
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-3 dark:border-dark-3 dark:bg-dark-2">
            <span className="text-sm text-gray-500">/autor/</span>
            <input
              name="slug"
              type="text"
              placeholder="ana-garcia"
              className="flex-1 bg-transparent text-dark outline-none dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Opcional. Define la URL pública del perfil del autor.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Bio
          </label>
          <textarea
            name="bio"
            rows={3}
            placeholder="Breve descripción del autor visible en el blog..."
            className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
          >
            {isPending ? "Creando..." : "Crear autor"}
          </button>
          <Link
            href="/admin/autores"
            className="rounded-lg border border-stroke px-6 py-3 text-sm font-medium text-dark hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
