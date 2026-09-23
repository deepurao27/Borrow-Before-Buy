import express from 'express';
import {
  createRequest,
  listRequests,
  accept,
  reject,
  cancel
} from '../controllers/requestController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listRequests);
router.post('/items/:itemId', createRequest);
router.patch('/:id/accept', accept);
router.patch('/:id/reject', reject);
router.patch('/:id/cancel', cancel);

export default router;
