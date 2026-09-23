import {
  registerUser,
  verifyEmailToken,
  resendVerificationToken,
  loginUser,
  refreshSession,
  logoutUser,
  requestPasswordReset,
  resetPasswordWithToken,
  sendLoginOtp,
  verifyLoginOtp
} from '../services/authService.js';
import {
  registerSchema,
  loginSchema,
  verifySchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema
} from '../validators/authValidators.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CONSTANTS } from '../config/constants.js';
import { getCookieOptions } from '../utils/tokens.js';
import { prisma } from '../config/prisma.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await registerUser(validatedData);

    // Set httpOnly Cookies so user is immediately logged in & activated
    if (result.accessToken && result.refreshToken) {
      res.cookie(CONSTANTS.ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(false));
      res.cookie(CONSTANTS.REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(true));
    }

    return sendSuccess(
      res,
      result,
      'Registration successful! Your account is activated and ready to use.',
      201
    );
  } catch (err) {
    return next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const validatedData = verifySchema.parse(req.body);
    const result = await verifyEmailToken(validatedData);
    return sendSuccess(res, null, result.message);
  } catch (err) {
    return next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const validatedData = resendVerificationSchema.parse(req.body);
    const result = await resendVerificationToken(validatedData);
    return sendSuccess(res, null, result.message);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);

    // Set httpOnly Cookies
    res.cookie(CONSTANTS.ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(false));
    res.cookie(CONSTANTS.REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(true));

    return sendSuccess(
      res,
      { user: result.user },
      'Logged in successfully!'
    );
  } catch (err) {
    return next(err);
  }
};

export const sendOtp = async (req, res, next) => {
  try {
    const validatedData = sendOtpSchema.parse(req.body);
    const result = await sendLoginOtp(validatedData);
    return sendSuccess(res, result, result.message);
  } catch (err) {
    return next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const validatedData = verifyOtpSchema.parse(req.body);
    const result = await verifyLoginOtp(validatedData);

    // Set httpOnly Cookies
    res.cookie(CONSTANTS.ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(false));
    res.cookie(CONSTANTS.REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(true));

    return sendSuccess(
      res,
      { user: result.user },
      'Logged in successfully via verification code!'
    );
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.[CONSTANTS.REFRESH_COOKIE_NAME];
    const result = await refreshSession(rawRefreshToken);

    res.cookie(CONSTANTS.ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(false));
    res.cookie(CONSTANTS.REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(true));

    return sendSuccess(res, { user: result.user }, 'Session refreshed.');
  } catch (err) {
    // Clear cookies on refresh failure
    res.clearCookie(CONSTANTS.ACCESS_COOKIE_NAME, getCookieOptions(false));
    res.clearCookie(CONSTANTS.REFRESH_COOKIE_NAME, getCookieOptions(true));
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.[CONSTANTS.REFRESH_COOKIE_NAME];
    await logoutUser(rawRefreshToken);

    res.clearCookie(CONSTANTS.ACCESS_COOKIE_NAME, getCookieOptions(false));
    res.clearCookie(CONSTANTS.REFRESH_COOKIE_NAME, getCookieOptions(true));

    return sendSuccess(res, null, 'Logged out successfully.');
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await requestPasswordReset(validatedData);
    return sendSuccess(res, null, result.message);
  } catch (err) {
    return next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await resetPasswordWithToken(validatedData);
    return sendSuccess(res, null, result.message);
  } catch (err) {
    return next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // Calculate aggregate trust scores
    const [trustBorrowerEvents, trustLenderEvents, completedBorrows, completedLends] = await Promise.all([
      prisma.trustEvent.findMany({ where: { userId: req.user.id, roleContext: 'BORROWER' } }),
      prisma.trustEvent.findMany({ where: { userId: req.user.id, roleContext: 'LENDER' } }),
      prisma.transaction.count({ where: { borrowerId: req.user.id, status: 'COMPLETED' } }),
      prisma.transaction.count({ where: { lenderId: req.user.id, status: 'COMPLETED' } })
    ]);

    const borrowerDelta = trustBorrowerEvents.reduce((acc, ev) => acc + ev.delta, 0);
    const lenderDelta = trustLenderEvents.reduce((acc, ev) => acc + ev.delta, 0);

    const borrowerScore = Math.max(0, Math.min(100, CONSTANTS.DEFAULT_TRUST_SCORE + borrowerDelta));
    const lenderScore = Math.max(0, Math.min(100, CONSTANTS.DEFAULT_TRUST_SCORE + lenderDelta));

    return sendSuccess(res, {
      user: {
        ...req.user,
        borrowerScore,
        lenderScore,
        completedBorrows,
        completedLends
      }
    });
  } catch (err) {
    return next(err);
  }
};
