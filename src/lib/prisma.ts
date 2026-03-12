import { PrismaClient } from "@prisma/client";

declare global {
  // Extiende el globalThis para TypeScript
  // Permite acceder a globalThis.prisma sin errores de tipo
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

// Solo en desarrollo guardamos la instancia en global para hot-reload
if (process.env.NODE_ENV === "development") globalThis.prisma = prisma;
