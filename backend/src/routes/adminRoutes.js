import express from 'express';
import {
  getAdminStats,
  listUsers,
  setUserAccountStatus,
  setItemStatus,
  listReports
} from '../controllers/adminController.js';
import { listAllDisputes, resolveDisputeHandler } from '../controllers/disputeController.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireStaff);

router.get('/stats', getAdminStats);
router.get('/users', listUsers);
router.patch('/users/:userId/status', setUserAccountStatus);
router.patch('/items/:itemId/status', setItemStatus);
router.get('/disputes', listAllDisputes);
router.post('/disputes/:id/resolve', resolveDisputeHandler);
router.get('/reports', listReports);

export default router;
