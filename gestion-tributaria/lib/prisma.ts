// Forzamos a Next.js a que este archivo NUNCA se ejecute en el cliente (navegador)
import "server-only";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaOptions: Prisma.PrismaClientOptions = process.env.DATABASE_URL
  ? ({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) } as Prisma.PrismaClientOptions)
  : {} as Prisma.PrismaClientOptions;

export const db = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;