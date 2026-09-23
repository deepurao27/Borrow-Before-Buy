import { prisma } from '../config/prisma.js';
import { getUserTrustProfile } from './trustService.js';
import { getUserRatings } from './ratingService.js';

/**
 * Get comprehensive student dashboard summary
 */
export const getUserDashboard = async (userId) => {
  const now = new Date();
  const next24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [
    trustProfile,
    activeBorrowingTxs,
    activeLendingTxs,
    pendingRequestsReceived,
    pendingRequestsSent
  ] = await Promise.all([
    getUserTrustProfile(userId),
    prisma.transaction.findMany({
      where: {
        borrowerId: userId,
        status: { in: ['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING', 'BORROWED', 'OVERDUE', 'RETURN_PENDING'] }
      },
      orderBy: { dueAt: 'asc' },
      include: {
        item: {
          include: {
            photos: { where: { isPrimary: true }, take: 1 },
            handoverPoint: true
          }
        },
        lender: {
          select: { id: true, name: true, department: true }
        },
        securityAgreement: true
      }
    }),
    prisma.transaction.findMany({
      where: {
        lenderId: userId,
        status: { in: ['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING', 'BORROWED', 'OVERDUE', 'RETURN_PENDING'] }
      },
      orderBy: { dueAt: 'asc' },
      include: {
        item: {
          include: {
            photos: { where: { isPrimary: true }, take: 1 },
            handoverPoint: true
          }
        },
        borrower: {
          select: { id: true, name: true, department: true }
        },
        securityAgreement: true
      }
    }),
    prisma.borrowRequest.count({
      where: {
        item: { ownerId: userId },
        status: 'PENDING'
      }
    }),
    prisma.borrowRequest.count({
      where: {
        borrowerId: userId,
        status: 'PENDING'
      }
    })
  ]);

  // Due Soon: items due in next 24 hours or already overdue
  const dueSoonItems = activeBorrowingTxs.filter(
    (tx) => tx.status === 'BORROWED' && new Date(tx.dueAt) <= next24Hours
  );

  return {
    trustProfile,
    counts: {
      activeBorrowing: activeBorrowingTxs.length,
      activeLending: activeLendingTxs.length,
      dueSoon: dueSoonItems.length,
      pendingRequestsReceived,
      pendingRequestsSent
    },
    dueSoonItems,
    activeBorrowing: activeBorrowingTxs,
    activeLending: activeLendingTxs
  };
};

/**
 * Get public profile details including reputation, trust breakdown, ratings, and items
 */
export const getUserPublicProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      collegeEmail: true,
      department: true,
      year: true,
      accountStatus: true,
      createdAt: true
    }
  });

  if (!user) {
    const error = new Error('User profile not found.');
    error.status = 404;
    throw error;
  }

  const [trustProfile, ratingsData, activeListings] = await Promise.all([
    getUserTrustProfile(userId),
    getUserRatings(userId),
    prisma.item.findMany({
      where: { ownerId: userId, status: 'ACTIVE' },
      include: {
        category: true,
        handoverPoint: true,
        photos: { where: { isPrimary: true }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    user,
    trustProfile,
    ratings: ratingsData,
    activeListings
  };
};
