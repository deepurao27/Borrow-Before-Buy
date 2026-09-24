import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';

/**
 * Valid state transitions mapping
 */
const ALLOWED_TRANSITIONS = {
  ACCEPTED: ['SECURITY_ACKNOWLEDGED', 'CANCELLED'],
  SECURITY_ACKNOWLEDGED: ['HANDOVER_PENDING', 'CANCELLED'],
  HANDOVER_PENDING: ['BORROWED', 'CANCELLED'],
  BORROWED: ['OVERDUE', 'RETURN_PENDING', 'RETURNED', 'COMPLETED', 'DISPUTED'],
  OVERDUE: ['RETURN_PENDING', 'RETURNED', 'COMPLETED', 'DISPUTED'],
  RETURN_PENDING: ['RETURNED', 'COMPLETED', 'DISPUTED'],
  RETURNED: ['COMPLETED'],
  DISPUTED: ['RESOLVED'],
  RESOLVED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};


/**
 * Authoritative single transaction state engine
 * @param {string} transactionId - Transaction UUID
 * @param {string} action - Triggering action name
 * @param {object} actor - User object { id, role }
 * @param {object} payload - Action-specific payload
 */
export const transitionTransaction = async (transactionId, action, actor, payload = {}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock or fetch transaction row
    let lockedRow;
    try {
      const rows = await tx.$queryRaw`
        SELECT id, status, version, "lender_id" as "lenderId", "borrower_id" as "borrowerId", "item_id" as "itemId"
        FROM transactions
        WHERE id = ${transactionId}
        FOR UPDATE
      `;
      lockedRow = rows?.[0];
    } catch (e) {
      // Fallback for poolers or dialects that reject raw FOR UPDATE
    }

    if (!lockedRow) {
      lockedRow = await tx.transaction.findUnique({
        where: { id: transactionId },
        select: { id: true, status: true, version: true, lenderId: true, borrowerId: true, itemId: true }
      });
    }

    if (!lockedRow) {
      const error = new Error('Transaction not found.');
      error.status = 404;
      throw error;
    }

    const currentStatus = lockedRow.status;
    const isLender = actor.id === lockedRow.lenderId;
    const isBorrower = actor.id === lockedRow.borrowerId;
    const isStaff = actor.role === 'ADMIN' || actor.role === 'MODERATOR';

    if (!isLender && !isBorrower && !isStaff) {
      const error = new Error('You are not authorized to view or modify this transaction.');
      error.status = 403;
      throw error;
    }

    let nextStatus = currentStatus;
    let eventNote = payload.note || `Action ${action} triggered by ${actor.id}`;

    // 2. State Actions & Guards Evaluation
    switch (action) {
      case 'ACKNOWLEDGE_SECURITY': {
        // Must be in ACCEPTED state
        if (currentStatus !== 'ACCEPTED') {
          // Idempotency: If already moved forward, return current state
          if (['SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING', 'BORROWED'].includes(currentStatus)) {
            return await getEnrichedTransaction(tx, transactionId);
          }
          const error = new Error(`Cannot acknowledge security agreement when transaction is ${currentStatus}.`);
          error.status = 400;
          throw error;
        }

        // Fetch or create SecurityAgreement
        let secAgreement = await tx.securityAgreement.findUnique({
          where: { transactionId }
        });

        if (!secAgreement) {
          const txItem = await tx.item.findUnique({ where: { id: lockedRow.itemId } });
          secAgreement = await tx.securityAgreement.create({
            data: {
              transactionId,
              securityAmount: txItem?.securityAmount || 0,
              status: 'PENDING'
            }
          });
        }

        const updateData = {};
        if (isLender) {
          updateData.lenderAcknowledged = true;
          updateData.lenderAcknowledgedAt = new Date();
        } else if (isBorrower) {
          updateData.borrowerAcknowledged = true;
          updateData.borrowerAcknowledgedAt = new Date();
        }

        // Check if both will be acknowledged after this update
        const willLenderAck = isLender ? true : secAgreement.lenderAcknowledged;
        const willBorrowerAck = isBorrower ? true : secAgreement.borrowerAcknowledged;

        if (willLenderAck && willBorrowerAck) {
          updateData.status = 'ACKNOWLEDGED';
          nextStatus = 'SECURITY_ACKNOWLEDGED';
          eventNote = 'Both parties acknowledged offline security agreement';
        }

        await tx.securityAgreement.update({
          where: { transactionId },
          data: updateData
        });
        break;
      }

      case 'ACKNOWLEDGE_CONDITION': {
        if (currentStatus !== 'SECURITY_ACKNOWLEDGED') {
          if (['HANDOVER_PENDING', 'BORROWED'].includes(currentStatus)) {
            return await getEnrichedTransaction(tx, transactionId);
          }
          const error = new Error(`Cannot advance condition state when transaction is ${currentStatus}.`);
          error.status = 400;
          throw error;
        }

        // Borrower must acknowledge before condition
        if (!isBorrower) {
          const error = new Error('Only the borrower can acknowledge before-condition inspection.');
          error.status = 403;
          throw error;
        }

        // Verify Lender uploaded BEFORE condition record
        const beforeRecord = await tx.conditionRecord.findFirst({
          where: { transactionId, stage: 'BEFORE' }
        });

        if (!beforeRecord) {
          const error = new Error('Lender must upload condition photos & checklist before borrower can confirm.');
          error.status = 400;
          throw error;
        }

        // Mark condition record as acknowledged
        await tx.conditionRecord.update({
          where: { id: beforeRecord.id },
          data: {
            acknowledgedBy: actor.id,
            acknowledgedAt: new Date()
          }
        });

        nextStatus = 'HANDOVER_PENDING';
        eventNote = 'Borrower acknowledged pre-handover condition evidence';
        break;
      }

      case 'CONFIRM_HANDOVER': {
        if (currentStatus !== 'HANDOVER_PENDING') {
          // Idempotency: If already BORROWED, return cleanly
          if (currentStatus === 'BORROWED') {
            return await getEnrichedTransaction(tx, transactionId);
          }
          const error = new Error(`Cannot complete handover when transaction is ${currentStatus}.`);
          error.status = 400;
          throw error;
        }

        // Only borrower can confirm handover (by scanning lender's QR code)
        if (!isBorrower) {
          const error = new Error('Only the borrower can scan and confirm physical handover.');
          error.status = 403;
          throw error;
        }

        // Record Handover Event
        await tx.handoverRecord.create({
          data: {
            transactionId,
            actorId: actor.id,
            method: payload.method || 'QR_SCAN'
          }
        });

        nextStatus = 'BORROWED';
        eventNote = `Physical handover confirmed via ${payload.method || 'QR_SCAN'}`;

        // Notify Lender
        await tx.notification.create({
          data: {
            userId: lockedRow.lenderId,
            type: 'HANDOVER_CONFIRMED',
            title: 'Item Handover Confirmed!',
            body: 'Borrower successfully scanned your handover QR code. Transaction is now active.',
            link: `/transactions/${transactionId}`
          }
        });
        break;
      }

      case 'CANCEL_TRANSACTION': {
        if (!['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING'].includes(currentStatus)) {
          const error = new Error('Cannot cancel transaction after item has been physically handed over.');
          error.status = 400;
          throw error;
        }

        nextStatus = 'CANCELLED';
        eventNote = payload.reason || `Cancelled by ${isLender ? 'lender' : 'borrower'}`;

        // If Lender cancels after accepting, apply trust penalty (-10)
        if (isLender) {
          await tx.trustEvent.create({
            data: {
              userId: lockedRow.lenderId,
              roleContext: 'LENDER',
              eventType: 'LEND_CANCEL_AFTER_ACCEPT',
              delta: -10,
              transactionId
            }
          });
        }
        break;
      }

      case 'INITIATE_RETURN': {
        if (!['BORROWED', 'OVERDUE'].includes(currentStatus)) {
          if (currentStatus === 'RETURN_PENDING') {
            return await getEnrichedTransaction(tx, transactionId);
          }
          const error = new Error(`Cannot initiate return when transaction is ${currentStatus}.`);
          error.status = 400;
          throw error;
        }

        if (!isBorrower && !isLender && !isStaff) {
          const error = new Error('Only the transaction participants can initiate return.');
          error.status = 403;
          throw error;
        }

        nextStatus = 'RETURN_PENDING';
        eventNote = payload.note || `Return initiated by ${isBorrower ? 'borrower' : 'lender'}`;

        await tx.notification.create({
          data: {
            userId: isBorrower ? lockedRow.lenderId : lockedRow.borrowerId,
            type: 'RETURN_INITIATED',
            title: 'Return Meeting Requested',
            body: `${actor.name || 'Your peer'} has requested to meet and return the item.`,
            link: `/transactions/${transactionId}`
          }
        });
        break;
      }

      case 'CONFIRM_RETURN': {
        if (!['RETURN_PENDING', 'BORROWED', 'OVERDUE', 'RETURNED'].includes(currentStatus)) {
          if (currentStatus === 'COMPLETED') {
            return await getEnrichedTransaction(tx, transactionId);
          }
          const error = new Error(`Cannot confirm return when transaction is ${currentStatus}.`);
          error.status = 400;
          throw error;
        }

        // Only lender (item owner) can confirm return receipt & deposit release
        if (!isLender && !isStaff) {
          const error = new Error('Only the lender can confirm physical return and release the deposit.');
          error.status = 403;
          throw error;
        }

        nextStatus = 'COMPLETED';
        eventNote = 'Item returned in good condition. Offline security deposit released.';

        const fullTx = await tx.transaction.findUnique({
          where: { id: transactionId },
          select: { dueAt: true }
        });

        const isLate = fullTx && new Date() > new Date(fullTx.dueAt);

        // Update returnedAt & completedAt
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            returnedAt: new Date(),
            completedAt: new Date()
          }
        });

        // Close security agreement
        await tx.securityAgreement.updateMany({
          where: { transactionId },
          data: { status: 'CLOSED' }
        });

        // Award Trust Score Events
        // 1. Borrower Trust Events
        await tx.trustEvent.create({
          data: {
            userId: lockedRow.borrowerId,
            roleContext: 'BORROWER',
            eventType: 'BORROW_COMPLETE',
            delta: 8,
            transactionId
          }
        });

        if (!isLate) {
          await tx.trustEvent.create({
            data: {
              userId: lockedRow.borrowerId,
              roleContext: 'BORROWER',
              eventType: 'ON_TIME_RETURN',
              delta: 5,
              transactionId
            }
          });
        }

        // 2. Lender Trust Events
        await tx.trustEvent.create({
          data: {
            userId: lockedRow.lenderId,
            roleContext: 'LENDER',
            eventType: 'LEND_COMPLETE',
            delta: 10,
            transactionId
          }
        });

        await tx.trustEvent.create({
          data: {
            userId: lockedRow.lenderId,
            roleContext: 'LENDER',
            eventType: 'ON_TIME_RETURN',
            delta: 5,
            transactionId
          }
        });

        // Notifications to rate
        await tx.notification.createMany({
          data: [
            {
              userId: lockedRow.borrowerId,
              type: 'TRANSACTION_COMPLETED',
              title: 'Exchange Completed!',
              body: 'Your item return was confirmed. Please leave a rating for your lender.',
              link: `/transactions/${transactionId}`
            },
            {
              userId: lockedRow.lenderId,
              type: 'TRANSACTION_COMPLETED',
              title: 'Exchange Completed!',
              body: 'Your item is safely back. Please leave a rating for your borrower.',
              link: `/transactions/${transactionId}`
            }
          ]
        });
        break;
      }

      case 'MARK_OVERDUE': {
        if (currentStatus !== 'BORROWED') {
          return await getEnrichedTransaction(tx, transactionId);
        }

        nextStatus = 'OVERDUE';
        eventNote = 'Item passed its due date without return confirmation.';

        // Check if late penalty already applied
        const existingLateEvent = await tx.trustEvent.findFirst({
          where: {
            transactionId,
            userId: lockedRow.borrowerId,
            eventType: 'LATE_RETURN'
          }
        });

        if (!existingLateEvent) {
          await tx.trustEvent.create({
            data: {
              userId: lockedRow.borrowerId,
              roleContext: 'BORROWER',
              eventType: 'LATE_RETURN',
              delta: -6,
              transactionId
            }
          });
        }

        await tx.notification.create({
          data: {
            userId: lockedRow.borrowerId,
            type: 'ITEM_OVERDUE',
            title: 'Item Overdue Alert',
            body: 'Your borrowed item has passed its due date. Please return it to the lender immediately.',
            link: `/transactions/${transactionId}`
          }
        });
        break;
      }

      case 'OPEN_DISPUTE': {
        if (!['BORROWED', 'OVERDUE', 'RETURN_PENDING'].includes(currentStatus)) {
          const error = new Error(`Cannot open a dispute while transaction is in ${currentStatus} status.`);
          error.status = 400;
          throw error;
        }

        nextStatus = 'DISPUTED';
        eventNote = payload.note || 'Dispute opened by student.';

        const otherPartyId = isLender ? lockedRow.borrowerId : lockedRow.lenderId;
        await tx.notification.create({
          data: {
            userId: otherPartyId,
            type: 'DISPUTE_OPENED',
            title: 'Dispute Opened',
            body: 'A dispute has been filed regarding your transaction. Campus moderators have been notified.',
            link: `/transactions/${transactionId}`
          }
        });
        break;
      }

      case 'RESOLVE_DISPUTE': {
        if (currentStatus !== 'DISPUTED') {
          const error = new Error('Transaction is not in DISPUTED status.');
          error.status = 400;
          throw error;
        }

        if (!isStaff) {
          const error = new Error('Only campus administrators and moderators can resolve disputes.');
          error.status = 403;
          throw error;
        }

        nextStatus = 'RESOLVED';
        eventNote = payload.note || 'Dispute resolved by campus moderator.';

        await tx.notification.createMany({
          data: [
            {
              userId: lockedRow.borrowerId,
              type: 'DISPUTE_RESOLVED',
              title: 'Dispute Resolved',
              body: `Moderator resolution: ${eventNote}`,
              link: `/transactions/${transactionId}`
            },
            {
              userId: lockedRow.lenderId,
              type: 'DISPUTE_RESOLVED',
              title: 'Dispute Resolved',
              body: `Moderator resolution: ${eventNote}`,
              link: `/transactions/${transactionId}`
            }
          ]
        });
        break;
      }

      case 'CLOSE_RESOLVED': {
        if (currentStatus !== 'RESOLVED') {
          const error = new Error('Transaction is not in RESOLVED status.');
          error.status = 400;
          throw error;
        }

        nextStatus = 'COMPLETED';
        eventNote = 'Resolved transaction closed.';
        break;
      }

      case 'CANCEL_TRANSACTION': {
        if (!['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING'].includes(currentStatus)) {
          const error = new Error(`Cannot cancel transaction in ${currentStatus} status.`);
          error.status = 400;
          throw error;
        }

        nextStatus = 'CANCELLED';
        eventNote = payload.note || 'Transaction cancelled prior to handover.';
        break;
      }

      default: {
        const error = new Error(`Unknown state action: ${action}`);
        error.status = 400;
        throw error;
      }
    }


    // 3. Verify Allowed Transition
    if (nextStatus !== currentStatus) {
      const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(nextStatus)) {
        const error = new Error(`Invalid transition from ${currentStatus} to ${nextStatus}.`);
        error.status = 400;
        throw error;
      }

      // 4. Update status and increment version atomically
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: nextStatus,
          version: lockedRow.version + 1
        }
      });

      // 5. Append to Transaction Events Log
      const eventActorId = (actor.id && actor.id !== 'SYSTEM') ? actor.id : lockedRow.lenderId;
      await tx.transactionEvent.create({
        data: {
          transactionId,
          fromState: currentStatus,
          toState: nextStatus,
          actorId: eventActorId,
          note: eventNote
        }
      });



      logger.info({ transactionId, from: currentStatus, to: nextStatus, action, actorId: actor.id }, 'Transaction transition executed');
    }

    return await getEnrichedTransaction(tx, transactionId);
  });
};

/**
 * Fetch full transaction details with relations
 */
export const getEnrichedTransaction = async (txOrPrisma, transactionId) => {
  return await txOrPrisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      item: {
        include: {
          category: true,
          handoverPoint: true,
          photos: { where: { isPrimary: true }, take: 1 }
        }
      },
      lender: {
        select: { id: true, name: true, collegeEmail: true, department: true, year: true }
      },
      borrower: {
        select: { id: true, name: true, collegeEmail: true, department: true, year: true }
      },
      securityAgreement: true,
      conditionRecords: {
        orderBy: { createdAt: 'asc' },
        include: {
          creator: { select: { id: true, name: true } },
          acknowledger: { select: { id: true, name: true } }
        }
      },
      events: {
        orderBy: { at: 'asc' },
        include: {
          actor: { select: { id: true, name: true } }
        }
      },
      handoverRecords: true,
      ratings: true,
      disputes: {
        orderBy: { createdAt: 'desc' },
        include: {
          opener: { select: { id: true, name: true, collegeEmail: true } },
          resolver: { select: { id: true, name: true, collegeEmail: true } },
          evidence: true
        }
      }
    }
  });
};
