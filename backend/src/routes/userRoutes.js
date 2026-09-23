import express from 'express';
import { getDashboard, getMyProfile, getProfileById } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me/dashboard', requireAuth, getDashboard);
router.get('/me/profile', requireAuth, getMyProfile);
router.get('/:id/profile', getProfileById);

export default router;
