import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { Pagination } from "@/components/blog/Pagination";
import { getCategories } from "@/services/categories.service";
import { getPopularPosts, getPosts, POSTS_PER_PAGE } from "@/services/posts.service";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Todos los artículos — Guvery Blog",
  description:
    "Explora todas las guías de compras internacionales, importaciones personales y cómo recibir productos de USA en Perú.",
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogListPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [{ posts, totalPages }, popularPosts, categories] = await Promise.all([
    getPosts({ page: currentPage, pageSize: POSTS_PER_PAGE }),
    getPopularPosts(5),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Todos los artículos
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Guías prácticas sobre importaciones personales y compras en USA.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Artículos + paginación */}
        <div className="lg:col-span-2">
          <ArticleGrid
            posts={posts}
            emptyMessage="No hay artículos publicados todavía."
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/blog"
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Categorías */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Categorías
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

          {/* Más leídos */}
          {popularPosts.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Más leídos
              </h2>
              <div className="space-y-4">
                {popularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex items-start gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-[#E86C2C] dark:bg-orange-900/20">
                      {post.views}
                    </div>
                    <p className="line-clamp-2 text-sm font-medium text-gray-700 transition-colors group-hover:text-[#E86C2C] dark:text-gray-300">
                      {post.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
