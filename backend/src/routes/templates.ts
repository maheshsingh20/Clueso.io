import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { templatesController } from '../controllers/templates';

const router = Router();

// All template routes require authentication
router.use(authenticate);

// Get all templates with filtering and pagination
router.get('/', templatesController.getTemplates);

// Get featured templates
router.get('/featured', templatesController.getFeaturedTemplates);

// Get popular templates
router.get('/popular', templatesController.getPopularTemplates);

// Get single template
router.get('/:id', templatesController.getTemplate);

// Use template (create project from template)
router.post('/:id/use', templatesController.useTemplate);

// Rate template
router.post('/:id/rate', templatesController.rateTemplate);

export default router;