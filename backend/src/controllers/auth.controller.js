import { checkDatabaseHealth } from '../config/database.js';
import { getUserProfile, syncUser } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const syncAuthenticatedUser = async (req, res, next) => {
  try {
    return sendSuccess(res, await syncUser(req.user), 200);
  } catch (error) {
    return next(error);
  }
};

export const getAuthenticatedUser = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.firebaseUid);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'User profile has not been synchronized.' },
      });
    }
    return sendSuccess(res, profile);
  } catch (error) {
    return next(error);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const database = await checkDatabaseHealth();
    return sendSuccess(res, {
      status: database.connected ? 'ok' : 'degraded',
      api: { connected: true },
      database: { connected: database.connected },
    });
  } catch (error) {
    return next(error);
  }
};
