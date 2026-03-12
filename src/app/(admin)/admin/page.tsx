// Página principal del admin — Server Component.
// Reemplaza el dashboard de pagos/dispositivos del template
// con métricas reales del blog.

import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminPosts, getDashboardStats } from "@/services/posts.service";
import Link from "next/link";
import { OverviewCard } from "./_components/overview-cards/card";

// Íconos SVG simples para las tarjetas de métricas
function ArticlesIcon() {
  return (
    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ViewsIcon() {
  return (
    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SubscribersIcon() {
  return (
    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PublishedIcon() {
  return (
    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default async function AdminDashboard() {
  // Cargamos stats y últimos posts en paralelo para mayor velocidad
  const [stats, allPosts] = await Promise.all([
    getDashboardStats(),
    getAdminPosts(),
  ]);

  // Solo mostramos los 5 más recientes en la tabla del dashboard
  const recentPosts = allPosts.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Resumen del estado actual del blog</p>
      </div>

      {/* ── Tarjetas de métricas ─────────────────────────────────────────── */}
      {/*
        OverviewCard espera { value, growthRate } en data.
        growthRate: 0 significa "sin variación" — mostrará 0% neutral.
        En una versión futura se podría calcular comparando con el mes anterior.
      */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          label="Total Artículos"
          data={{ value: stats.totalPosts, growthRate: 0 }}
          Icon={ArticlesIcon}
        />
        <OverviewCard
          label="Publicados"
          data={{ value: stats.publishedPosts, growthRate: 0 }}
          Icon={PublishedIcon}
        />
        <OverviewCard
          label="Vistas Totales"
          data={{ value: stats.totalViews.toLocaleString("es"), growthRate: 0 }}
          Icon={ViewsIcon}
        />
        <OverviewCard
          label="Suscriptores"
          data={{ value: stats.confirmedSubscribers, growthRate: 0 }}
          Icon={SubscribersIcon}
        />
      </div>

      {/* ── Tabla de artículos recientes ─────────────────────────────────── */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-semibold text-dark dark:text-white">
            Artículos recientes
          </h2>
          <Link
            href="/admin/articulos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                  No hay artículos todavía.{" "}
                  <Link href="/admin/articulos/nuevo" className="text-primary hover:underline">
                    Crear el primero
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              recentPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      href={`/admin/articulos/${post.id}/editar`}
                      className="font-medium text-dark hover:text-primary dark:text-white"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-500">{post.category.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-right text-gray-500">
                    {post.views.toLocaleString("es")}
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
