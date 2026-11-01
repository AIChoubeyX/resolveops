import { Router } from 'express';
import {
  getActivity,
  getComments,
  getOneTicket,
  getOrganizationMetrics,
  getOrganizationTickets,
  getOrganizations,
  patchTicket,
  postComment,
  postOrganizationTicket,
} from '../controllers/ticket.controller.js';
import { requireFirebaseAuth } from '../middleware/firebaseAuth.js';

const router = Router();

router.get('/organizations', requireFirebaseAuth, getOrganizations);
router.get('/organizations/:organizationId/metrics', requireFirebaseAuth, getOrganizationMetrics);
router.get('/organizations/:organizationId/tickets', requireFirebaseAuth, getOrganizationTickets);
router.post('/organizations/:organizationId/tickets', requireFirebaseAuth, postOrganizationTicket);
router.get('/tickets/:ticketId', requireFirebaseAuth, getOneTicket);
router.patch('/tickets/:ticketId', requireFirebaseAuth, patchTicket);
router.post('/tickets/:ticketId/comments', requireFirebaseAuth, postComment);
router.get('/tickets/:ticketId/comments', requireFirebaseAuth, getComments);
router.get('/tickets/:ticketId/activity', requireFirebaseAuth, getActivity);

export default router;
