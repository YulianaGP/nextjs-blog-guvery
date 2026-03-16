import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  const headers = ["Email", "Nombre", "Estado", "Origen", "Confirmado el", "Registrado el"];

  function escapeCsv(value: string | null | undefined): string {
    if (value == null) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

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

  const csv = [headers.join(","), ...rows].join("\n");
  const csvWithBom = "\uFEFF" + csv;
  const today = new Date().toISOString().split("T")[0];

  return new Response(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="suscriptores-${today}.csv"`,
    },
  });
}
