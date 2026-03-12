import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirmación de suscripción — Guvery Blog",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function ConfirmacionPage({ searchParams }: Props) {
  const { success, error } = await searchParams;

  const isSuccess = success === "1";
  const isInvalid = error === "invalid";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {isSuccess ? (
          <>
            {/* Éxito */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-10 w-10 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-3 text-2xl font-extrabold text-gray-900 dark:text-white">
              ¡Suscripción confirmada!
            </h1>
            <p className="mb-8 text-gray-500 dark:text-gray-400">
              Ya estás en la lista. Recibirás nuestras guías sobre compras
              internacionales directamente en tu correo.
            </p>
          </>
        ) : isInvalid ? (
          <>
            {/* Token inválido */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-10 w-10 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mb-3 text-2xl font-extrabold text-gray-900 dark:text-white">
              Enlace inválido o expirado
            </h1>
            <p className="mb-8 text-gray-500 dark:text-gray-400">
              El enlace de confirmación no es válido o ya fue utilizado.
              Intenta suscribirte de nuevo.
            </p>
          </>
        ) : (
          <>
            {/* Estado desconocido */}
            <h1 className="mb-3 text-2xl font-extrabold text-gray-900 dark:text-white">
              Algo salió mal
            </h1>
            <p className="mb-8 text-gray-500 dark:text-gray-400">
              No pudimos procesar tu solicitud. Por favor, inténtalo de nuevo.
            </p>
          </>
        )}

        <Link
          href="/"
          className="inline-block rounded-lg bg-[#E86C2C] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          ← Volver al blog
        </Link>
      </div>
    </div>
  );
}
