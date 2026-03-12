// Página para crear un nuevo artículo — Server Component.
// Solo obtiene las categorías del servidor y las pasa al formulario cliente.

import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCategories } from "@/services/categories.service";
import Link from "next/link";

export const metadata = {
  title: "Nuevo artículo | Admin",
};

export default async function NuevoArticuloPage() {
  // Cargamos las categorías para el <select> del formulario
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* ── Encabezado con breadcrumb ──────────────────────────────────── */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/articulos" className="hover:text-primary">
            Artículos
          </Link>
          <span>/</span>
          <span className="text-dark dark:text-white">Nuevo artículo</span>
        </nav>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Nuevo artículo</h1>
      </div>

      {/*
        ArticleForm sin prop `post` → modo creación.
        Cuando se guarde, el Server Action hará redirect() a /admin/articulos.
      */}
      <ArticleForm categories={categories} />
    </div>
  );
}
