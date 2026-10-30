import { getFirebaseAuth } from '../config/firebaseAdmin.js';

export const requireFirebaseAuth = async (req, res, next) => {
  const header = req.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'A Firebase Bearer token is required.' },
    });
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'A Firebase Bearer token is required.' },
    });
  }

  try {
    const decoded = await getFirebaseAuth().verifyIdToken(token);
    req.user = {
      firebaseUid: decoded.uid,
      email: decoded.email || null,
      displayName: decoded.name || null,
      avatarUrl: decoded.picture || null,
      claims: decoded,
    };
    return next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'The authentication token is invalid or expired.' },
      });
    }
    return next(error);
  }
};
