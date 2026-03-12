import type { PostCard } from "@/services/posts.service";
import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";

type Props = {
  post: PostCard;
  /** "default" — card vertical con excerpt | "compact" — solo título + meta */
  variant?: "default" | "compact";
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleCard({ post, variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <article className="flex gap-3">
        {/* Número decorativo */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-sm font-bold text-[#E86C2C] dark:bg-orange-900/20">
          {post.views}
        </div>
        <div className="min-w-0">
          <Link
            href={`/blog/${post.slug}`}
            className="line-clamp-2 text-sm font-semibold text-gray-800 hover:text-[#E86C2C] dark:text-gray-200"
          >
            {post.title}
          </Link>
          <p className="mt-0.5 text-xs text-gray-400">
            {formatDate(post.publishedAt)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Imagen o placeholder */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={
              post.category.color
                ? {
                    background: `linear-gradient(135deg, ${post.category.color}20, ${post.category.color}40)`,
                  }
                : undefined
            }
          >
            <span className="text-4xl font-black opacity-20 dark:opacity-10">
              G
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5">
        {/* Meta superior */}
        <div className="mb-3 flex items-center gap-2">
          <CategoryBadge
            name={post.category.name}
            slug={post.category.slug}
            color={post.category.color}
          />
          {post.readingTime && (
            <span className="text-xs text-gray-400">
              {post.readingTime} min
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#E86C2C] dark:text-white">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-500 dark:text-gray-400">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-700">
          <time className="text-xs text-gray-400">
            {formatDate(post.publishedAt)}
          </time>
          <Link
            href={`/blog/${post.slug}`}
            className="text-xs font-semibold text-[#E86C2C] hover:underline"
          >
            Leer más →
          </Link>
        </div>
      </div>
    </article>
  );
}
