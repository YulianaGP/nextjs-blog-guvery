import { DeleteAuthorButton } from "@/components/admin/DeleteAuthorButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Autores | Admin" };

export default async function AutoresPage() {
  const authors = await prisma.user.findMany({
    where: { role: "EDITOR" },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      bio: true,
      image: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Autores</h1>
          <p className="mt-1 text-sm text-gray-500">{authors.length} autores registrados</p>
        </div>
        <Link
          href="/admin/autores/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          + Nuevo autor
        </Link>
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        {authors.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No hay autores todavía.{" "}
            <Link href="/admin/autores/nuevo" className="text-primary hover:underline">
              Crear el primero
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-stroke dark:divide-dark-3">
            {authors.map((author) => (
              <li key={author.id} className="flex items-center gap-4 px-6 py-4">
                {/* Avatar inicial */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {author.name?.charAt(0).toUpperCase() ?? "?"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-dark dark:text-white">{author.name}</p>
                  <p className="text-sm text-gray-500">{author.email}</p>
                  {author.bio && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">{author.bio}</p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {author._count.posts} artículo{author._count.posts !== 1 ? "s" : ""}
                  </p>
                  {author.slug && (
                    <p className="text-xs text-gray-400">/autor/{author.slug}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {author.slug && (
                    <Link
                      href={`/autor/${author.slug}`}
                      target="_blank"
                      className="rounded px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      Ver →
                    </Link>
                  )}
                  <DeleteAuthorButton authorId={author.id} authorName={author.name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
