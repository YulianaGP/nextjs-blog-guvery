// Página para editar un artículo existente — Server Component.
// Lee el id de los params, busca el post en la BD, y pasa los datos al formulario.

import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCategories } from "@/services/categories.service";
import { getPostById } from "@/services/posts.service";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  // Next.js pasa los segmentos dinámicos de la URL como params.
  // En la ruta /admin/articulos/[id]/editar, el segmento [id] llega aquí.
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  return { title: post ? `Editar: ${post.title}` : "Artículo no encontrado" };
}

export default async function EditarArticuloPage({ params }: Props) {
  const { id } = await params;

  // Cargamos el post y las categorías en paralelo
  const [post, categories] = await Promise.all([
    getPostById(id),
    getCategories(),
  ]);

  // Si el post no existe, mostramos la página 404 de Next.js
  if (!post) notFound();

  // Adaptamos el post al tipo que espera ArticleForm
  const postForForm = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    featured: post.featured,
    coverImage: post.coverImage,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    categoryId: post.categoryId,
    tags: post.tags,
  };

  return (
    <div className="space-y-6">
      {/* ── Encabezado con breadcrumb ──────────────────────────────────── */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/articulos" className="hover:text-primary">
            Artículos
          </Link>
          <span>/</span>
          <span className="text-dark dark:text-white">Editar</span>
        </nav>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Editar artículo</h1>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{post.title}</p>
      </div>

      {/*
        ArticleForm con prop `post` → modo edición.
        El formulario usará updatePost.bind(null, post.id) internamente.
      */}
      <ArticleForm post={postForForm} categories={categories} />
    </div>
  );
}
