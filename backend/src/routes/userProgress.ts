import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { userProgressController } from '../controllers/userProgress'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get user progress
router.get('/', userProgressController.getUserProgress)

// Update onboarding step
router.put('/onboarding', userProgressController.updateOnboardingStep)

// Complete tutorial
router.post('/tutorial/complete', userProgressController.completeTutorial)

// Update preferences
router.put('/preferences', userProgressController.updatePreferences)

// Get tutorials
router.get('/tutorials', userProgressController.getTutorials)

// Get help articles
router.get('/help', userProgressController.getHelpArticles)

export default router