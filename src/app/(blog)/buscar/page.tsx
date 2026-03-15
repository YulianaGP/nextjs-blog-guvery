import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { SearchBar } from "@/components/blog/SearchBar";
import { getCategories } from "@/services/categories.service";
import { searchPosts } from "@/services/posts.service";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

// Siempre SSR — la query varía por usuario
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q?.trim()) {
    return { title: "Buscar artículos — Guvery Blog" };
  }
  return {
    title: `Resultados para "${q}" — Guvery Blog`,
    description: `Artículos del Blog de Guvery relacionados con "${q}".`,
  };
}

// ── Componente interno que usa useSearchParams (necesita Suspense) ─────────────

async function SearchResults({ q }: { q: string }) {
  const results = await searchPosts(q);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-5xl">🔍</div>
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Sin resultados para &ldquo;{q}&rdquo;
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Intenta con otras palabras o explora nuestras categorías.
        </p>
        <Link
          href="/blog"
          className="rounded-lg bg-[#E86C2C] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ver todos los artículos
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {results.length} {results.length === 1 ? "resultado" : "resultados"} para{" "}
        <span className="font-semibold text-gray-900 dark:text-white">&ldquo;{q}&rdquo;</span>
      </p>
      <ArticleGrid posts={results} />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BuscarPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white">
          Buscar artículos
        </h1>
        <Suspense>
          <SearchBar defaultValue={query} placeholder="¿Qué quieres aprender hoy?" />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Resultados */}
        <div className="lg:col-span-2">
          {!query ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-5xl">🔍</div>
              <p className="text-gray-500 dark:text-gray-400">
                Escribe algo en el buscador para encontrar artículos.
              </p>
            </div>
          ) : (
            <SearchResults q={query} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Categorías */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Explorar por categoría
            </h2>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-[#E86C2C] dark:text-gray-400 dark:hover:bg-orange-900/20"
                  >
                    <span>{cat.name}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      {cat._count.posts}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Guvery */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              ¿Listo para comprar?
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Publica tu pedido en Guvery y un viajero te lo trae desde USA.
            </p>
            <a
              href="https://guvery.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-[#E86C2C] px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Publicar mi pedido →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
