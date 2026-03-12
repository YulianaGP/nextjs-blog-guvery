"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Inner component that uses useSearchParams — must be wrapped in Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@guvery.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E86C2C] focus:outline-none focus:ring-2 focus:ring-[#E86C2C]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E86C2C] focus:outline-none focus:ring-2 focus:ring-[#E86C2C]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#E86C2C] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar al panel"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Guvery <span className="text-[#E86C2C]">Blog</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Card — Suspense required by useSearchParams */}
        <Suspense
          fallback={
            <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
              <div className="h-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-gray-400">
          <Link
            href="/"
            className="hover:text-gray-600 hover:underline dark:hover:text-gray-300"
          >
            ← Volver al blog
          </Link>
        </p>
      </div>
    </div>
  );
}
