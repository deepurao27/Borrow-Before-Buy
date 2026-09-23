import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';

/**
 * Send a message within a transaction
 */
export const sendMessage = async ({ transactionId, senderId, content }) => {
  if (!content || !content.trim()) {
    const error = new Error('Message content cannot be empty.');
    error.status = 400;
    throw error;
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  const isLender = transaction.lenderId === senderId;
  const isBorrower = transaction.borrowerId === senderId;

  if (!isLender && !isBorrower) {
    const error = new Error('Only the lender or borrower can participate in this transaction chat.');
    error.status = 403;
    throw error;
  }

  const message = await prisma.message.create({
    data: {
      transactionId,
      senderId,
      content: content.trim()
    },
    include: {
      sender: {
        select: { id: true, name: true, collegeEmail: true }
      }
    }
  });

  // Notify recipient
  const recipientId = isLender ? transaction.borrowerId : transaction.lenderId;
  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: 'NEW_CHAT_MESSAGE',
      title: 'New Transaction Message',
      body: `${message.sender.name}: ${content.trim().substring(0, 60)}`,
      link: `/transactions/${transactionId}`
    }
  }).catch((err) => logger.warn({ err }, 'Failed to create chat notification'));

  return message;
};

/**
 * Get message history for a transaction and mark unread incoming as read
 */
export const getMessages = async (transactionId, userId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  const isLender = transaction.lenderId === userId;
  const isBorrower = transaction.borrowerId === userId;

  const messages = await prisma.message.findMany({
    where: { transactionId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: { id: true, name: true, collegeEmail: true }
      }
    }
  });

  // Mark messages from other user as read
  if (isLender || isBorrower) {
    await prisma.message.updateMany({
      where: {
        transactionId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });
  }

  return messages;
};
