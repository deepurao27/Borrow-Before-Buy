import express from 'express';
import { sendSuccess } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

const router = express.Router();

/**
 * GET /api/health
 * System health check
 */
router.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    app: 'Borrow Before Buy (BBB)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }, 'Service is healthy and running.');
});

/**
 * GET /api/public/stats
 * Real aggregate counts from database for the landing page
 */
router.get('/public/stats', async (req, res, next) => {
  try {
    const [totalItems, totalBorrows, activeStudents, categoriesCount] = await Promise.all([
      prisma.item.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
      prisma.user.count({ where: { accountStatus: 'ACTIVE', verifiedAt: { not: null } } }).catch(() => 0),
      prisma.category.count().catch(() => 0)
    ]);

    return sendSuccess(res, {
      totalItems,
      totalBorrows,
      activeStudents,
      categoriesCount
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/categories
 * List all categories
 */
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    }).catch(() => []);
    return sendSuccess(res, categories);
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/campus-points
 * List all campus handover points
 */
router.get('/campus-points', async (req, res, next) => {
  try {
    const points = await prisma.campusPoint.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }).catch(() => []);
    return sendSuccess(res, points);
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/evidence/:filename
 * Secure streaming of private condition evidence photos
 */
router.get('/evidence/:filename', async (req, res, next) => {
  try {
    const { requireAuth } = await import('../middleware/auth.js');
    return requireAuth(req, res, async () => {
      try {
        const { getEvidenceByFilename } = await import('../services/conditionService.js');
        const { fileBuffer, mimeType } = await getEvidenceByFilename(req.params.filename, req.user);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'private, max-age=86400');
        return res.send(fileBuffer);
      } catch (err) {
        return next(err);
      }
    });
  } catch (err) {
    return next(err);
  }
});

export default router;

