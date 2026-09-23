import { prisma } from '../config/prisma.js';
import { transitionTransaction } from './transactionStateMachine.js';
import { logger } from '../config/logger.js';

/**
 * Open a dispute on a transaction and transition to DISPUTED status
 */
export const createDispute = async ({ transactionId, initiator, type, description, evidence = [] }) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  const isLender = transaction.lenderId === initiator.id;
  const isBorrower = transaction.borrowerId === initiator.id;

  if (!isLender && !isBorrower) {
    const error = new Error('Only the lender or borrower of this transaction can file a dispute.');
    error.status = 403;
    throw error;
  }

  // Check if there is already an active dispute
  const existingDispute = await prisma.dispute.findFirst({
    where: {
      transactionId,
      status: { in: ['OPEN', 'UNDER_REVIEW'] }
    }
  });

  if (existingDispute) {
    const error = new Error('An active dispute is already open for this transaction.');
    error.status = 400;
    throw error;
  }

  // 1. Transition transaction state to DISPUTED (with row lock & validation)
  await transitionTransaction(transactionId, 'OPEN_DISPUTE', initiator, {
    note: `Dispute filed by ${initiator.name || initiator.id}: ${type} - ${description.substring(0, 80)}`
  });

  // 2. Create Dispute record with optional evidence
  const dispute = await prisma.dispute.create({
    data: {
      transactionId,
      openedBy: initiator.id,
      type,
      description: description.trim(),
      status: 'OPEN',
      evidence: evidence.length > 0 ? {
        create: evidence.map((ev) => ({
          uploaderId: initiator.id,
          storageKey: ev.storageKey || 'evidence/photo.jpg',
          filename: ev.filename || 'evidence.jpg',
          mimeType: ev.mimeType || 'image/jpeg',
          description: ev.description || null
        }))
      } : undefined
    },
    include: {
      opener: {
        select: { id: true, name: true, collegeEmail: true }
      },
      evidence: true,
      transaction: {
        include: {
          item: { select: { id: true, title: true } },
          lender: { select: { id: true, name: true, collegeEmail: true } },
          borrower: { select: { id: true, name: true, collegeEmail: true } }
        }
      }
    }
  });

  // 3. Create Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: initiator.id,
      action: 'DISPUTE_OPENED',
      entityType: 'DISPUTE',
      entityId: dispute.id,
      metadata: { transactionId, type }
    }
  });

  logger.info({ disputeId: dispute.id, transactionId, type }, 'Dispute opened');
  return dispute;
};

/**
 * List disputes for campus moderators / admin dashboard
 */
export const listDisputes = async ({ status, page = 1, limit = 20 }) => {
  const skip = (Math.max(1, page) - 1) * limit;
  const where = status ? { status } : {};

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        opener: { select: { id: true, name: true, collegeEmail: true } },
        resolver: { select: { id: true, name: true, collegeEmail: true } },
        evidence: true,
        transaction: {
          include: {
            item: { select: { id: true, title: true } },
            lender: { select: { id: true, name: true, collegeEmail: true } },
            borrower: { select: { id: true, name: true, collegeEmail: true } }
          }
        }
      }
    }),
    prisma.dispute.count({ where })
  ]);

  return {
    disputes,
    pagination: {
      total,
      page: Math.max(1, page),
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get dispute details by ID
 */
export const getDisputeById = async (disputeId, actor) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      opener: { select: { id: true, name: true, collegeEmail: true } },
      resolver: { select: { id: true, name: true, collegeEmail: true } },
      evidence: true,
      transaction: {
        include: {
          item: { select: { id: true, title: true } },
          lender: { select: { id: true, name: true, collegeEmail: true } },
          borrower: { select: { id: true, name: true, collegeEmail: true } }
        }
      }
    }
  });

  if (!dispute) {
    const error = new Error('Dispute not found.');
    error.status = 404;
    throw error;
  }

  const isParty = dispute.transaction.lenderId === actor.id || dispute.transaction.borrowerId === actor.id;
  const isStaff = actor.role === 'ADMIN' || actor.role === 'MODERATOR';

  if (!isParty && !isStaff) {
    const error = new Error('Unauthorized to view this dispute.');
    error.status = 403;
    throw error;
  }

  return dispute;
};

/**
 * Resolve dispute (Staff only: ADMIN or MODERATOR)
 */
export const resolveDispute = async ({ disputeId, resolver, resolution, penaltyUserId, trustDelta }) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { transaction: true }
  });

  if (!dispute) {
    const error = new Error('Dispute not found.');
    error.status = 404;
    throw error;
  }

  if (dispute.status === 'RESOLVED' || dispute.status === 'DISMISSED') {
    const error = new Error('This dispute has already been concluded.');
    error.status = 400;
    throw error;
  }

  // 1. Transition transaction state to RESOLVED
  await transitionTransaction(dispute.transactionId, 'RESOLVE_DISPUTE', resolver, {
    note: resolution.trim()
  });

  // 2. Update Dispute record
  const updatedDispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'RESOLVED',
      resolvedBy: resolver.id,
      resolution: resolution.trim(),
      resolvedAt: new Date()
    },
    include: {
      opener: { select: { id: true, name: true, collegeEmail: true } },
      resolver: { select: { id: true, name: true, collegeEmail: true } },
      evidence: true,
      transaction: true
    }
  });

  // 3. Apply Trust Penalty if specified
  if (penaltyUserId) {
    const delta = -Math.abs(trustDelta || 10);
    const roleContext = penaltyUserId === dispute.transaction.borrowerId ? 'BORROWER' : 'LENDER';

    await prisma.trustEvent.create({
      data: {
        userId: penaltyUserId,
        roleContext,
        eventType: 'DISPUTE_FAULT',
        delta,
        transactionId: dispute.transactionId
      }
    });

    await prisma.notification.create({
      data: {
        userId: penaltyUserId,
        type: 'TRUST_PENALTY',
        title: 'Trust Score Deduction',
        body: `Moderator applied a ${delta} pt trust adjustment due to dispute resolution: "${resolution.trim()}"`,
        link: `/transactions/${dispute.transactionId}`
      }
    });
  }

  // 4. Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: resolver.id,
      action: 'DISPUTE_RESOLVED',
      entityType: 'DISPUTE',
      entityId: dispute.id,
      metadata: { resolution, penaltyUserId, trustDelta }
    }
  });

  logger.info({ disputeId, resolvedBy: resolver.id }, 'Dispute resolved successfully');
  return updatedDispute;
};
