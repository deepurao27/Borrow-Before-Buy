import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { env } from './env.js';

export const prisma = new PrismaClient({
  log: env.isTest ? [] : ['error', 'warn']
});

prisma.$connect()
  .then(() => {
    if (!env.isTest) {
      logger.info('Connected to PostgreSQL Database via Prisma');
    }
  })
  .catch((err) => {
    if (!env.isTest) {
      logger.error({ err }, 'Prisma failed to connect to PostgreSQL');
    }
  });
