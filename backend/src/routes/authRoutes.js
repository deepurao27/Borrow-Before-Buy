import express from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  sendOtp,
  verifyOtp,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/verify', verifyEmail);
router.post('/resend-verification', authRateLimiter, resendVerification);
router.post('/login', authRateLimiter, login);
router.post('/otp/send', authRateLimiter, sendOtp);
router.post('/otp/verify', authRateLimiter, verifyOtp);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);
router.get('/me', requireAuth, getMe);

export default router;
