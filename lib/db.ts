import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Helper function to handle database errors
export function handleDbError(error: any): { message: string; code: string } {
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field'
    return {
      message: `A record with this ${field} already exists`,
      code: 'DUPLICATE_ENTRY'
    }
  }
  
  if (error.code === 'P2025') {
    return {
      message: 'Record not found',
      code: 'NOT_FOUND'
    }
  }
  
  if (error.code === 'P2003') {
    return {
      message: 'Invalid reference: related record does not exist',
      code: 'INVALID_REFERENCE'
    }
  }
  
  return {
    message: 'An unexpected database error occurred',
    code: 'DATABASE_ERROR'
  }
}
