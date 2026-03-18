import { auth } from "@/lib/auth";
import { SearchBar } from "@/components/blog/SearchBar";
import { ThemeToggleSwitch } from "@/components/Layouts/header/theme-toggle";
import { BlogUserMenu } from "@/components/blog/BlogUserMenu";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { Suspense } from "react";

export default async function BlogLayout({ children }: PropsWithChildren) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Guvery{" "}
              <span className="text-[#E86C2C]">Blog</span>
            </span>
          </Link>

          {/* Buscador compacto */}
          <div className="hidden flex-1 max-w-xs sm:block">
            <Suspense>
              <SearchBar placeholder="Buscar artículos…" />
            </Suspense>
          </div>

          {/* Theme toggle */}
          <ThemeToggleSwitch />

          {/* Auth — menú de usuario o botón de login */}
          <BlogUserMenu session={session} />

          {/* CTA */}
          <a
            href="https://guvery.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 rounded-lg bg-[#E86C2C] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:block"
          >
            Usar Guvery
          </a>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Brand */}
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Guvery <span className="text-[#E86C2C]">Blog</span>
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Guías y consejos para comprar productos de USA y traerlos a
                Perú.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Categorías
              </p>
              <ul className="space-y-2">
                {[
                  { label: "Guías de Compra", href: "/categoria/guias-de-compra" },
                  { label: "Amazon desde Perú", href: "/categoria/amazon" },
                  { label: "Electrónica", href: "/categoria/electronica" },
                  { label: "Ropa y Moda", href: "/categoria/ropa" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter mini CTA */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Newsletter
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recibe nuevas guías sobre compras internacionales directamente
                en tu correo.
              </p>
              <a
                href="https://guvery.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg bg-[#E86C2C] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Suscribirme
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
            <p className="text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Guvery. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
