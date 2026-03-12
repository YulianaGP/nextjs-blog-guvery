"use client";

import {
  createPost,
  updatePost,
  type PostActionState,
} from "@/actions/post.actions";
import type { Category } from "@prisma/client";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { TiptapEditor } from "./TiptapEditor";

// Tipo del post que recibimos al editar (incluye tags y categoría)
type PostForEdit = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  featured: boolean;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: string;
  tags: { id: string; name: string }[];
};

type Props = {
  // Si viene post → modo edición. Si no viene → modo creación.
  post?: PostForEdit;
  categories: Category[];
};

// ── Helper: convertir título a slug ───────────────────────────────────────────
// Por ejemplo: "¿Cómo comprar en Amazon?" → "como-comprar-en-amazon"
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // descompone caracteres acentuados: é → e + ́
    .replace(/[\u0300-\u036f]/g, "") // elimina los diacríticos (acentos)
    .replace(/[^a-z0-9\s-]/g, "") // elimina caracteres no permitidos
    .trim()
    .replace(/\s+/g, "-") // reemplaza espacios por guiones
    .replace(/-+/g, "-"); // colapsa guiones dobles o triples
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ArticleForm({ post, categories }: Props) {
  const isEditing = !!post;

  // Cuando editamos, vinculamos updatePost con el id del post usando bind().
  // bind(null, post.id) crea una nueva función donde el primer argumento
  // (id) ya está fijado en post.id, y useActionState solo pasa prevState + formData.
  const action = isEditing
    ? updatePost.bind(null, post.id)
    : createPost;

  const [state, formAction, isPending] = useActionState<PostActionState, FormData>(
    action,
    null,
  );

  // Título y slug como estado local para poder sincronizarlos
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  // Controla si el slug fue editado manualmente (si es así, no auto-generamos)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  // Auto-generar slug desde el título (solo en modo creación o si no fue editado)
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(titleToSlug(title));
    }
  }, [title, slugManuallyEdited]);

  return (
    <form action={formAction} className="space-y-6">
      {/* ── Mensaje de error global ─────────────────────────────────────── */}
      {state && !state.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Columna principal (2/3) ──────────────────────────────────── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Título */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Título *
            </label>
            <input
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cómo comprar en Amazon desde Perú"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Slug (URL) *
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-3 dark:border-dark-3 dark:bg-dark-2">
              <span className="text-sm text-gray-500">/blog/</span>
              <input
                name="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="como-comprar-en-amazon"
                className="flex-1 bg-transparent text-dark outline-none dark:text-white"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Solo letras minúsculas, números y guiones. Se genera automáticamente del título.
            </p>
          </div>

          {/* Resumen */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Resumen (excerpt) *
            </label>
            <textarea
              name="excerpt"
              required
              rows={3}
              defaultValue={post?.excerpt}
              placeholder="Breve descripción del artículo para listados y SEO (máx. 160 caracteres)"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Editor Tiptap */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Contenido *
            </label>
            <TiptapEditor defaultValue={post?.content ?? ""} />
          </div>

          {/* SEO */}
          <details className="rounded-lg border border-stroke dark:border-dark-3">
            <summary className="cursor-pointer rounded-lg p-4 text-sm font-medium text-dark dark:text-white">
              SEO (opcional)
            </summary>
            <div className="space-y-4 p-4 pt-0">
              <div>
                <label className="mb-2 block text-xs font-medium text-dark dark:text-white">
                  Meta título
                </label>
                <input
                  name="metaTitle"
                  type="text"
                  defaultValue={post?.metaTitle ?? ""}
                  placeholder="Título alternativo para Google (recomendado: 50-60 caracteres)"
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-dark dark:text-white">
                  Meta descripción
                </label>
                <textarea
                  name="metaDescription"
                  rows={2}
                  defaultValue={post?.metaDescription ?? ""}
                  placeholder="Descripción para Google (recomendado: 120-160 caracteres)"
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                />
              </div>
            </div>
          </details>
        </div>

        {/* ── Sidebar de opciones (1/3) ────────────────────────────────── */}
        <div className="space-y-5">
          {/* Estado */}
          <div className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-3 text-sm font-semibold text-dark dark:text-white">Publicación</h3>
            <div>
              <label className="mb-2 block text-xs font-medium text-dark-6">Estado</label>
              <select
                name="status"
                defaultValue={post?.status ?? "DRAFT"}
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>

            {/* Destacado */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                defaultChecked={post?.featured ?? false}
                className="h-4 w-4 rounded border-stroke text-primary"
              />
              <label htmlFor="featured" className="text-sm text-dark dark:text-white">
                Artículo destacado
              </label>
            </div>
          </div>

          {/* Categoría */}
          <div className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-3 text-sm font-semibold text-dark dark:text-white">Categoría *</h3>
            <select
              name="categoryId"
              required
              defaultValue={post?.categoryId ?? ""}
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen de portada */}
          <div className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-3 text-sm font-semibold text-dark dark:text-white">
              Imagen de portada
            </h3>
            <input
              name="coverImage"
              type="url"
              defaultValue={post?.coverImage ?? ""}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">URL de la imagen (Cloudinary, etc.)</p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
            >
              {isPending && (
                // Spinner SVG animado — se muestra mientras el servidor procesa
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear artículo"}
            </button>

            <Link
              href="/admin/articulos"
              className="rounded-lg border border-stroke px-6 py-3 text-center text-sm font-medium text-dark transition-colors hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
