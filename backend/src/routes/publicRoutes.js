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

export const DEFAULT_CATEGORIES = [
  { id: '00000000-0000-4000-8000-000000000001', name: 'Calculators', slug: 'calculators', icon: 'Calculator', typicalPriceInr: 1200 },
  { id: '00000000-0000-4000-8000-000000000002', name: 'Cables & Adapters', slug: 'cables-adapters', icon: 'Cable', typicalPriceInr: 450 },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Lab Gear', slug: 'lab-gear', icon: 'FlaskConical', typicalPriceInr: 600 },
  { id: '00000000-0000-4000-8000-000000000004', name: 'Stationery & Drawing', slug: 'stationery', icon: 'PenTool', typicalPriceInr: 350 },
  { id: '00000000-0000-4000-8000-000000000005', name: 'Electronics & Dev Boards', slug: 'electronics', icon: 'Cpu', typicalPriceInr: 1500 },
  { id: '00000000-0000-4000-8000-000000000006', name: 'Tripods & Cameras', slug: 'photography', icon: 'Camera', typicalPriceInr: 2200 },
  { id: '00000000-0000-4000-8000-000000000007', name: 'Sports Equipment', slug: 'sports', icon: 'Trophy', typicalPriceInr: 800 },
  { id: '00000000-0000-4000-8000-000000000008', name: 'Textbooks & Notes', slug: 'books', icon: 'BookOpen', typicalPriceInr: 750 },
  { id: '00000000-0000-4000-8000-000000000009', name: 'Others', slug: 'others', icon: 'MoreHorizontal', typicalPriceInr: 500 }
];

export const DEFAULT_CAMPUS_POINTS = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'Library Steps', zone: 'Central Campus', isActive: true },
  { id: '10000000-0000-4000-8000-000000000002', name: 'Main Gate', zone: 'North Entrance', isActive: true },
  { id: '10000000-0000-4000-8000-000000000003', name: 'Canteen', zone: 'Student Activity Center', isActive: true },
  { id: '10000000-0000-4000-8000-000000000004', name: 'Block A Lobby', zone: 'Academic Block A', isActive: true },
  { id: '10000000-0000-4000-8000-000000000005', name: 'Sports Pavilion', zone: 'Athletic Grounds', isActive: true },
  { id: '10000000-0000-4000-8000-000000000006', name: 'Others', zone: 'Custom Spot / Designated Location', isActive: true }
];

/**
 * GET /api/categories
 * List all categories with 'Others' placed at the end
 */
router.get('/categories', async (req, res, next) => {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    }).catch(() => []);

    if (!categories || categories.length === 0) {
      return sendSuccess(res, DEFAULT_CATEGORIES);
    }

    // Ensure 'Others' category is present
    const hasOthers = categories.some((c) => c.slug === 'others' || c.name.toLowerCase() === 'others');
    if (!hasOthers) {
      try {
        const othersCat = await prisma.category.upsert({
          where: { slug: 'others' },
          update: {},
          create: { name: 'Others', slug: 'others', icon: 'MoreHorizontal', typicalPriceInr: 500 }
        });
        categories.push(othersCat);
      } catch {
        categories.push(DEFAULT_CATEGORIES.find((c) => c.slug === 'others'));
      }
    }

    // Sort with 'Others' always at the end
    categories.sort((a, b) => {
      if (a.slug === 'others' || a.name.toLowerCase() === 'others') return 1;
      if (b.slug === 'others' || b.name.toLowerCase() === 'others') return -1;
      return a.name.localeCompare(b.name);
    });

    return sendSuccess(res, categories);
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/campus-points
 * List all campus handover points with 'Others' placed at the end
 */
router.get('/campus-points', async (req, res, next) => {
  try {
    let points = await prisma.campusPoint.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }).catch(() => []);

    if (!points || points.length === 0) {
      return sendSuccess(res, DEFAULT_CAMPUS_POINTS);
    }

    // Ensure 'Others' campus point is present
    const hasOthers = points.some((p) => p.name.toLowerCase() === 'others');
    if (!hasOthers) {
      try {
        const othersPt = await prisma.campusPoint.upsert({
          where: { name: 'Others' },
          update: {},
          create: { name: 'Others', zone: 'Custom Spot / Designated Location', isActive: true }
        });
        points.push(othersPt);
      } catch {
        points.push(DEFAULT_CAMPUS_POINTS.find((p) => p.name === 'Others'));
      }
    }

    // Sort with 'Others' always at the end
    points.sort((a, b) => {
      if (a.name.toLowerCase() === 'others') return 1;
      if (b.name.toLowerCase() === 'others') return -1;
      return a.name.localeCompare(b.name);
    });

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

