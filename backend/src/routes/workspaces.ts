import { Router } from 'express';
import { workspacesController } from '../controllers/workspaces';
import { authenticate } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { paramsIdSchema, paginationSchema } from '../validation/common';
import Joi from 'joi';

const router = Router();

// All workspace routes require authentication
router.use(authenticate);

const createWorkspaceSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).allow('')
});

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  description: Joi.string().trim().max(500).allow(''),
  settings: Joi.object({
    allowInvites: Joi.boolean(),
    defaultProjectVisibility: Joi.string().valid('private', 'workspace', 'public')
  })
});

const inviteMemberSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('owner', 'editor', 'viewer').default('editor')
});

const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('owner', 'editor', 'viewer').required()
});

const workspaceQuerySchema = paginationSchema.keys({
  search: Joi.string().trim().max(100).allow('')
});

const memberParamsSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  memberId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post('/', 
  validate(createWorkspaceSchema),
  workspacesController.createWorkspace
);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get user's workspaces
 *     tags: [Workspaces]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in workspace names and descriptions
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', 
  validateQuery(workspaceQuerySchema),
  workspacesController.getWorkspaces
);

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get workspace by ID
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace retrieved successfully
 *       404:
 *         description: Workspace not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id',
  validateParams(paramsIdSchema),
  workspacesController.getWorkspace
);

/**
 * @swagger
 * /workspaces/{id}:
 *   put:
 *     summary: Update workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
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
 *               settings:
 *                 type: object
 *                 properties:
 *                   allowInvites:
 *                     type: boolean
 *                   defaultProjectVisibility:
 *                     type: string
 *                     enum: [private, workspace, public]
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       404:
 *         description: Workspace not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id',
  validateParams(paramsIdSchema),
  validate(updateWorkspaceSchema),
  workspacesController.updateWorkspace
);

/**
 * @swagger
 * /workspaces/{id}:
 *   delete:
 *     summary: Delete workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       404:
 *         description: Workspace not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id',
  validateParams(paramsIdSchema),
  workspacesController.deleteWorkspace
);

/**
 * @swagger
 * /workspaces/{id}/members:
 *   post:
 *     summary: Invite member to workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
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
 *         description: Member invited successfully
 *       404:
 *         description: Workspace or user not found
 *       401:
 *         description: Authentication required
 */
router.post('/:id/members',
  validateParams(paramsIdSchema),
  validate(inviteMemberSchema),
  workspacesController.inviteMember
);

/**
 * @swagger
 * /workspaces/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove member from workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member user ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       404:
 *         description: Workspace or member not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id/members/:memberId',
  validateParams(memberParamsSchema),
  workspacesController.removeMember
);

/**
 * @swagger
 * /workspaces/{id}/members/{memberId}/role:
 *   put:
 *     summary: Update member role
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member user ID
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
 *         description: Member role updated successfully
 *       404:
 *         description: Workspace or member not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id/members/:memberId/role',
  validateParams(memberParamsSchema),
  validate(updateMemberRoleSchema),
  workspacesController.updateMemberRole
);

export default router;