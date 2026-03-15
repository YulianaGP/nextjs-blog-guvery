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
  post?: PostForEdit;
  categories: Category[];
  role: "ADMIN" | "EDITOR";
};

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ArticleForm({ post, categories, role }: Props) {
  const isEditor = role === "EDITOR";
  const isEditing = !!post;

  const action = isEditing
    ? updatePost.bind(null, post.id)
    : createPost;

  const [state, formAction, isPending] = useActionState<PostActionState, FormData>(
    action,
    null,
  );

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(titleToSlug(title));
    }
  }, [title, slugManuallyEdited]);

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
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

          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Contenido *
            </label>
            <TiptapEditor defaultValue={post?.content ?? ""} />
          </div>

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

        <div className="space-y-5">
          <div className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-3 text-sm font-semibold text-dark dark:text-white">Publicación</h3>

            {isEditor ? (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-dark-6">Estado actual</label>
                <p className="text-sm font-medium text-dark dark:text-white">
                  {post?.status === "REVIEW"
                    ? "En revisión — esperando aprobación"
                    : "Borrador"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Usa los botones de abajo para guardar o enviar al admin.
                </p>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-xs font-medium text-dark-6">Estado</label>
                <select
                  name="status"
                  defaultValue={post?.status ?? "DRAFT"}
                  className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="REVIEW">En revisión</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </div>
            )}

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

          <div className="flex flex-col gap-3">
            {isEditor ? (
              <>
                <button
                  type="submit"
                  name="status"
                  value="DRAFT"
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 rounded-lg border border-stroke px-6 py-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-70 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  {isPending ? "Guardando..." : "Guardar borrador"}
                </button>
                <button
                  type="submit"
                  name="status"
                  value="REVIEW"
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
                >
                  {isPending ? "Enviando..." : "Enviar a revisión →"}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
              >
                {isPending && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear artículo"}
              </button>
            )}

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
