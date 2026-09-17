import { PrismaClient } from '@prisma/client';

// Pola Singleton untuk Prisma Client:
// Mencegah pembuatan instance koneksi database berlebih saat hot-reloading di mode development.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
