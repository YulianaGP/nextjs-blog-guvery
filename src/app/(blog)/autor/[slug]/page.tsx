import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const author = await prisma.user.findUnique({
    where: { slug },
    select: { name: true, bio: true },
  });
  if (!author) return {};
  return {
    title: `${author.name} | Autores`,
    description: author.bio ?? `Artículos escritos por ${author.name}`,
  };
}

export default async function AutorPage({ params }: Props) {
  const { slug } = await params;

  const author = await prisma.user.findUnique({
    where: { slug },
    select: { id: true, name: true, image: true, bio: true },
  });

  if (!author) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: author.id, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      readingTime: true,
      category: { select: { name: true, slug: true, color: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Perfil del autor ── */}
      <div className="mb-12 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        {author.image ? (
          <Image
            src={author.image}
            alt={author.name ?? "Autor"}
            width={96}
            height={96}
            className="size-24 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#E86C2C]/10 text-3xl font-bold text-[#E86C2C]">
            {author.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{author.name}</h1>
          {author.bio && (
            <p className="mt-2 max-w-xl text-gray-500 dark:text-gray-400">{author.bio}</p>
          )}
          <p className="mt-2 text-sm text-gray-400">
            {posts.length} artículo{posts.length !== 1 ? "s" : ""} publicado{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Lista de artículos ── */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400">Este autor no tiene artículos publicados aún.</p>
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Artículos</h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {posts.map((post) => (
              <li key={post.id} className="py-5">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="flex items-start gap-4">
                    {post.coverImage && (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        width={80}
                        height={80}
                        className="size-20 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {post.category && (
                        <Link
                          href={`/categoria/${post.category.slug}`}
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: post.category.color ?? "#E86C2C" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {post.category.name}
                        </Link>
                      )}
                      <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-[#E86C2C] dark:text-white">
                        {post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {post.excerpt}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                        {post.publishedAt && (
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString("es-PE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        {post.readingTime && <span>{post.readingTime} min de lectura</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
