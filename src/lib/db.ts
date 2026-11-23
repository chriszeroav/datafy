import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Cada PrismaClient abre su propio pool de conexiones. En desarrollo Next
// recarga el codigo en caliente y crearia uno nuevo en cada recarga hasta
// agotar las conexiones de Postgres, por eso se reutiliza desde globalThis.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

// En produccion el proceso es uno solo y no hay recargas, asi que no hace falta.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
