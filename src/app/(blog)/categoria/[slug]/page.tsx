import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { Pagination } from "@/components/blog/Pagination";
import { getCategoryBySlug, getCategories } from "@/services/categories.service";
import { getPosts, POSTS_PER_PAGE } from "@/services/posts.service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// ── generateStaticParams ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

// ── Metadata dinámica ─────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Categoría no encontrada — Guvery Blog" };

  return {
    title: `${category.name} — Guvery Blog`,
    description: `Artículos sobre ${category.name.toLowerCase()} para comprar desde Perú con Guvery.`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { page: pageParam }] = await Promise.all([
    params,
    searchParams,
  ]);

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [category, { posts, totalPages }, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getPosts({ page: currentPage, pageSize: POSTS_PER_PAGE, categorySlug: slug }),
    getCategories(),
  ]);

  if (!category) notFound();

  const basePath = `/categoria/${slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-[#E86C2C]">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-[#E86C2C]">
          Blog
        </Link>
        <span>/</span>
        <span className="text-gray-400">{category.name}</span>
      </nav>

      {/* Encabezado de categoría */}
      <div className="mb-10 flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white"
          style={{
            background: category.color
              ? `linear-gradient(135deg, ${category.color}, ${category.color}cc)`
              : "linear-gradient(135deg, #E86C2C, #f08040)",
          }}
        >
          {category.name[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            <CategoryBadge
              name={`${category._count.posts} artículos`}
              slug={slug}
              color={category.color}
              static
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Guías y consejos sobre {category.name.toLowerCase()} para comprar
            desde Perú.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Artículos + paginación */}
        <div className="lg:col-span-2">
          <ArticleGrid
            posts={posts}
            emptyMessage={`No hay artículos en la categoría "${category.name}" todavía.`}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>

        {/* Sidebar — todas las categorías */}
        <aside className="space-y-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Todas las categorías
            </h2>
            <ul className="space-y-1">
              {allCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      cat.slug === slug
                        ? "bg-orange-50 font-semibold text-[#E86C2C] dark:bg-orange-900/20"
                        : "text-gray-600 hover:bg-orange-50 hover:text-[#E86C2C] dark:text-gray-400 dark:hover:bg-orange-900/20"
                    }`}
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
