import { Router } from 'express';
import { videosController } from '../controllers/videos';
import { authenticate } from '../middleware/auth';
import { validateParams, validateQuery } from '../middleware/validation';
import { paramsIdSchema, paginationSchema } from '../validation/common';
import Joi from 'joi';

const router = Router();

// All video routes require authentication
router.use(authenticate);

const createVideoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(1000).allow(''),
  projectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

const updateVideoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().max(1000).allow('')
});

const regenerateVideoSchema = Joi.object({
  stage: Joi.string().valid(
    'extract_audio',
    'transcribe', 
    'enhance_script',
    'generate_voiceover',
    'detect_scenes',
    'generate_captions',
    'render_video'
  ).required()
});

const videoQuerySchema = paginationSchema.keys({
  projectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  status: Joi.string().valid('uploading', 'processing', 'ready', 'error')
});

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Upload and create a new video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *               - title
 *               - projectId
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               projectId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post('/', 
  videosController.uploadMiddleware,
  (req, res, next) => {
    const { error } = createVideoSchema.validate(req.body);
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
  videosController.createVideo
);

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get user's videos
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [uploading, processing, ready, error]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', 
  validateQuery(videoQuerySchema),
  videosController.getVideos
);

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *       404:
 *         description: Video not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id',
  validateParams(paramsIdSchema),
  videosController.getVideo
);

/**
 * @swagger
 * /videos/{id}:
 *   put:
 *     summary: Update video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       404:
 *         description: Video not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id',
  validateParams(paramsIdSchema),
  (req, res, next) => {
    const { error } = updateVideoSchema.validate(req.body);
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
  videosController.updateVideo
);

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Delete video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id',
  validateParams(paramsIdSchema),
  videosController.deleteVideo
);

/**
 * @swagger
 * /videos/{id}/progress:
 *   get:
 *     summary: Get video processing progress
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *       404:
 *         description: Video not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id/progress',
  validateParams(paramsIdSchema),
  videosController.getVideoProgress
);

/**
 * @swagger
 * /videos/{id}/regenerate:
 *   post:
 *     summary: Regenerate video from specific stage
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stage
 *             properties:
 *               stage:
 *                 type: string
 *                 enum: [extract_audio, transcribe, enhance_script, generate_voiceover, detect_scenes, generate_captions, render_video]
 *     responses:
 *       200:
 *         description: Regeneration started successfully
 *       404:
 *         description: Video not found
 *       401:
 *         description: Authentication required
 */
router.post('/:id/regenerate',
  validateParams(paramsIdSchema),
  (req, res, next) => {
    const { error } = regenerateVideoSchema.validate(req.body);
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
  videosController.regenerateVideo
);

export default router;