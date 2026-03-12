// Página de suscriptores — Server Component.
// Filtra suscriptores por estado según ?status= en la URL.
// El link de CSV descarga un archivo desde la API protegida.

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import Link from "next/link";

export const metadata = {
  title: "Suscriptores | Admin",
};

// Los status válidos para el filtro — mismos valores que el enum del schema
const VALID_STATUSES = ["CONFIRMED", "PENDING", "UNSUBSCRIBED"] as const;
type FilterStatus = (typeof VALID_STATUSES)[number];

type Props = {
  searchParams: Promise<{ status?: string }>;
};

// Mapa de estado → etiqueta en español para la UI
const statusLabels: Record<FilterStatus, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendiente",
  UNSUBSCRIBED: "Desuscrito",
};

// Mapa de estado → clases de color (reutilizamos el mismo patrón que StatusBadge)
const statusColors: Record<FilterStatus, string> = {
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  UNSUBSCRIBED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default async function SuscriptoresPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;

  // Validamos el parámetro — solo aceptamos valores del enum
  // Si viene un valor desconocido, lo ignoramos y mostramos todos
  const statusFilter = VALID_STATUSES.includes(statusParam as FilterStatus)
    ? (statusParam as FilterStatus)
    : undefined;

  // Consulta con filtro opcional — si statusFilter es undefined, Prisma devuelve todos
  const [subscribers, totalByStatus] = await Promise.all([
    prisma.subscriber.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    // Conteo por estado para los tabs
    prisma.subscriber.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  // Convertimos el resultado de groupBy a un mapa { CONFIRMED: 2, PENDING: 1, ... }
  const countByStatus = Object.fromEntries(
    totalByStatus.map((g) => [g.status, g._count]),
  ) as Record<string, number>;

  const totalCount = Object.values(countByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Suscriptores</h1>
          <p className="mt-1 text-sm text-gray-500">
            {subscribers.length} de {totalCount} suscriptores
          </p>
        </div>

        {/*
          Enlace de descarga CSV.
          Apunta a la API Route protegida que verificará la sesión antes de responder.
          El navegador abrirá el archivo de descarga automáticamente.
        */}
        <a
          href="/api/admin/subscribers/export"
          className="inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar CSV
        </a>
      </div>

      {/* ── Tabs de filtro ───────────────────────────────────────────────── */}
      {/*
        Los tabs son simples links de Next.js que añaden ?status= a la URL.
        Al hacer clic, Next.js hace una nueva request al servidor con ese parámetro
        y la página se re-renderiza con los datos filtrados.
        No hay JavaScript necesario — es navegación pura del servidor.
      */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/suscriptores"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !statusFilter
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-400"
          }`}
        >
          Todos ({totalCount})
        </Link>

        {VALID_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/suscriptores?status=${s}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-400"
            }`}
          >
            {statusLabels[s]} ({countByStatus[s] ?? 0})
          </Link>
        ))}
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────── */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Fecha suscripción</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  No hay suscriptores{statusFilter ? ` con estado ${statusLabels[statusFilter]}` : ""}.
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-dark dark:text-white">
                    {sub.email}
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {sub.name ?? <span className="text-gray-400">—</span>}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[sub.status as FilterStatus] ?? ""
                      }`}
                    >
                      {statusLabels[sub.status as FilterStatus] ?? sub.status}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {sub.source ?? <span className="text-gray-400">—</span>}
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
