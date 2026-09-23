import { verifyAccessToken } from '../utils/tokens.js';
import { CONSTANTS } from '../config/constants.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

/**
 * Authenticate incoming request via access token in cookie or Authorization Bearer header
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.[CONSTANTS.ACCESS_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication is required to access this resource.', 401);
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.sub) {
      return sendError(res, 'TOKEN_EXPIRED', 'Your access session has expired. Please refresh or log in again.', 401);
    }

    // Fetch user and check active account status
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        name: true,
        collegeEmail: true,
        department: true,
        year: true,
        role: true,
        accountStatus: true,
        verifiedAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User account does not exist.', 401);
    }

    if (user.accountStatus !== 'ACTIVE') {
      return sendError(res, 'ACCOUNT_SUSPENDED', 'Your account has been suspended by a campus moderator.', 403);
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Optional Auth (populates req.user if present, but doesn't block)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[CONSTANTS.ACCESS_COOKIE_NAME] ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.sub) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
          select: { id: true, name: true, role: true, accountStatus: true }
        });
        if (user && user.accountStatus === 'ACTIVE') {
          req.user = user;
        }
      }
    }
    return next();
  } catch (err) {
    return next();
  }
};

/**
 * Restrict access to staff (ADMIN or MODERATOR)
 */
export const requireStaff = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR')) {
    return sendError(res, 'FORBIDDEN', 'Access restricted to campus administrators and moderators.', 403);
  }
  return next();
};

/**
 * Restrict access to ADMIN only
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 'FORBIDDEN', 'Access restricted to campus administrators.', 403);
  }
  return next();
};
