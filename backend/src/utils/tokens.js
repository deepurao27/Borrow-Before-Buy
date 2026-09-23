import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { CONSTANTS } from '../config/constants.js';
import { generateRandomToken, hashToken } from './crypto.js';
import { prisma } from '../config/prisma.js';

/**
 * Generate Access Token (JWT 15m)
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.collegeEmail,
      role: user.role
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: CONSTANTS.ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * Create and persist a rotating Refresh Token with Family Tracking
 */
export const createRefreshToken = async (userId, existingFamilyId = null) => {
  const rawToken = generateRandomToken(40);
  const tokenHash = hashToken(rawToken);
  const familyId = existingFamilyId || generateRandomToken(16);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      familyId,
      expiresAt
    }
  });

  return { rawToken, familyId, expiresAt };
};

/**
 * Verify and rotate refresh token with reuse detection
 */
export const rotateRefreshToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  // Token not found
  if (!tokenRecord) {
    return { error: 'INVALID_TOKEN' };
  }

  // Token Reuse Detection: If this token was already revoked, someone is replaying it!
  if (tokenRecord.isRevoked) {
    // Revoke the entire family to protect the user
    await prisma.refreshToken.updateMany({
      where: { familyId: tokenRecord.familyId },
      data: { isRevoked: true }
    });
    return { error: 'TOKEN_REUSE_DETECTED' };
  }

  // Check expiration
  if (new Date() > tokenRecord.expiresAt) {
    return { error: 'TOKEN_EXPIRED' };
  }

  // Check user account status
  if (tokenRecord.user.accountStatus !== 'ACTIVE') {
    return { error: 'ACCOUNT_SUSPENDED' };
  }

  // Mark current token as revoked
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { isRevoked: true }
  });

  // Issue new token in the same family
  const newRefresh = await createRefreshToken(tokenRecord.userId, tokenRecord.familyId);
  const newAccessToken = generateAccessToken(tokenRecord.user);

  return {
    user: tokenRecord.user,
    accessToken: newAccessToken,
    refreshToken: newRefresh.rawToken
  };
};

/**
 * Revoke a refresh token on logout
 */
export const revokeRefreshToken = async (rawToken) => {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { isRevoked: true }
  }).catch(() => {});
};

/**
 * Create Email Token (for verification or password reset)
 */
export const createEmailToken = async (userId, type, expiryHours = CONSTANTS.EMAIL_TOKEN_EXPIRY_HOURS) => {
  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  // Invalidate any previous unused tokens of the same type for this user
  await prisma.emailToken.deleteMany({
    where: {
      userId,
      type,
      usedAt: null
    }
  });

  await prisma.emailToken.create({
    data: {
      userId,
      tokenHash,
      type,
      expiresAt
    }
  });

  return rawToken;
};

/**
 * Cookie options helpers
 */
export const getCookieOptions = (isRefresh = false) => {
  const sameSite = process.env.COOKIE_SAME_SITE || (env.isProd ? 'none' : 'lax');
  const isSecure = env.isProd || sameSite === 'none';

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite,
    maxAge: isRefresh
      ? CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      : 15 * 60 * 1000,
    path: '/'
  };
};
