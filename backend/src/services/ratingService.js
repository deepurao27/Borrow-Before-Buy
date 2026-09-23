import { prisma } from '../config/prisma.js';
import { recordTrustEvent } from './trustService.js';

/**
 * Submit a mutual rating & review for a completed transaction
 */
export const createRating = async (transactionId, reviewerId, { rating, comment = '' }) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, lenderId: true, borrowerId: true, status: true }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  if (transaction.status !== 'COMPLETED') {
    const error = new Error('Ratings can only be submitted after the exchange is fully completed.');
    error.status = 400;
    throw error;
  }

  const isLender = reviewerId === transaction.lenderId;
  const isBorrower = reviewerId === transaction.borrowerId;

  if (!isLender && !isBorrower) {
    const error = new Error('Only the transaction participants can submit a rating.');
    error.status = 403;
    throw error;
  }

  const revieweeId = isLender ? transaction.borrowerId : transaction.lenderId;
  const ratingType = isLender ? 'LENDER_TO_BORROWER' : 'BORROWER_TO_LENDER';
  const roleContext = isLender ? 'BORROWER' : 'LENDER'; // context of reviewee

  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    const error = new Error('Rating must be an integer between 1 and 5 stars.');
    error.status = 400;
    throw error;
  }

  // Check for duplicate rating
  const existing = await prisma.rating.findUnique({
    where: {
      transactionId_reviewerId: {
        transactionId,
        reviewerId
      }
    }
  });

  if (existing) {
    const error = new Error('You have already submitted a rating for this exchange.');
    error.status = 400;
    throw error;
  }

  // Create Rating Record
  const newRating = await prisma.rating.create({
    data: {
      transactionId,
      reviewerId,
      revieweeId,
      ratingType,
      rating: parsedRating,
      comment: comment ? comment.trim() : null
    },
    include: {
      reviewer: { select: { id: true, name: true, department: true, year: true } }
    }
  });

  // If 5-star rating, award Trust Score bonus (+3)
  if (parsedRating === 5) {
    await recordTrustEvent({
      userId: revieweeId,
      roleContext,
      eventType: 'HIGH_RATING',
      delta: 3,
      transactionId
    });
  }

  return newRating;
};

/**
 * Get all ratings received by a user
 */
export const getUserRatings = async (userId) => {
  const ratings = await prisma.rating.findMany({
    where: { revieweeId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: {
        select: { id: true, name: true, department: true, year: true }
      },
      transaction: {
        select: {
          id: true,
          item: { select: { title: true } }
        }
      }
    }
  });

  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const average = total > 0 ? parseFloat((sum / total).toFixed(1)) : 5.0;

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating] += 1;
    }
  });

  return {
    averageRating: average,
    totalReviews: total,
    starCounts,
    reviews: ratings
  };
};
