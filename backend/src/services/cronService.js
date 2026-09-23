import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';
import { transitionTransaction } from './transactionStateMachine.js';

/**
 * Scan database for borrowed items whose due dates have passed
 */
export const checkOverdueTransactions = async () => {
  try {
    const overdueTransactions = await prisma.transaction.findMany({
      where: {
        status: 'BORROWED',
        dueAt: { lt: new Date() }
      },
      select: { id: true, dueAt: true, borrowerId: true, lenderId: true }
    });

    let count = 0;
    for (const tx of overdueTransactions) {
      try {
        await transitionTransaction(tx.id, 'MARK_OVERDUE', { id: 'SYSTEM', role: 'ADMIN' }, {
          note: `System flagged item overdue. Due date was ${tx.dueAt.toISOString()}`
        });
        count++;
      } catch (err) {
        logger.error({ transactionId: tx.id, err: err.message }, 'Failed to mark transaction overdue');
      }


    }

    if (count > 0) {
      logger.info({ overdueCount: count }, 'Overdue transactions sweep completed');
    }

    return { processed: overdueTransactions.length, updated: count };
  } catch (err) {
    logger.error({ err: err.message }, 'Error during overdue cron execution');
    return { error: err.message };
  }
};

/**
 * Initialize background cron jobs
 */
export const startCronJobs = () => {
  // Run every 10 minutes: '*/10 * * * *'
  cron.schedule('*/10 * * * *', async () => {
    logger.debug('Running scheduled overdue items sweep...');
    await checkOverdueTransactions();
  });

  logger.info('Background cron schedulers initialized');
};
