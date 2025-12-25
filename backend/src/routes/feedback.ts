import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { feedbackController } from '../controllers/feedback';
import Joi from 'joi';

const router = Router();

// All feedback routes require authentication
router.use(authenticate);

const submitFeedbackSchema = Joi.object({
  message: Joi.string().trim().min(10).max(1000).required(),
  type: Joi.string().valid('bug', 'feature', 'general', 'compliment').default('general'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium')
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'reviewing', 'resolved').required()
});

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Submit user feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               type:
 *                 type: string
 *                 enum: [bug, feature, general, compliment]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post('/', 
  (req, res, next) => {
    const { error } = submitFeedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    next();
  },
  feedbackController.submitFeedback
);

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Get feedback (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, reviewing, resolved]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bug, feature, general, compliment]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', feedbackController.getFeedback);

/**
 * @swagger
 * /feedback/stats:
 *   get:
 *     summary: Get feedback statistics (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/stats', feedbackController.getFeedbackStats);

/**
 * @swagger
 * /feedback/{id}/status:
 *   put:
 *     summary: Update feedback status (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, reviewing, resolved]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Feedback not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id/status',
  (req, res, next) => {
    const { error } = updateStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    next();
  },
  feedbackController.updateFeedbackStatus
);

export default router;