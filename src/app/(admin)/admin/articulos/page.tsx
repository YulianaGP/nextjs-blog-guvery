// Lista de artículos del admin — Server Component.
// Muestra todos los posts sin importar su estado (DRAFT, PUBLISHED, ARCHIVED).

import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/blog/Pagination";
import { authOptions } from "@/lib/auth";
import {
  getAdminPostsPaginated,
  ADMIN_POSTS_PER_PAGE,
} from "@/services/posts.service";
import { getServerSession } from "next-auth";
import Link from "next/link";

export const metadata = {
  title: "Artículos | Admin",
};

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function ArticulosPage({ searchParams }: Props) {
  const { q = "", page: pageParam = "1" } = await searchParams;
  const query = q.trim();
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const { posts, total, totalPages, currentPage } =
    await getAdminPostsPaginated({
      page,
      pageSize: ADMIN_POSTS_PER_PAGE,
      q: query || undefined,
      authorId: isAdmin ? undefined : (session?.user?.id ?? ""),
    });

  const extraParams = query ? { q: query } : undefined;

  return (
    <div className="space-y-6">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Artículos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {query
              ? `${total} resultado${total !== 1 ? "s" : ""} para "${q}"`
              : `${total} artículos en total`}
          </p>
        </div>

        {/* Botón para crear un nuevo artículo */}
        <Link
          href="/admin/articulos/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <span>+ Nuevo artículo</span>
        </Link>
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────── */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Título</TableHead>
              <TableHead>Categoría</TableHead>
              {isAdmin && <TableHead>Autor</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                  No hay artículos todavía.{" "}
                  <Link href="/admin/articulos/nuevo" className="text-primary hover:underline">
                    Crear el primero
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  {/* Título — link al editor */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/admin/articulos/${post.id}/editar`}
                        className="font-medium text-dark hover:text-primary dark:text-white"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-400">/blog/{post.slug}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {post.category.name}
                  </TableCell>

                  {isAdmin && (
                    <TableCell className="text-sm text-gray-500">
                      {post.author?.name ?? "—"}
                    </TableCell>
                  )}

                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>

                  <TableCell className="text-right text-sm text-gray-500">
                    {post.views.toLocaleString("es")}
                  </TableCell>

                  {/* Fecha de última modificación */}
                  <TableCell className="text-sm text-gray-500">
                    {new Date(post.updatedAt).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Botones de acción */}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* Editar */}
                      <Link
                        href={`/admin/articulos/${post.id}/editar`}
                        className="rounded px-3 py-1.5 text-xs font-medium text-dark transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2"
                      >
                        Editar
                      </Link>

                      {/* Ver en blog (solo si está publicado) */}
                      {post.status === "PUBLISHED" && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="rounded px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                          Ver →
                        </Link>
                      )}

                      {/* Eliminar — componente cliente por el confirm() */}
                      <DeletePostButton postId={post.id} postTitle={post.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ── Paginación ── */}
        <div className="border-t border-gray-100 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/admin/articulos"
            extraParams={extraParams}
          />
        </div>
      </div>
    </div>
  );
}
