import { Router } from 'express';
import { getAuthenticatedUser, syncAuthenticatedUser } from '../controllers/auth.controller.js';
import { requireFirebaseAuth } from '../middleware/firebaseAuth.js';

const router = Router();

router.post('/auth/sync', requireFirebaseAuth, syncAuthenticatedUser);
router.get('/auth/me', requireFirebaseAuth, getAuthenticatedUser);

export default router;
