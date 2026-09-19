import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

let prismaClientInstance: PrismaClient | null = null;

try {
  prismaClientInstance =
    global.__prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production' && prismaClientInstance) {
    global.__prisma = prismaClientInstance;
  }
} catch (error) {
  console.warn('[Prisma] Database client initialization bypassed (using built-in storage):', error);
  prismaClientInstance = null;
}

export const prisma = prismaClientInstance as PrismaClient;
export default prisma;

