import { Router } from 'express';
import { projectsController } from '../controllers/projects';
import { authenticate } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { paramsIdSchema, paginationSchema } from '../validation/common';
import Joi from 'joi';

const router = Router();

// All project routes require authentication
router.use(authenticate);

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).allow(''),
  workspaceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  visibility: Joi.string().valid('private', 'workspace', 'public').default('workspace')
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  description: Joi.string().trim().max(500).allow(''),
  visibility: Joi.string().valid('private', 'workspace', 'public')
});

const addCollaboratorSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('owner', 'editor', 'viewer').default('viewer')
});

const updateCollaboratorRoleSchema = Joi.object({
  role: Joi.string().valid('owner', 'editor', 'viewer').required()
});

const projectQuerySchema = paginationSchema.keys({
  workspaceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  search: Joi.string().trim().max(100).allow('')
});

const collaboratorParamsSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  collaboratorId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - workspaceId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [private, workspace, public]
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post('/', 
  validate(createProjectSchema),
  projectsController.createProject
);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get user's projects
 *     tags: [Projects]
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
 *         name: workspaceId
 *         schema:
 *           type: string
 *         description: Filter by workspace ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in project names and descriptions
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', 
  validateQuery(projectQuerySchema),
  projectsController.getProjects
);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id',
  validateParams(paramsIdSchema),
  projectsController.getProject
);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [private, workspace, public]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id',
  validateParams(paramsIdSchema),
  validate(updateProjectSchema),
  projectsController.updateProject
);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id',
  validateParams(paramsIdSchema),
  projectsController.deleteProject
);

/**
 * @swagger
 * /projects/{id}/collaborators:
 *   post:
 *     summary: Add collaborator to project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [owner, editor, viewer]
 *     responses:
 *       200:
 *         description: Collaborator added successfully
 *       404:
 *         description: Project or user not found
 *       401:
 *         description: Authentication required
 */
router.post('/:id/collaborators',
  validateParams(paramsIdSchema),
  validate(addCollaboratorSchema),
  projectsController.addCollaborator
);

/**
 * @swagger
 * /projects/{id}/collaborators/{collaboratorId}:
 *   delete:
 *     summary: Remove collaborator from project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: collaboratorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collaborator user ID
 *     responses:
 *       200:
 *         description: Collaborator removed successfully
 *       404:
 *         description: Project or collaborator not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id/collaborators/:collaboratorId',
  validateParams(collaboratorParamsSchema),
  projectsController.removeCollaborator
);

/**
 * @swagger
 * /projects/{id}/collaborators/{collaboratorId}/role:
 *   put:
 *     summary: Update collaborator role
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: collaboratorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collaborator user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [owner, editor, viewer]
 *     responses:
 *       200:
 *         description: Collaborator role updated successfully
 *       404:
 *         description: Project or collaborator not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id/collaborators/:collaboratorId/role',
  validateParams(collaboratorParamsSchema),
  validate(updateCollaboratorRoleSchema),
  projectsController.updateCollaboratorRole
);

export default router;