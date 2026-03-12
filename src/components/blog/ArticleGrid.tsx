import type { PostCard } from "@/services/posts.service";
import { ArticleCard } from "./ArticleCard";

type Props = {
  posts: PostCard[];
  emptyMessage?: string;
};

export function ArticleGrid({
  posts,
  emptyMessage = "No hay artículos disponibles todavía.",
}: Props) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </div>
  );
}
