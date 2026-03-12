// GET /api/admin/subscribers/export
// Devuelve un archivo CSV con todos los suscriptores.
// Protegido: solo usuarios con sesión activa (admin o editor) pueden acceder.

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  // ── Verificación de autenticación ────────────────────────────────────────
  // getServerSession lee la cookie de sesión de NextAuth desde los headers HTTP.
  // Si no hay sesión válida, devuelve null.
  const session = await getServerSession(authOptions);

  if (!session) {
    // 401 Unauthorized — el usuario no está autenticado
    return new Response(JSON.stringify({ error: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Obtener suscriptores ─────────────────────────────────────────────────
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      name: true,
      status: true,
      source: true,
      confirmedAt: true,
      createdAt: true,
    },
  });

  // ── Construir CSV ────────────────────────────────────────────────────────
  // La primera línea es el encabezado — define el nombre de cada columna.
  const headers = ["Email", "Nombre", "Estado", "Origen", "Confirmado el", "Registrado el"];

  // Función auxiliar: escapa comillas dobles dentro de un valor CSV.
  // Si un valor contiene comas o saltos de línea, lo envuelve en comillas.
  // Ejemplo: 'Juan "Pepe" García' → '"Juan ""Pepe"" García"'
  function escapeCsv(value: string | null | undefined): string {
    if (value == null) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // Convertimos cada suscriptor en una línea CSV
  const rows = subscribers.map((sub) =>
    [
      escapeCsv(sub.email),
      escapeCsv(sub.name),
      escapeCsv(sub.status),
      escapeCsv(sub.source),
      sub.confirmedAt
        ? new Date(sub.confirmedAt).toLocaleDateString("es-PE")
        : "",
      new Date(sub.createdAt).toLocaleDateString("es-PE"),
    ].join(","),
  );

  // Unimos encabezado + filas con salto de línea
  const csv = [headers.join(","), ...rows].join("\n");

  // ── Respuesta con headers de descarga ────────────────────────────────────
  // Content-Type: text/csv → indica al navegador que es un CSV
  // Content-Disposition: attachment → fuerza la descarga en vez de mostrar en pantalla
  // BOM (\uFEFF) al inicio → necesario para que Excel abra el CSV con caracteres UTF-8
  //   correctamente (acentos, eñes, etc.)
  const csvWithBom = "\uFEFF" + csv;

  const today = new Date().toISOString().split("T")[0]; // "2026-03-10"

  return new Response(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="suscriptores-${today}.csv"`,
    },
  });
}
