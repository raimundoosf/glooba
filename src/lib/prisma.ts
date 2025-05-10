/**
 * Prisma client configuration with singleton pattern.
 * @module prisma
 */
import { PrismaClient } from '@prisma/client';

/**
 * Creates a new Prisma client instance.
 * @returns {PrismaClient} A new Prisma client instance
 */
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

/**
 * Global Prisma client instance that uses singleton pattern.
 * Ensures only one instance of PrismaClient exists in development.
 * @type {PrismaClient}
 */
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
