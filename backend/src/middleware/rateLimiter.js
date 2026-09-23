import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants.js';
import { sendError } from '../utils/response.js';

export const authRateLimiter = rateLimit({
  windowMs: CONSTANTS.AUTH_RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(CONSTANTS.AUTH_RATE_LIMIT_WINDOW_MS / 1000 / 60);
    return sendError(
      res,
      'RATE_LIMITED',
      `Too many attempts from this IP. Please try again after ${retryAfter} minutes.`,
      429
    );
  }
});

export const generalRateLimiter = rateLimit({
  windowMs: CONSTANTS.GENERAL_RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.GENERAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 'RATE_LIMITED', 'Too many requests. Please slow down.', 429);
  }
});
