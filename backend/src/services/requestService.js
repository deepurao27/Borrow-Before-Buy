import { prisma } from '../config/prisma.js';

export const createBorrowRequest = async (borrowerId, itemId, { requestedStart, requestedEnd, message }) => {
  const item = await prisma.item.findUnique({
    where: { id: itemId }
  });

  if (!item) {
    const error = new Error('Item not found.');
    error.status = 404;
    throw error;
  }

  if (item.status !== 'ACTIVE') {
    const error = new Error('This item is currently not available for borrowing.');
    error.status = 400;
    throw error;
  }

  // Non-negotiable: Cannot borrow your own item
  if (item.ownerId === borrowerId) {
    const error = new Error('You cannot borrow your own item.');
    error.status = 400;
    throw error;
  }

  const start = new Date(requestedStart);
  const end = new Date(requestedEnd);

  // Check for existing overlapping active transactions
  const overlappingTx = await prisma.transaction.findFirst({
    where: {
      itemId,
      status: { in: ['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING', 'BORROWED', 'OVERDUE', 'RETURN_PENDING'] },
      AND: [
        { startAt: { lt: end } },
        { dueAt: { gt: start } }
      ]
    }
  });

  if (overlappingTx) {
    const error = new Error('This item already has an active borrow booking during these requested dates.');
    error.status = 409;
    throw error;
  }

  // Check if borrower already has a pending request for this item
  const existingPending = await prisma.borrowRequest.findFirst({
    where: {
      itemId,
      borrowerId,
      status: 'PENDING'
    }
  });

  if (existingPending) {
    const error = new Error('You already have a pending borrow request for this item.');
    error.status = 400;
    throw error;
  }

  const request = await prisma.borrowRequest.create({
    data: {
      itemId,
      borrowerId,
      requestedStart: start,
      requestedEnd: end,
      message: message ? message.trim() : null,
      status: 'PENDING'
    },
    include: {
      item: { select: { id: true, title: true, securityAmount: true } },
      borrower: { select: { id: true, name: true, department: true } }
    }
  });

  // Create notification for lender
  await prisma.notification.create({
    data: {
      userId: item.ownerId,
      type: 'NEW_BORROW_REQUEST',
      title: 'New Borrow Request',
      body: `${request.borrower.name} requested to borrow "${item.title}".`,
      link: `/requests`
    }
  });

  return request;
};

export const getUserRequests = async (userId, type = 'all') => {
  const where = {};

  if (type === 'sent') {
    where.borrowerId = userId;
  } else if (type === 'received') {
    where.item = { ownerId: userId };
  } else {
    where.OR = [
      { borrowerId: userId },
      { item: { ownerId: userId } }
    ];
  }

  const requests = await prisma.borrowRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      item: {
        include: {
          photos: { where: { isPrimary: true }, take: 1 },
          handoverPoint: true
        }
      },
      borrower: {
        select: {
          id: true,
          name: true,
          department: true,
          year: true
        }
      },
      transaction: {
        select: {
          id: true,
          status: true
        }
      }
    }
  });

  return requests;
};

export const acceptRequest = async (lenderId, requestId) => {
  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
    include: { item: true, borrower: true }
  });

  if (!request) {
    const error = new Error('Borrow request not found.');
    error.status = 404;
    throw error;
  }

  if (request.item.ownerId !== lenderId) {
    const error = new Error('Only the item owner can accept this request.');
    error.status = 403;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error(`Cannot accept request that is already ${request.status.toLowerCase()}.`);
    error.status = 400;
    throw error;
  }

  // Concurrency check for overlapping active transaction
  const overlappingTx = await prisma.transaction.findFirst({
    where: {
      itemId: request.itemId,
      status: { in: ['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING', 'BORROWED', 'OVERDUE', 'RETURN_PENDING'] },
      AND: [
        { startAt: { lt: request.requestedEnd } },
        { dueAt: { gt: request.requestedStart } }
      ]
    }
  });

  if (overlappingTx) {
    const error = new Error('Cannot accept: item is already committed to another transaction for overlapping dates.');
    error.status = 409;
    throw error;
  }

  // Atomic creation of transaction, security agreement, and request status update
  const result = await prisma.$transaction(async (tx) => {
    // Update request status
    await tx.borrowRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    // Create Transaction in ACCEPTED state
    const transaction = await tx.transaction.create({
      data: {
        requestId: request.id,
        itemId: request.itemId,
        lenderId: request.item.ownerId,
        borrowerId: request.borrowerId,
        status: 'ACCEPTED',
        startAt: request.requestedStart,
        dueAt: request.requestedEnd,
        version: 1
      }
    });

    // Create Initial Offline Security Agreement
    await tx.securityAgreement.create({
      data: {
        transactionId: transaction.id,
        securityAmount: request.item.securityAmount,
        status: 'PENDING'
      }
    });

    // Create Transaction Event
    await tx.transactionEvent.create({
      data: {
        transactionId: transaction.id,
        fromState: 'ACCEPTED',
        toState: 'ACCEPTED',
        actorId: lenderId,
        note: 'Lender accepted borrow request'
      }
    });

    // Automatically reject any other pending requests for this item that overlap
    await tx.borrowRequest.updateMany({
      where: {
        itemId: request.itemId,
        id: { not: requestId },
        status: 'PENDING',
        AND: [
          { requestedStart: { lt: request.requestedEnd } },
          { requestedEnd: { gt: request.requestedStart } }
        ]
      },
      data: { status: 'REJECTED' }
    });

    // Notify Borrower
    await tx.notification.create({
      data: {
        userId: request.borrowerId,
        type: 'REQUEST_ACCEPTED',
        title: 'Request Accepted!',
        body: `Your request to borrow "${request.item.title}" was accepted. Please review and acknowledge the offline security agreement.`,
        link: `/transactions/${transaction.id}`
      }
    });

    return transaction;
  });

  return result;
};

export const rejectRequest = async (lenderId, requestId) => {
  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId },
    include: { item: true }
  });

  if (!request) {
    const error = new Error('Borrow request not found.');
    error.status = 404;
    throw error;
  }

  if (request.item.ownerId !== lenderId) {
    const error = new Error('Only the item owner can reject this request.');
    error.status = 403;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error(`Cannot reject request that is already ${request.status.toLowerCase()}.`);
    error.status = 400;
    throw error;
  }

  await prisma.borrowRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });

  await prisma.notification.create({
    data: {
      userId: request.borrowerId,
      type: 'REQUEST_REJECTED',
      title: 'Borrow Request Declined',
      body: `Your request to borrow "${request.item.title}" was declined by the owner.`,
      link: `/requests`
    }
  });

  return { message: 'Borrow request has been rejected.' };
};

export const cancelRequest = async (borrowerId, requestId) => {
  const request = await prisma.borrowRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    const error = new Error('Borrow request not found.');
    error.status = 404;
    throw error;
  }

  if (request.borrowerId !== borrowerId) {
    const error = new Error('You can only cancel your own requests.');
    error.status = 403;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error(`Cannot cancel request that is already ${request.status.toLowerCase()}.`);
    error.status = 400;
    throw error;
  }

  await prisma.borrowRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED' }
  });

  return { message: 'Borrow request cancelled.' };
};
