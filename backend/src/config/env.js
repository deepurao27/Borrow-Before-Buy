import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback_dev_access_secret_123',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_dev_refresh_secret_456',
  HANDOVER_TOKEN_SECRET: process.env.HANDOVER_TOKEN_SECRET || 'fallback_dev_handover_secret_789',
  COLLEGE_EMAIL_DOMAIN: (process.env.COLLEGE_EMAIL_DOMAIN || 'iet.edu').toLowerCase(),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '1025', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Borrow Before Buy <noreply@iet.edu>',
  UPLOAD_DRIVER: process.env.UPLOAD_DRIVER || 'local',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION || 'auto',
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
