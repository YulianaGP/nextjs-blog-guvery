import { auth } from "@/lib/auth";
import { getCommentCount, getCommentsByPost } from "@/services/comments.service";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface Props {
  postId: string;
}

export async function CommentSection({ postId }: Props) {
  const [session, comments, totalCount] = await Promise.all([
    auth(),
    getCommentsByPost(postId),
    getCommentCount(postId),
  ]);

  return (
    <section className="mt-12 border-t border-gray-100 pt-10 dark:border-gray-700">
      <h2 className="mb-8 text-xl font-bold text-gray-900 dark:text-white">
        Comentarios{" "}
        {totalCount > 0 && (
          <span className="ml-1 text-base font-normal text-gray-400">
            ({totalCount})
          </span>
        )}
      </h2>

      {/* Formulario de nuevo comentario */}
      <div className="mb-10">
        <CommentForm postId={postId} session={session} />
      </div>

      {/* Lista de comentarios */}
      <CommentList
        initialComments={comments}
        totalCount={totalCount}
        postId={postId}
        session={session}
      />
    </section>
  );
}
