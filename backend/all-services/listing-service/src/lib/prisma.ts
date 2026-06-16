import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __listingPrisma: PrismaClient | undefined
}

export const prisma: PrismaClient =
  global.__listingPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.__listingPrisma = prisma
}