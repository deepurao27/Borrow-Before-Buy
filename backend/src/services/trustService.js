import { prisma } from '../config/prisma.js';
import { CONSTANTS } from '../config/constants.js';

/**
 * Compute the independent Lender & Borrower Trust Scores for a user
 * Scores range from 0 to 100 with a baseline of 50.
 */
export const getUserTrustProfile = async (userId) => {
  const events = await prisma.trustEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const baseScore = CONSTANTS.DEFAULT_TRUST_SCORE || 50;
  let lenderDeltaSum = 0;
  let borrowerDeltaSum = 0;

  let completedBorrows = 0;
  let completedLends = 0;
  let onTimeReturns = 0;
  let lateReturns = 0;

  events.forEach((evt) => {
    if (evt.roleContext === 'LENDER') {
      lenderDeltaSum += evt.delta;
      if (evt.eventType === 'LEND_COMPLETE') completedLends += 1;
    } else if (evt.roleContext === 'BORROWER') {
      borrowerDeltaSum += evt.delta;
      if (evt.eventType === 'BORROW_COMPLETE') completedBorrows += 1;
      if (evt.eventType === 'ON_TIME_RETURN') onTimeReturns += 1;
      if (evt.eventType === 'LATE_RETURN') lateReturns += 1;
    }
  });

  const lenderScore = Math.min(100, Math.max(0, baseScore + lenderDeltaSum));
  const borrowerScore = Math.min(100, Math.max(0, baseScore + borrowerDeltaSum));
  const overallScore = Math.round((lenderScore + borrowerScore) / 2);

  // Compute reputation tier
  let tier = {
    code: 'RELIABLE_MEMBER',
    name: 'Reliable Member',
    description: 'Good campus reputation with clean history.'
  };

  if (overallScore >= 90) {
    tier = {
      code: 'CAMPUS_HERO',
      name: 'Campus Hero',
      description: 'Exceptional track record of generous sharing and timely returns.'
    };
  } else if (overallScore >= 75) {
    tier = {
      code: 'TRUSTED_PEER',
      name: 'Trusted Peer',
      description: 'Consistently verified on-time exchanges and high peer ratings.'
    };
  } else if (overallScore < 35) {
    tier = {
      code: 'NEEDS_IMPROVEMENT',
      name: 'Needs Improvement',
      description: 'Recent negative marks or late returns. Subject to caution flag.'
    };
  }

  return {
    overallScore,
    lenderScore,
    borrowerScore,
    tier,
    metrics: {
      completedBorrows,
      completedLends,
      totalCompletedExchanges: completedBorrows + completedLends,
      onTimeReturns,
      lateReturns,
      onTimeRatePercent: (completedBorrows > 0)
        ? Math.round((onTimeReturns / completedBorrows) * 100)
        : 100
    },
    history: events.slice(0, 25).map((e) => ({
      id: e.id,
      eventType: e.eventType,
      roleContext: e.roleContext,
      delta: e.delta,
      createdAt: e.createdAt,
      transactionId: e.transactionId
    }))
  };
};

/**
 * Record a single trust event
 */
export const recordTrustEvent = async ({ userId, roleContext, eventType, delta, transactionId = null }) => {
  return await prisma.trustEvent.create({
    data: {
      userId,
      roleContext,
      eventType,
      delta,
      transactionId
    }
  });
};
