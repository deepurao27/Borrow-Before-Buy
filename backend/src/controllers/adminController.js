import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { z } from 'zod';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalItems,
      activeItems,
      openDisputes,
      totalTransactions,
      completedTransactions,
      pendingReports
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.item.count({ where: { status: 'ACTIVE' } }),
      prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.report.count({ where: { status: 'PENDING' } })
    ]);

    return sendSuccess(res, {
      stats: {
        totalUsers,
        totalItems,
        activeItems,
        openDisputes,
        totalTransactions,
        completedTransactions,
        pendingReports
      }
    });
  } catch (err) {
    return next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const status = req.query.status;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (Math.max(1, page) - 1) * limit;

    const where = {};
    if (status) where.accountStatus = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { collegeEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          collegeEmail: true,
          department: true,
          year: true,
          role: true,
          accountStatus: true,
          verifiedAt: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return sendSuccess(res, {
      users,
      pagination: {
        total,
        page: Math.max(1, page),
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    return next(err);
  }
};

const userStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: z.string().optional()
});

export const setUserAccountStatus = async (req, res, next) => {
  try {
    const { status, reason } = userStatusSchema.parse(req.body);
    const targetUserId = req.params.userId;

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { accountStatus: status }
    });

    if (status === 'SUSPENDED') {
      // Invalidate refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId: targetUserId },
        data: { isRevoked: true }
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: `USER_${status}`,
        entityType: 'USER',
        entityId: targetUserId,
        metadata: { reason }
      }
    });

    return sendSuccess(res, { user }, `User status updated to ${status}.`);
  } catch (err) {
    return next(err);
  }
};

const itemStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'DISABLED', 'FROZEN']),
  reason: z.string().optional()
});

export const setItemStatus = async (req, res, next) => {
  try {
    const { status, reason } = itemStatusSchema.parse(req.body);
    const itemId = req.params.itemId;

    const item = await prisma.item.update({
      where: { id: itemId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: `ITEM_${status}`,
        entityType: 'ITEM',
        entityId: itemId,
        metadata: { reason }
      }
    });

    return sendSuccess(res, { item }, `Item status updated to ${status}.`);
  } catch (err) {
    return next(err);
  }
};

export const listReports = async (req, res, next) => {
  try {
    const status = req.query.status;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (Math.max(1, page) - 1) * limit;

    const where = status ? { status } : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, collegeEmail: true } }
        }
      }),
      prisma.report.count({ where })
    ]);

    return sendSuccess(res, {
      reports,
      pagination: {
        total,
        page: Math.max(1, page),
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    return next(err);
  }
};
