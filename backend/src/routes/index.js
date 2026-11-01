import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import ticketRoutes from './ticket.routes.js';
import organizationRoutes from './organization.routes.js';

const router = Router();

// Health routes mounted directly under /api (e.g., /api/health)
router.use('/', healthRoutes);
router.use('/', authRoutes);
router.use('/', ticketRoutes);
router.use('/', organizationRoutes);

export default router;
