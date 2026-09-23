import { sendSuccess, sendError } from '../utils/response.js';
import { getUserDashboard, getUserPublicProfile } from '../services/dashboardService.js';

export const getDashboard = async (req, res, next) => {
  try {
    const dashboardData = await getUserDashboard(req.user.id);
    return sendSuccess(res, dashboardData);
  } catch (err) {
    return next(err);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getUserPublicProfile(req.user.id);
    return sendSuccess(res, profile);
  } catch (err) {
    return next(err);
  }
};

export const getProfileById = async (req, res, next) => {
  try {
    const profile = await getUserPublicProfile(req.params.id);
    return sendSuccess(res, profile);
  } catch (err) {
    return next(err);
  }
};
