import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { globalSearch } from '../controllers/search'

const router = Router()

// All search routes require authentication
router.use(authenticate)

// Global search endpoint
router.get('/', globalSearch)

export default router