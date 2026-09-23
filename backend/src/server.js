import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { startCronJobs } from './services/cronService.js';
import http from 'http';


const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info(`Borrow Before Buy API Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
  startCronJobs();
});


// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
