/**
 * Prisma Client Singleton
 * 
 * This file creates a singleton instance of PrismaClient to avoid creating
 * multiple instances in development (which can cause connection pool exhaustion).
 * 
 * In production, a single instance is created and reused.
 * In development, the instance is attached to the global object to persist
 * across hot module reloads.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
