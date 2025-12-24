import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { analyticsController } from '../controllers/analytics';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Analytics routes
router.get('/overview', analyticsController.getOverview);
router.get('/project/:projectId', analyticsController.getProjectAnalytics);
router.get('/video/:videoId', analyticsController.getVideoAnalytics);

export default router;