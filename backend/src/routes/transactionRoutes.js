import express from 'express';
import {
  listTransactions,
  getTransaction,
  updateSecurityAgreement,
  acknowledgeSecurity,
  submitCondition,
  acknowledgeCondition,
  generateHandoverToken,
  confirmHandover,
  cancelTransaction,
  streamEvidence,
  initiateReturn,
  confirmReturn,
  submitRating
} from '../controllers/transactionController.js';
import { getTransactionMessages, postTransactionMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadMiddleware, validateMagicBytes } from '../middleware/upload.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listTransactions);
router.get('/:id', getTransaction);

// Security Agreement
router.patch('/:id/security', updateSecurityAgreement);
router.post('/:id/security/acknowledge', acknowledgeSecurity);

// Condition Evidence
router.post(
  '/:id/condition',
  uploadMiddleware.array('photos', 5),
  validateMagicBytes,
  submitCondition
);
router.post('/:id/condition/acknowledge', acknowledgeCondition);

// Handover Token & Confirm
router.post('/:id/handover/token', generateHandoverToken);
router.post('/:id/handover/confirm', confirmHandover);

// Return Flow
router.post('/:id/return/initiate', initiateReturn);
router.post('/:id/return/confirm', confirmReturn);

// Ratings & Reviews
router.post('/:id/rate', submitRating);

// Cancellation
router.post('/:id/cancel', cancelTransaction);

// Transaction In-App Chat
router.get('/:id/messages', getTransactionMessages);
router.post('/:id/messages', postTransactionMessage);

// Private Evidence Photos streaming
router.get('/:id/evidence/:filename', streamEvidence);

export default router;

