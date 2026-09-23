import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { csrfProtection } from './middleware/csrf.js';
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const createApp = () => {
  const app = express();

  // Trust reverse proxies (Render, Vercel, Cloudflare, etc.) for secure cookies & client IP
  app.set('trust proxy', 1);

  // Security Headers
  app.use(helmet());

  // CORS Configuration with Credentials
  const allowedOrigins = env.CLIENT_URL ? env.CLIENT_URL.split(',').map(s => s.trim()) : ['http://localhost:5173'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.vercel.app') ||
        !env.isProd
      ) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Body and Cookie Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // CSRF Defense on mutating requests
  app.use(csrfProtection);

  // Serve static public uploads in local mode
  if (env.UPLOAD_DRIVER === 'local') {
    app.use('/uploads', express.static(env.UPLOAD_DIR));
  }

  // API Routes
  app.use('/api', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/items', itemRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/disputes', disputeRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/admin', adminRoutes);



  // 404 Route Handler
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found.`
      }
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
