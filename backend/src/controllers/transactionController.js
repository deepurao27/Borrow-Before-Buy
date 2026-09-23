import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  transitionTransaction,
  getEnrichedTransaction
} from '../services/transactionStateMachine.js';
import {
  generateHandoverToken as generateTokenService,
  verifyAndConsumeHandover
} from '../services/handoverService.js';
import {
  uploadConditionEvidence,
  acknowledgeConditionEvidence,
  getEvidenceFile
} from '../services/conditionService.js';
import { createRating } from '../services/ratingService.js';


/**
 * List all transactions for the authenticated user
 */
export const listTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type = 'all', status } = req.query;

    const where = {};

    if (type === 'borrowing') {
      where.borrowerId = userId;
    } else if (type === 'lending') {
      where.lenderId = userId;
    } else {
      where.OR = [{ borrowerId: userId }, { lenderId: userId }];
    }

    if (status) {
      if (status === 'active') {
        where.status = {
          in: ['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING', 'BORROWED', 'OVERDUE', 'RETURN_PENDING']
        };
      } else if (status === 'past') {
        where.status = {
          in: ['COMPLETED', 'CANCELLED', 'RESOLVED']
        };
      } else {
        where.status = status;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        item: {
          include: {
            photos: { where: { isPrimary: true }, take: 1 },
            handoverPoint: true
          }
        },
        lender: {
          select: { id: true, name: true, collegeEmail: true, department: true, year: true }
        },
        borrower: {
          select: { id: true, name: true, collegeEmail: true, department: true, year: true }
        },
        securityAgreement: true,
        events: {
          orderBy: { at: 'desc' },
          take: 1
        }
      }
    });

    return sendSuccess(res, transactions);
  } catch (err) {
    return next(err);
  }
};

/**
 * Get enriched single transaction by ID
 */
export const getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await getEnrichedTransaction(prisma, id);

    if (!transaction) {
      return sendError(res, 'NOT_FOUND', 'Transaction not found.', 404);
    }

    const isLender = req.user.id === transaction.lenderId;
    const isBorrower = req.user.id === transaction.borrowerId;
    const isStaff = req.user.role === 'ADMIN' || req.user.role === 'MODERATOR';

    if (!isLender && !isBorrower && !isStaff) {
      return sendError(res, 'FORBIDDEN', 'You are not authorized to view this transaction.', 403);
    }

    return sendSuccess(res, transaction);
  } catch (err) {
    return next(err);
  }
};

/**
 * Update offline security deposit amount (lender only, before agreement acknowledged)
 */
export const updateSecurityAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { securityAmount, offlineTipNote } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { securityAgreement: true }
    });

    if (!transaction) {
      return sendError(res, 'NOT_FOUND', 'Transaction not found.', 404);
    }

    if (transaction.lenderId !== req.user.id) {
      return sendError(res, 'FORBIDDEN', 'Only the item owner (lender) can edit the deposit amount.', 403);
    }

    if (transaction.status !== 'ACCEPTED') {
      return sendError(res, 'INVALID_STATE', 'Cannot adjust deposit amount after agreements have started.', 400);
    }

    const updated = await prisma.securityAgreement.update({
      where: { transactionId: id },
      data: {
        securityAmount: securityAmount !== undefined ? Math.max(0, parseInt(securityAmount, 10)) : undefined,
        offlineTipNote: offlineTipNote !== undefined ? offlineTipNote : undefined,
        borrowerAcknowledged: false, // reset acknowledgements if changed
        lenderAcknowledged: false
      }
    });

    const enriched = await getEnrichedTransaction(prisma, id);
    return sendSuccess(res, enriched, 'Security agreement updated successfully.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Acknowledge offline security agreement
 */
export const acknowledgeSecurity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await transitionTransaction(id, 'ACKNOWLEDGE_SECURITY', req.user);
    return sendSuccess(res, transaction, 'Offline security agreement acknowledged.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Submit condition evidence photos and checklist
 */
export const submitCondition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage = 'BEFORE', notes, checklist } = req.body;
    const files = req.files || [];

    const record = await uploadConditionEvidence(id, req.user, {
      stage,
      notes,
      checklist,
      files
    });

    const enriched = await getEnrichedTransaction(prisma, id);
    return sendSuccess(res, { record, transaction: enriched }, 'Condition evidence submitted successfully.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Acknowledge condition inspection
 */
export const acknowledgeCondition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await acknowledgeConditionEvidence(id, req.user);
    return sendSuccess(res, transaction, 'Pre-handover condition checklist acknowledged.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Generate 5-minute dynamic QR token (lender only)
 */
export const generateHandoverToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tokenData = await generateTokenService(id, req.user.id);
    return sendSuccess(res, tokenData, 'Dynamic handover token generated.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Confirm handover by scanning QR code or manual code (borrower only)
 */
export const confirmHandover = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token, manualCode } = req.body;
    const transaction = await verifyAndConsumeHandover(id, { token, manualCode }, req.user);
    return sendSuccess(res, transaction, 'Handover confirmed! Item is now marked as BORROWED.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Cancel transaction before physical handover
 */
export const cancelTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const transaction = await transitionTransaction(id, 'CANCEL_TRANSACTION', req.user, { reason });
    return sendSuccess(res, transaction, 'Transaction has been cancelled.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Stream private evidence photo
 */
export const streamEvidence = async (req, res, next) => {
  try {
    const { id, filename } = req.params;
    const { fileBuffer, mimeType } = await getEvidenceFile(id, filename, req.user);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    return res.send(fileBuffer);
  } catch (err) {
    return next(err);
  }
};

/**
 * Initiate physical item return (borrower or lender)
 */
export const initiateReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const transaction = await transitionTransaction(id, 'INITIATE_RETURN', req.user, { note });
    return sendSuccess(res, transaction, 'Return process initiated! Meet at the designated campus point.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Confirm return receipt and close offline security agreement (lender only)
 */
export const confirmReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await transitionTransaction(id, 'CONFIRM_RETURN', req.user);
    return sendSuccess(res, transaction, 'Item return confirmed! Security deposit released and exchange completed.');
  } catch (err) {
    return next(err);
  }
};

/**
 * Submit mutual rating and review
 */
export const submitRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const newRating = await createRating(id, req.user.id, { rating, comment });
    return sendSuccess(res, newRating, 'Thank you! Your rating has been recorded.', 201);
  } catch (err) {
    return next(err);
  }
};

