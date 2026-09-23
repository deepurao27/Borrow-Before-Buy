import { prisma } from '../config/prisma.js';
import { CONSTANTS } from '../config/constants.js';

/**
 * Award reward points to student
 */
export const awardPoints = async ({ userId, points, reason, metadata = {} }) => {
  const transaction = await prisma.rewardTransaction.create({
    data: {
      userId,
      points,
      reason,
      metadata
    }
  });

  return transaction;
};

/**
 * Get user reward points balance and history
 */
export const getUserRewards = async (userId) => {
  const [history, pointsSum] = await Promise.all([
    prisma.rewardTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.rewardTransaction.aggregate({
      where: { userId },
      _sum: { points: true }
    })
  ]);

  const totalPoints = pointsSum._sum.points || 0;

  return {
    totalPoints,
    history
  };
};

/**
 * Campus Leaderboard
 * Computes top campus students based on completed exchanges, trust ratings, and reliability points
 */
export const getLeaderboard = async ({ limit = 15 } = {}) => {
  const users = await prisma.user.findMany({
    where: { accountStatus: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      department: true,
      year: true,
      createdAt: true,
      trustEvents: { select: { delta: true, roleContext: true } },
      rewardLedger: { select: { points: true } },
      lendingTransactions: { where: { status: 'COMPLETED' }, select: { id: true } },
      borrowingTransactions: { where: { status: 'COMPLETED' }, select: { id: true } }
    }
  });

  const ranked = users.map((u) => {
    const points = u.rewardLedger.reduce((acc, r) => acc + r.points, 0);
    const borrowerDelta = u.trustEvents
      .filter((e) => e.roleContext === 'BORROWER')
      .reduce((acc, e) => acc + e.delta, 0);
    const lenderDelta = u.trustEvents
      .filter((e) => e.roleContext === 'LENDER')
      .reduce((acc, e) => acc + e.delta, 0);

    const borrowerScore = Math.max(0, Math.min(100, CONSTANTS.DEFAULT_TRUST_SCORE + borrowerDelta));
    const lenderScore = Math.max(0, Math.min(100, CONSTANTS.DEFAULT_TRUST_SCORE + lenderDelta));
    const averageTrust = Math.round((borrowerScore + lenderScore) / 2);
    const completedExchanges = u.lendingTransactions.length + u.borrowingTransactions.length;

    // Leaderboard Composite Score: (completed exchanges * 20) + (points) + (avg trust)
    const compositeScore = (completedExchanges * 20) + points + averageTrust;

    // Badge tier
    let tier = 'Campus Citizen';
    if (compositeScore >= 180 || averageTrust >= 90) tier = 'Campus Pillar';
    else if (compositeScore >= 120 || averageTrust >= 80) tier = 'Reliable Peer';
    else if (compositeScore >= 60) tier = 'Active Sharer';

    return {
      id: u.id,
      name: u.name,
      department: u.department,
      year: u.year,
      completedExchanges,
      borrowerScore,
      lenderScore,
      averageTrust,
      rewardPoints: points,
      compositeScore,
      tier
    };
  });

  ranked.sort((a, b) => b.compositeScore - a.compositeScore);

  return ranked.slice(0, limit);
};
