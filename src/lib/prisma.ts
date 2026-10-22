import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // If an external database URL is configured (e.g. Postgres, Supabase, Neon)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // SQLite resolution for local dev and Vercel serverless functions
  const prismaDirDb = path.join(process.cwd(), 'prisma', 'dev.db');
  const rootDirDb = path.join(process.cwd(), 'dev.db');

  if (fs.existsSync(prismaDirDb)) {
    return `file:${prismaDirDb}`;
  } else if (fs.existsSync(rootDirDb)) {
    return `file:${rootDirDb}`;
  }

  // Fallback for Vercel build time
  return `file:${prismaDirDb}`;
}

const resolvedDbUrl = getDatabaseUrl();

// Ensure process.env.DATABASE_URL is always populated so Prisma never throws missing env error
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolvedDbUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
