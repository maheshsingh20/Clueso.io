import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { aiController } from '../controllers/ai'

const router = Router()

// All AI routes require authentication
router.use(authenticate)

// Script enhancement
router.post('/enhance-script', aiController.enhanceScript)

// Voiceover generation
router.post('/generate-voiceover', aiController.generateVoiceover)

// Documentation generation
router.post('/videos/:videoId/generate-docs', aiController.generateDocumentation)

// Summary generation
router.post('/generate-summary', aiController.generateSummary)

// Video effects processing
router.post('/videos/:videoId/process-effects', aiController.processVideoEffects)

// Video style application
router.post('/videos/:videoId/apply-style', aiController.applyVideoStyle)

export default router