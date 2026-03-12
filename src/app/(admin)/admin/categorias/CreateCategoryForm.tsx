"use client";

// Formulario de creación de categoría.
// Es cliente porque usa useActionState para mostrar feedback inmediato.

import { createCategory, type CategoryActionState } from "@/actions/category.actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

const initialState: CategoryActionState = null;

export function CreateCategoryForm() {
  const [state, formAction, isPending] = useActionState<CategoryActionState, FormData>(
    createCategory,
    initialState,
  );
  const router = useRouter();

  // Cuando el servidor confirma éxito, refrescamos la lista de categorías
  useEffect(() => {
    if (state?.success) {
      router.refresh(); // revalida los datos del Server Component padre
    }
  }, [state, router]);

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
      <h2 className="mb-4 text-base font-semibold text-dark dark:text-white">
        Nueva categoría
      </h2>

      <form action={formAction} className="space-y-4">
        {/* Mensaje de resultado (éxito o error) */}
        {state && (
          <div
            className={`rounded-lg p-3 text-sm ${
              state.success
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Nombre */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark dark:text-white">
              Nombre *
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Guías de Compra"
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark dark:text-white">
              Slug *
            </label>
            <input
              name="slug"
              type="text"
              required
              placeholder="guias-de-compra"
              pattern="[a-z0-9-]+"
              title="Solo letras minúsculas, números y guiones"
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark dark:text-white">
              Descripción
            </label>
            <input
              name="description"
              type="text"
              placeholder="Descripción breve (opcional)"
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark dark:text-white">
              Color (hex)
            </label>
            <div className="flex items-center gap-2">
              {/* input type="color" abre el selector de colores del navegador */}
              <input
                type="color"
                name="colorPicker"
                defaultValue="#E86C2C"
                className="h-9 w-10 cursor-pointer rounded border border-stroke"
                onChange={(e) => {
                  // Sincronizamos con el input de texto
                  const textInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                  if (textInput) textInput.value = e.currentTarget.value;
                }}
              />
              <input
                name="color"
                type="text"
                defaultValue="#E86C2C"
                placeholder="#E86C2C"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
          >
            {isPending ? "Creando..." : "Crear categoría"}
          </button>
        </div>
      </form>
    </div>
  );
}
