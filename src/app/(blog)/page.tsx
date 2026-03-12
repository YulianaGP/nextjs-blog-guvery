import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { NewsletterForm } from "@/components/blog/NewsletterForm";
import { getCategories } from "@/services/categories.service";
import {
  getFeaturedPosts,
  getPopularPosts,
  getPosts,
} from "@/services/posts.service";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600; // ISR — revalida cada hora

export const metadata: Metadata = {
  title: "Guvery Blog — Aprende a comprar en Amazon desde Perú",
  description:
    "Guías completas sobre cómo comprar en Amazon, eBay y tiendas de USA y recibir tus productos en Perú con Guvery.",
};

export default async function BlogHomePage() {
  // Todas las queries en paralelo para máximo performance
  const [{ posts: latestPosts }, featuredPosts, popularPosts, categories] =
    await Promise.all([
      getPosts({ page: 1, pageSize: 6 }),
      getFeaturedPosts(1),
      getPopularPosts(5),
      getCategories(),
    ]);

  const featuredPost = featuredPosts[0];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-[#E86C2C] dark:bg-orange-900/30">
              Blog de Guvery
            </span>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Aprende a comprar en{" "}
              <span className="text-[#E86C2C]">Amazon desde Perú</span>
            </h1>
            <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
              Guías prácticas sobre importaciones personales, compras en USA y
              cómo recibir tus productos en Perú sin complicaciones.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/blog"
                className="rounded-lg bg-[#E86C2C] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Ver todos los artículos
              </Link>
              <a
                href="https://guvery.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Conocer Guvery →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Post destacado ────────────────────────────────────────────────────── */}
      {featuredPost && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Artículo destacado
          </h2>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 md:flex-row"
          >
            <div
              className="flex h-48 items-center justify-center md:h-auto md:w-2/5"
              style={{
                background: featuredPost.category.color
                  ? `linear-gradient(135deg, ${featuredPost.category.color}25, ${featuredPost.category.color}10)`
                  : "linear-gradient(135deg, #FFF7F0, #FFEDE0)",
              }}
            >
              <span className="text-6xl font-black opacity-10 dark:opacity-5">
                G
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center p-8">
              <div className="mb-3 flex items-center gap-3">
                <CategoryBadge
                  name={featuredPost.category.name}
                  slug={featuredPost.category.slug}
                  color={featuredPost.category.color}
                  static
                />
                <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                  ★ Destacado
                </span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#E86C2C] dark:text-white">
                {featuredPost.title}
              </h3>
              <p className="mb-4 text-gray-500 dark:text-gray-400">
                {featuredPost.excerpt}
              </p>
              <span className="text-sm font-semibold text-[#E86C2C]">
                Leer artículo completo →
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ── Contenido principal ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Artículos */}
          <div className="lg:col-span-2">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
              Últimos artículos
            </h2>
            <ArticleGrid posts={latestPosts} />
            <div className="mt-8 text-center">
              <Link
                href="/blog"
                className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Ver todos los artículos
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Categorías con conteo real */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Categorías
              </h3>
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

            {/* Artículos populares */}
            {popularPosts.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Más leídos
                </h3>
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

            {/* Newsletter CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-[#E86C2C] to-orange-600 p-6 text-white">
              <h3 className="mb-2 text-lg font-bold">
                Recibe guías en tu correo
              </h3>
              <p className="mb-4 text-sm text-orange-100">
                Suscríbete y recibe nuevos artículos sobre compras
                internacionales cada semana.
              </p>
              <NewsletterForm source="blog-home" variant="sidebar" />
            </div>

            {/* CTA Guvery */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                ¿Listo para comprar?
              </h3>
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
      </section>
    </>
  );
}
