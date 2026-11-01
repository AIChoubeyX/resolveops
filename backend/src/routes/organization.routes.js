import { Router } from 'express';
import {
  acceptOrganizationInvitation,
  deleteMember,
  getMembers,
  getOrganizationSettings,
  postInvitation,
  updateMemberRole,
  updateOrganizationSettings,
} from '../controllers/organization.controller.js';
import { requireFirebaseAuth } from '../middleware/firebaseAuth.js';

const router = Router();

router.get('/organizations/:organizationId/settings', requireFirebaseAuth, getOrganizationSettings);
router.patch('/organizations/:organizationId/settings', requireFirebaseAuth, updateOrganizationSettings);
router.get('/organizations/:organizationId/members', requireFirebaseAuth, getMembers);
router.patch('/organizations/:organizationId/members/:userId', requireFirebaseAuth, updateMemberRole);
router.delete('/organizations/:organizationId/members/:userId', requireFirebaseAuth, deleteMember);
router.post('/organizations/:organizationId/invitations', requireFirebaseAuth, postInvitation);
router.post('/invitations/:token/accept', requireFirebaseAuth, acceptOrganizationInvitation);

export default router;
