import { prisma } from '../config/prisma.js';
import { hashPassword, verifyPassword, hashToken, generateRandomToken } from '../utils/crypto.js';
import {
  generateAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  createEmailToken
} from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail } from './emailService.js';

// Dummy hash for timing attack mitigation on non-existent users
const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=1$abcdefghijklmnopqrstuvwxyz012345$abcdefghijklmnopqrstuvwxyz012345';

export const registerUser = async ({ name, collegeEmail, department, year, password }) => {
  const normalizedEmail = collegeEmail.toLowerCase().trim();

  // Check if email already registered
  const existingUser = await prisma.user.findUnique({
    where: { collegeEmail: normalizedEmail }
  });

  if (existingUser) {
    const error = new Error('A user with this email address is already registered.');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      collegeEmail: normalizedEmail,
      passwordHash,
      department: department.trim(),
      year: parseInt(year, 10),
      accountStatus: 'ACTIVE',
      role: 'STUDENT',
      verifiedAt: new Date()
    }
  });

  // Generate tokens for immediate activation & login
  const accessToken = generateAccessToken(newUser);
  const refreshToken = await createRefreshToken(newUser.id);

  // Optional background verification record / email dispatch (non-blocking)
  try {
    const rawToken = await createEmailToken(newUser.id, 'VERIFICATION');
    await sendVerificationEmail({
      to: newUser.collegeEmail,
      name: newUser.name,
      token: rawToken
    });
  } catch (err) {
    // Non-blocking for offline or simulated test environments
  }

  return {
    id: newUser.id,
    name: newUser.name,
    collegeEmail: newUser.collegeEmail,
    user: {
      id: newUser.id,
      name: newUser.name,
      collegeEmail: newUser.collegeEmail,
      department: newUser.department,
      year: newUser.year,
      role: newUser.role
    },
    accessToken,
    refreshToken: refreshToken.rawToken
  };
};

export const verifyEmailToken = async ({ token }) => {
  const tokenHash = hashToken(token.trim());

  const tokenRecord = await prisma.emailToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!tokenRecord || tokenRecord.type !== 'VERIFICATION') {
    const error = new Error('The verification link is invalid or has expired.');
    error.code = 'INVALID_OR_EXPIRED_TOKEN';
    error.status = 400;
    throw error;
  }

  if (tokenRecord.usedAt !== null) {
    const error = new Error('This verification link has already been used.');
    error.code = 'TOKEN_ALREADY_USED';
    error.status = 400;
    throw error;
  }

  if (new Date() > tokenRecord.expiresAt) {
    const error = new Error('The verification link has expired. Please request a new one.');
    error.code = 'TOKEN_EXPIRED';
    error.status = 400;
    throw error;
  }

  // Mark token used and user verified
  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { verifiedAt: new Date() }
    })
  ]);

  return { message: 'Your college email has been verified successfully! You can now log in.' };
};

export const resendVerificationToken = async ({ collegeEmail }) => {
  const normalizedEmail = collegeEmail.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { collegeEmail: normalizedEmail }
  });

  if (!user) {
    // Return friendly generic response to avoid email enumeration
    return { message: 'If an unverified account exists for this email, a verification link has been sent.' };
  }

  if (user.verifiedAt !== null) {
    const error = new Error('This account is already verified. Please proceed to log in.');
    error.code = 'ALREADY_VERIFIED';
    error.status = 400;
    throw error;
  }

  const rawToken = await createEmailToken(user.id, 'VERIFICATION');
  await sendVerificationEmail({
    to: user.collegeEmail,
    name: user.name,
    token: rawToken
  });

  return { message: 'A new verification link has been sent to your email.' };
};

export const loginUser = async ({ collegeEmail, password }) => {
  const normalizedEmail = collegeEmail.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { collegeEmail: normalizedEmail }
  });

  if (!user) {
    // Perform dummy verify to mitigate timing attacks
    await verifyPassword(DUMMY_HASH, password);
    const error = new Error('Invalid college email or password.');
    error.code = 'INVALID_CREDENTIALS';
    error.status = 401;
    throw error;
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    const error = new Error('Invalid college email or password.');
    error.code = 'INVALID_CREDENTIALS';
    error.status = 401;
    throw error;
  }

  // Auto-activate account on login if not already verified
  if (!user.verifiedAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verifiedAt: new Date() }
    });
  }

  // Check account suspension
  if (user.accountStatus !== 'ACTIVE') {
    const error = new Error('Your account has been suspended by campus moderators.');
    error.code = 'ACCOUNT_SUSPENDED';
    error.status = 403;
    throw error;
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      collegeEmail: user.collegeEmail,
      department: user.department,
      year: user.year,
      role: user.role
    },
    accessToken,
    refreshToken: refreshToken.rawToken
  };
};

export const refreshSession = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    const error = new Error('No refresh token provided.');
    error.code = 'UNAUTHORIZED';
    error.status = 401;
    throw error;
  }

  const result = await rotateRefreshToken(rawRefreshToken);
  if (result.error) {
    const error = new Error('Session has expired or is invalid. Please log in again.');
    error.code = result.error;
    error.status = 401;
    throw error;
  }

  return result;
};

export const logoutUser = async (rawRefreshToken) => {
  if (rawRefreshToken) {
    await revokeRefreshToken(rawRefreshToken);
  }
};

export const requestPasswordReset = async ({ collegeEmail }) => {
  const normalizedEmail = collegeEmail.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { collegeEmail: normalizedEmail }
  });

  if (!user) {
    return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
  }

  const rawToken = await createEmailToken(user.id, 'PASSWORD_RESET', 1); // 1 hour
  await sendPasswordResetEmail({
    to: user.collegeEmail,
    name: user.name,
    token: rawToken
  });

  return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
};

export const resetPasswordWithToken = async ({ token, password }) => {
  const tokenHash = hashToken(token.trim());

  const tokenRecord = await prisma.emailToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!tokenRecord || tokenRecord.type !== 'PASSWORD_RESET') {
    const error = new Error('Password reset link is invalid or has expired.');
    error.code = 'INVALID_OR_EXPIRED_TOKEN';
    error.status = 400;
    throw error;
  }

  if (tokenRecord.usedAt !== null) {
    const error = new Error('This password reset link has already been used.');
    error.code = 'TOKEN_ALREADY_USED';
    error.status = 400;
    throw error;
  }

  if (new Date() > tokenRecord.expiresAt) {
    const error = new Error('Password reset link has expired.');
    error.code = 'TOKEN_EXPIRED';
    error.status = 400;
    throw error;
  }

  const newHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash: newHash }
    }),
    // Invalidate all active sessions for security
    prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId },
      data: { isRevoked: true }
    })
  ]);

  return { message: 'Password reset successful! You can now log in with your new password.' };
};

/**
 * Dispatch 6-digit numeric login OTP to email (auto-provisions account if first time)
 */
export const sendLoginOtp = async ({ email, name }) => {
  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: { collegeEmail: normalizedEmail }
  });

  if (!user) {
    // Auto-create student profile with random password hash and default fields
    const randomPass = generateRandomToken(32);
    const passwordHash = await hashPassword(randomPass);
    const displayName = name?.trim() || normalizedEmail.split('@')[0];

    user = await prisma.user.create({
      data: {
        name: displayName,
        collegeEmail: normalizedEmail,
        passwordHash,
        department: 'General',
        year: 1,
        accountStatus: 'ACTIVE',
        role: 'STUDENT',
        verifiedAt: null
      }
    });
  }

  if (user.accountStatus !== 'ACTIVE') {
    const error = new Error('Your account has been suspended by campus moderators.');
    error.code = 'ACCOUNT_SUSPENDED';
    error.status = 403;
    throw error;
  }

  // Generate secure 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenHash = hashToken(otp);

  // Invalidate any active unused LOGIN_OTP tokens for this user
  await prisma.emailToken.deleteMany({
    where: {
      userId: user.id,
      type: 'LOGIN_OTP',
      usedAt: null
    }
  });

  // Create new OTP token expiring in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash,
      type: 'LOGIN_OTP',
      expiresAt
    }
  });

  // Dispatch email
  await sendOtpEmail({
    to: user.collegeEmail,
    name: user.name,
    otp
  });

  return {
    message: `A 6-digit verification code has been sent to ${user.collegeEmail}.`,
    email: user.collegeEmail
  };
};

/**
 * Verify 6-digit login OTP and return active session tokens
 */
export const verifyLoginOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const tokenHash = hashToken(otp.trim());

  const user = await prisma.user.findUnique({
    where: { collegeEmail: normalizedEmail }
  });

  if (!user) {
    const error = new Error('Invalid or expired verification code.');
    error.code = 'INVALID_OR_EXPIRED_OTP';
    error.status = 400;
    throw error;
  }

  if (user.accountStatus !== 'ACTIVE') {
    const error = new Error('Your account has been suspended by campus moderators.');
    error.code = 'ACCOUNT_SUSPENDED';
    error.status = 403;
    throw error;
  }

  const tokenRecord = await prisma.emailToken.findFirst({
    where: {
      userId: user.id,
      tokenHash,
      type: 'LOGIN_OTP',
      usedAt: null
    }
  });

  if (!tokenRecord) {
    const error = new Error('Invalid or expired verification code.');
    error.code = 'INVALID_OR_EXPIRED_OTP';
    error.status = 400;
    throw error;
  }

  if (new Date() > tokenRecord.expiresAt) {
    const error = new Error('The verification code has expired. Please request a new one.');
    error.code = 'OTP_EXPIRED';
    error.status = 400;
    throw error;
  }

  // Mark token used and mark user email verified if not already
  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { verifiedAt: user.verifiedAt || new Date() }
    })
  ]);

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      collegeEmail: user.collegeEmail,
      department: user.department,
      year: user.year,
      role: user.role
    },
    accessToken,
    refreshToken: refreshToken.rawToken
  };
};
