import { getHealthData } from '../services/health.service.js';

/**
 * Controller to handle API health check requests.
 */
export const checkHealth = async (req, res, next) => {
  try {
    const healthInfo = await getHealthData();
    return res.status(200).json(healthInfo);
  } catch (error) {
    return next(error);
  }
};
