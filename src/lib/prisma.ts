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

  const isServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
  );

  const candidateSources = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db'),
    path.resolve('./prisma/dev.db'),
    path.resolve('./dev.db'),
    path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
    path.join(__dirname, '..', '..', 'dev.db'),
    '/var/task/prisma/dev.db',
    '/var/task/dev.db',
  ];

  let sourceDb: string | null = null;
  for (const src of candidateSources) {
    try {
      if (fs.existsSync(src)) {
        sourceDb = src;
        break;
      }
    } catch {
      // ignore
    }
  }

  if (isServerless) {
    const tmpDbPath = '/tmp/dev.db';
    if (sourceDb) {
      try {
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(sourceDb, tmpDbPath);
        }
        return `file:${tmpDbPath}`;
      } catch (err) {
        console.error('Failed copying SQLite database to /tmp:', err);
      }
    }
    return `file:${tmpDbPath}`;
  }

  if (sourceDb) {
    return `file:${sourceDb}`;
  }

  return `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
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
