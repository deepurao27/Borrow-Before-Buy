import express from 'express';
import {
  openDispute,
  getDispute,
  listAllDisputes,
  resolveDisputeHandler
} from '../controllers/disputeController.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', openDispute);
router.get('/', requireStaff, listAllDisputes);
router.get('/:id', getDispute);
router.post('/:id/resolve', requireStaff, resolveDisputeHandler);

export default router;
