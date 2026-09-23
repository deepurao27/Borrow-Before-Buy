import express from 'express';
import { getMyRewards, getCampusLeaderboard } from '../controllers/rewardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/leaderboard', getCampusLeaderboard);
router.get('/me', requireAuth, getMyRewards);

export default router;
