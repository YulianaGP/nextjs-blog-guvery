import sanitizeHtml from "sanitize-html";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { CommentSection } from "@/components/blog/CommentSection";
import { NewsletterForm } from "@/components/blog/NewsletterForm";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ViewIncrementer } from "@/components/blog/ViewIncrementer";
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  JsonLd,
} from "@/components/seo/JsonLd";
import {
  getAllPublishedSlugs,
  getPopularPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/services/posts.service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// ── SSG + ISR ─────────────────────────────────────────────────────────────────

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

// ── Metadata dinámica ─────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Artículo no encontrado — Guvery Blog" };

  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const ogImage = post.ogImage ?? post.coverImage ?? undefined;

  return {
    title: post.metaTitle ?? `${post.title} — Guvery Blog`,
    description,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle ?? post.title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [relatedPosts, popularPosts] = await Promise.all([
    getRelatedPosts(post.id, post.categoryId, 3),
    getPopularPosts(5),
  ]);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://blog.guvery.com";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <>
      {/* JSON-LD structured data */}
      <JsonLd data={buildBlogPostingSchema(post, postUrl)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Inicio", url: baseUrl },
          { name: "Blog", url: `${baseUrl}/blog` },
          { name: post.category.name, url: `${baseUrl}/categoria/${post.category.slug}` },
          { name: post.title, url: postUrl },
        ])}
      />

      {/* Contador de vistas — cliente invisible */}
      <ViewIncrementer slug={post.slug} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* ── Columna principal ──────────────────────────────────────────── */}
          <article className="lg:col-span-2">
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
              <Link
                href={`/categoria/${post.category.slug}`}
                className="hover:text-[#E86C2C]"
              >
                {post.category.name}
              </Link>
              <span>/</span>
              <span className="line-clamp-1 text-gray-400">{post.title}</span>
            </nav>

            {/* Categoría + meta */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <CategoryBadge
                name={post.category.name}
                slug={post.category.slug}
                color={post.category.color}
              />
              {post.readingTime && (
                <span className="text-sm text-gray-400">
                  {post.readingTime} min de lectura
                </span>
              )}
              <span className="text-sm text-gray-400">
                {post.views.toLocaleString("es-PE")} vistas
              </span>
            </div>

            {/* Título */}
            <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-4xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mb-6 text-lg text-gray-500 dark:text-gray-400">
                {post.excerpt}
              </p>
            )}

            {/* Meta: autor + fechas */}
            <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {post.author?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.image}
                    alt={post.author.name ?? "Autor"}
                    className="h-9 w-9 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#E86C2C] dark:bg-orange-900/20">
                    {(post.author?.name ?? "G")[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {post.author?.name ?? "Equipo Guvery"}
                </span>
              </div>

              {post.publishedAt && (
                <time
                  dateTime={post.publishedAt.toISOString()}
                  className="text-sm text-gray-400"
                >
                  Publicado: {formatDate(post.publishedAt)}
                </time>
              )}

              {post.updatedAt &&
                post.publishedAt &&
                post.updatedAt > post.publishedAt && (
                  <time
                    dateTime={post.updatedAt.toISOString()}
                    className="text-sm text-gray-400"
                  >
                    Actualizado: {formatDate(post.updatedAt)}
                  </time>
                )}
            </div>

            {/* Cover image */}
            {post.coverImage && (
              <div className="mb-8 overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Contenido HTML — renderizado con @tailwindcss/typography */}
            {post.content ? (
              <div
                id="article-content"
                className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-[#E86C2C] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(post.content, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "iframe"]),
                    allowedAttributes: {
                      ...sanitizeHtml.defaults.allowedAttributes,
                      img: ["src", "alt", "title", "width", "height", "loading"],
                      iframe: ["src", "width", "height", "allowfullscreen", "frameborder"],
                      "*": ["class", "id"],
                    },
                    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
                  }),
                }}
              />
            ) : (
              <p className="text-gray-400 italic">
                El contenido de este artículo no está disponible.
              </p>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-100 pt-6 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Etiquetas:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Compartir */}
            <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-700">
              <ShareButtons title={post.title} url={postUrl} />
            </div>

            {/* Comentarios */}
            <CommentSection postId={post.id} />

            {/* Artículos relacionados */}
            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                  Artículos relacionados
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((related) => (
                    <ArticleCard key={related.id} post={related} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <aside className="space-y-8">
            {/* Tabla de contenidos — extrae h2/h3 del artículo */}
            <TableOfContents />

            {/* Más leídos */}
            {popularPosts.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Más leídos
                </h2>
                <div className="space-y-4">
                  {popularPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/blog/${p.slug}`}
                      className="group flex items-start gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-[#E86C2C] dark:bg-orange-900/20">
                        {p.views}
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-gray-700 transition-colors group-hover:text-[#E86C2C] dark:text-gray-300">
                        {p.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Newsletter */}
            <div className="rounded-2xl bg-gradient-to-br from-[#E86C2C] to-orange-600 p-6 text-white">
              <h2 className="mb-2 text-lg font-bold">
                Recibe guías en tu correo
              </h2>
              <p className="mb-4 text-sm text-orange-100">
                Suscríbete y recibe nuevos artículos sobre compras
                internacionales cada semana.
              </p>
              <NewsletterForm source="post-inline" variant="sidebar" />
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
    </>
  );
}
