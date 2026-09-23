import { getUserRewards, getLeaderboard } from '../services/rewardService.js';
import { sendSuccess } from '../utils/response.js';

export const getMyRewards = async (req, res, next) => {
  try {
    const rewards = await getUserRewards(req.user.id);
    return sendSuccess(res, rewards);
  } catch (err) {
    return next(err);
  }
};

export const getCampusLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '15', 10);
    const leaderboard = await getLeaderboard({ limit });
    return sendSuccess(res, { leaderboard });
  } catch (err) {
    return next(err);
  }
};
