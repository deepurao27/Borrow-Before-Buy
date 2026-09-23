import express from 'express';
import { getTransactionMessages, postTransactionMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', getTransactionMessages);
router.post('/', postTransactionMessage);

export default router;
