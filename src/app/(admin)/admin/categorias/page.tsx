// Página de categorías — Server Component.
// Obtiene las categorías y las renderiza en una tabla.
// El formulario de creación es un Client Component separado (CreateCategoryForm).
// El botón de eliminar es un Client Component separado (DeleteCategoryButton).

import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoriesWithTotalCount } from "@/services/categories.service";
import { CreateCategoryForm } from "./CreateCategoryForm";

export const metadata = {
  title: "Categorías | Admin",
};

export default async function CategoriasPage() {
  const categories = await getCategoriesWithTotalCount();

  return (
    <div className="space-y-6">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Categorías</h1>
        <p className="mt-1 text-sm text-gray-500">{categories.length} categorías en total</p>
      </div>

      {/* ── Formulario de creación (Client Component) ────────────────────── */}
      {/*
        CreateCategoryForm es "use client" — puede usar useActionState.
        La tabla es Server Component — no necesita interactividad al cargar.
      */}
      <CreateCategoryForm />

      {/* ── Tabla de categorías ──────────────────────────────────────────── */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Artículos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  No hay categorías. Crea la primera usando el formulario de arriba.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-dark dark:text-white">
                    {cat.name}
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">{cat.slug}</TableCell>

                  {/* Muestra el color como un chip de color */}
                  <TableCell>
                    {cat.color ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-gray-500">{cat.color}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right text-sm text-gray-500">
                    {cat._count.posts}
                  </TableCell>

                  {/* Eliminar — Client Component con confirm() antes de borrar */}
                  <TableCell className="text-right">
                    {/*
                      Usamos DeleteCategoryButton (client) porque deleteCategory
                      retorna CategoryActionState en vez de void, y TypeScript
                      no permite eso directamente como prop action de un <form>.
                      El componente cliente muestra alert() si la categoría tiene posts
                      y confirm() antes de proceder al borrado.
                    */}
                    <DeleteCategoryButton
                      categoryId={cat.id}
                      categoryName={cat.name}
                      postsCount={cat._count.posts}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
