export const TRUST_CONFIG = {
  LENDER: {
    SUCCESSFUL_LEND: { delta: 10, type: 'LEND_SUCCESS', label: 'Item lent successfully' },
    ON_TIME_COMPLETION: { delta: 5, type: 'LEND_ON_TIME', label: 'Completed on schedule' },
    GOOD_RATING: { delta: 3, type: 'LEND_HIGH_RATING', label: 'Received 4-5 star rating' },
    VERIFIED_CONDITION: { delta: 2, type: 'LEND_CONDITION_VERIFIED', label: 'Accurate condition recorded' },
    CANCEL_AFTER_ACCEPT: { delta: -10, type: 'LEND_CANCEL_AFTER_ACCEPT', label: 'Cancelled after accepting request' },
    DISPUTE_LOST: { delta: -25, type: 'LEND_DISPUTE_LOST', label: 'Lost dispute case' },
    VIOLATION: { delta: -30, type: 'LEND_VIOLATION', label: 'Severe policy or listing violation' }
  },
  BORROWER: {
    SUCCESSFUL_BORROW: { delta: 8, type: 'BORROW_SUCCESS', label: 'Item borrowed and returned' },
    ON_TIME_RETURN: { delta: 5, type: 'BORROW_ON_TIME', label: 'Returned item on or before due date' },
    GOOD_RATING: { delta: 3, type: 'BORROW_HIGH_RATING', label: 'Received 4-5 star rating' },
    LATE_RETURN: { delta: -6, type: 'BORROW_LATE', label: 'Returned item past due date' },
    NON_RETURN_OR_DISPUTE_LOST: { delta: -25, type: 'BORROW_DISPUTE_LOST', label: 'Non-return or lost dispute case' }
  },
  REWARDS: {
    POINTS_PER_LEND: 25,
    POINTS_BONUS_ON_TIME: 10,
    POINTS_BONUS_FIVE_STAR: 15,
    TIERS: [
      { name: 'New Lender', minPoints: 0, badge: '🌱 New Lender' },
      { name: 'Trusted Lender', minPoints: 100, badge: '⭐ Trusted Lender' },
      { name: 'Super Lender', minPoints: 250, badge: '🛡️ Super Lender' },
      { name: 'Campus Hero', minPoints: 500, badge: '🏆 Campus Hero' }
    ]
  }
};
