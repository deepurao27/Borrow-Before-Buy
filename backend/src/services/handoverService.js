import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { CONSTANTS } from '../config/constants.js';
import { transitionTransaction } from './transactionStateMachine.js';

/**
 * Generate a dynamic single-use 5-minute handover QR token & manual fallback code
 * Only the lender can generate this token, and the transaction must be in HANDOVER_PENDING.
 */
export const generateHandoverToken = async (transactionId, lenderId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, lenderId: true, status: true }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  if (transaction.lenderId !== lenderId) {
    const error = new Error('Only the lender can generate the handover QR token.');
    error.status = 403;
    throw error;
  }

  if (transaction.status !== 'HANDOVER_PENDING') {
    const error = new Error(`Cannot generate handover token when transaction is ${transaction.status}. Both parties must acknowledge security and condition first.`);
    error.status = 400;
    throw error;
  }

  // Generate unique JWT ID and random 6-character manual fallback code
  const jti = crypto.randomUUID();
  const jtiHash = crypto.createHash('sha256').update(jti).digest('hex');
  const manualCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  const expiryMinutes = CONSTANTS.HANDOVER_TOKEN_EXPIRY_MINUTES || 5;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Sign JWT
  const token = jwt.sign(
    {
      transactionId,
      jti,
      type: 'HANDOVER'
    },
    env.HANDOVER_TOKEN_SECRET,
    {
      expiresIn: `${expiryMinutes}m`
    }
  );

  // Invalidate any previously unused tokens for this transaction
  await prisma.handoverToken.deleteMany({
    where: {
      transactionId,
      usedAt: null
    }
  });

  // Store in database
  await prisma.handoverToken.create({
    data: {
      transactionId,
      jtiHash,
      manualCode,
      expiresAt
    }
  });

  return {
    token,
    manualCode,
    expiresAt: expiresAt.toISOString(),
    expiresInSeconds: expiryMinutes * 60
  };
};

/**
 * Verify and consume a handover QR token or manual code
 * Only the borrower can scan / submit the code to confirm item receipt.
 */
export const verifyAndConsumeHandover = async (transactionId, { token, manualCode }, borrower) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, borrowerId: true, status: true }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  if (transaction.borrowerId !== borrower.id) {
    const error = new Error('Only the borrower can confirm handover receipt.');
    error.status = 403;
    throw error;
  }

  let method = 'QR_SCAN';
  let tokenRecord = null;

  if (token) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.HANDOVER_TOKEN_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const error = new Error('Handover QR code has expired. Please ask the lender to refresh the code.');
        error.status = 400;
        throw error;
      }
      const error = new Error('Invalid handover QR code.');
      error.status = 400;
      throw error;
    }

    if (decoded.transactionId !== transactionId) {
      const error = new Error('Handover QR code does not belong to this transaction.');
      error.status = 400;
      throw error;
    }

    const jtiHash = crypto.createHash('sha256').update(decoded.jti).digest('hex');
    tokenRecord = await prisma.handoverToken.findUnique({
      where: { jtiHash }
    });

    method = 'QR_SCAN';
  } else if (manualCode) {
    const normalizedCode = manualCode.trim().toUpperCase();
    tokenRecord = await prisma.handoverToken.findFirst({
      where: {
        transactionId,
        manualCode: normalizedCode
      },
      orderBy: { createdAt: 'desc' }
    });

    method = 'MANUAL_CODE';
  } else {
    const error = new Error('Either a QR token or 6-digit manual fallback code is required.');
    error.status = 400;
    throw error;
  }

  if (!tokenRecord) {
    const error = new Error('Invalid or unrecognised handover code.');
    error.status = 400;
    throw error;
  }

  if (tokenRecord.usedAt) {
    const error = new Error('This handover code has already been used. Replay is forbidden.');
    error.status = 400;
    throw error;
  }

  if (new Date() > new Date(tokenRecord.expiresAt)) {
    const error = new Error('Handover code has expired. Lender must generate a fresh code.');
    error.status = 400;
    throw error;
  }

  // Atomically mark token as used
  await prisma.handoverToken.update({
    where: { id: tokenRecord.id },
    data: { usedAt: new Date() }
  });

  // Execute state machine transition
  return await transitionTransaction(transactionId, 'CONFIRM_HANDOVER', borrower, { method });
};
