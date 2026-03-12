"use client";

import {
  subscribeAction,
  type NewsletterActionState,
} from "@/actions/newsletter.actions";
import { useActionState } from "react";

type Props = {
  /** Identifica el origen del suscriptor en la DB (HU tracking) */
  source?: string;
  /** Variante visual: "sidebar" (naranja) | "inline" (blanco con borde) */
  variant?: "sidebar" | "inline";
};

const initialState: NewsletterActionState = null;

export function NewsletterForm({ source = "blog", variant = "sidebar" }: Props) {
  const [state, formAction, isPending] = useActionState(
    subscribeAction,
    initialState,
  );

  const isSidebar = variant === "sidebar";

  // Clases base según variante
  const inputClass = isSidebar
    ? "w-full rounded-lg border border-orange-400 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50"
    : "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E86C2C]/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400";

  const buttonClass = isSidebar
    ? "w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#E86C2C] transition-opacity hover:opacity-90 disabled:opacity-60"
    : "w-full rounded-lg bg-[#E86C2C] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60";

  const labelClass = isSidebar
    ? "text-orange-100"
    : "text-gray-500 dark:text-gray-400";

  // Si fue exitoso, mostrar mensaje de confirmación
  if (state?.success) {
    return (
      <div
        className={`rounded-xl p-4 text-center ${
          isSidebar
            ? "bg-white/20 text-white"
            : "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
        }`}
      >
        <svg
          className={`mx-auto mb-2 h-8 w-8 ${isSidebar ? "text-white" : "text-green-500"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-semibold">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {/* Hidden source input */}
      <input type="hidden" name="source" value={source} />

      <input
        type="email"
        name="email"
        placeholder="tu@correo.com"
        required
        disabled={isPending}
        className={inputClass}
      />

      {/* Error message */}
      {state && !state.success && (
        <p
          className={`text-xs ${
            isSidebar ? "text-orange-100" : "text-red-500 dark:text-red-400"
          }`}
        >
          {state.message}
        </p>
      )}

      <button type="submit" disabled={isPending} className={buttonClass}>
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Enviando…
          </span>
        ) : (
          "Suscribirme gratis"
        )}
      </button>

      <p className={`text-center text-xs ${labelClass}`}>
        Sin spam. Cancela cuando quieras.
      </p>
    </form>
  );
}
