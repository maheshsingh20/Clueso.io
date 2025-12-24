import { Response, NextFunction } from 'express';
import { Project, Workspace, User } from '../models';
import { AuthRequest } from '../middleware';
import { logger } from '../utils/logger';
import { AppError, ErrorCode, UserRole, ProjectVisibility } from '@clueso/shared';

export class ProjectsController {
  async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, workspaceId, visibility = ProjectVisibility.WORKSPACE } = req.body;
      const userId = req.user!._id;

      logger.info(`Creating project: ${name}, workspace: ${workspaceId}, visibility: ${visibility}, user: ${userId}`);

      // Verify workspace exists and user has access
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Workspace not found'
        });
      }

      // Check if user is workspace member
      const isMember = workspace.owner.toString() === userId.toString() ||
        workspace.members.some(m => m.user.toString() === userId.toString());

      logger.info(`Workspace membership check: workspace owner: ${workspace.owner}, user: ${userId}, isMember: ${isMember}`);

      if (!isMember) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Access denied to this workspace'
        });
      }

      // Create project
      const project = new Project({
        name,
        description,
        workspace: workspaceId,
        owner: userId,
        visibility
      });

      await project.save();

      // Add project to workspace
      workspace.projects.push(project._id as any);
      await workspace.save();

      logger.info(`Project created successfully: ${project._id} by user: ${req.user!.email}, visibility: ${project.visibility}`);

      res.status(201).json({
        success: true,
        data: { project },
        message: 'Project created successfully'
      });
    } catch (error) {
      logger.error(`Project creation failed: ${error}`);
      next(error);
    }
  }

  async getProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, workspaceId, search } = req.query;
      const userId = req.user!._id;

      // First, get all workspaces where user is a member
      const userWorkspaces = await Workspace.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }).select('_id');

      const workspaceIds = userWorkspaces.map(w => w._id);

      // Build query - user must be owner, collaborator, or workspace member for WORKSPACE visibility projects
      const query: any = {
        $or: [
          { owner: userId },
          { 'collaborators.user': userId },
          { 
            visibility: ProjectVisibility.WORKSPACE,
            workspace: { $in: workspaceIds }
          },
          { visibility: ProjectVisibility.PUBLIC }
        ]
      };

      if (workspaceId) {
        query.workspace = workspaceId;
      }

      if (search) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        });
      }

      // Execute query with pagination
      const projects = await Project.find(query)
        .populate('workspace', 'name')
        .populate('owner', 'firstName lastName email')
        .populate('collaborators.user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Project.countDocuments(query);

      res.json({
        success: true,
        data: {
          data: projects,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const project = await Project.findById(id)
        .populate('workspace', 'name owner members')
        .populate('owner', 'firstName lastName email')
        .populate('collaborators.user', 'firstName lastName email')
        .populate('videos')
        .populate('documents');

      if (!project) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Project not found'
        });
      }

      // Check access permissions based on project visibility
      let hasAccess = false;
      let accessReason = '';

      // Direct owner access (works for all visibility types)
      if (project.owner.toString() === userId.toString()) {
        hasAccess = true;
        accessReason = 'owner';
      }
      // Collaborator access (works for all visibility types)
      else if (project.collaborators.some(c => c.user.toString() === userId.toString())) {
        hasAccess = true;
        accessReason = 'collaborator';
      }
      // For PRIVATE projects, only owner and collaborators have access
      else if (project.visibility === ProjectVisibility.PRIVATE) {
        // Already checked owner and collaborators above
        hasAccess = false;
        accessReason = 'private_no_access';
      }
      // Workspace-level access for WORKSPACE visibility projects
      else if (project.visibility === ProjectVisibility.WORKSPACE && project.workspace) {
        const workspace = project.workspace as any;
        const isWorkspaceMember = workspace.owner.toString() === userId.toString() ||
          workspace.members.some((m: any) => m.user.toString() === userId.toString());
        
        if (isWorkspaceMember) {
          hasAccess = true;
          accessReason = 'workspace_member';
        } else {
          accessReason = 'workspace_not_member';
        }
      }
      // Public projects are accessible to everyone
      else if (project.visibility === ProjectVisibility.PUBLIC) {
        hasAccess = true;
        accessReason = 'public';
      }

      logger.info(`Project access check: ${id}, user: ${userId}, hasAccess: ${hasAccess}, reason: ${accessReason}, visibility: ${project.visibility}, owner: ${project.owner}`);

      if (!hasAccess) {
        logger.warn(`Access denied to project: ${id}, user: ${userId}, project owner: ${project.owner}, visibility: ${project.visibility}, workspace: ${project.workspace}`);
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Access denied to this project'
        });
      }

      res.json({
        success: true,
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, visibility } = req.body;
      const userId = req.user!._id;

      const project = await Project.findById(id);
      if (!project) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Project not found'
        });
      }

      // Check if user is owner or has editor role
      const isOwner = project.owner.toString() === userId.toString();
      const collaborator = project.collaborators.find(c => c.user.toString() === userId.toString());
      const canEdit = isOwner || (collaborator && collaborator.role === UserRole.EDITOR);

      if (!canEdit) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Insufficient permissions to edit this project'
        });
      }

      // Update fields
      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;
      if (visibility !== undefined && isOwner) project.visibility = visibility;

      await project.save();

      logger.info(`Project updated: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        data: { project },
        message: 'Project updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const project = await Project.findById(id);
      if (!project) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Project not found'
        });
      }

      // Only owner can delete project
      if (project.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the project owner can delete it'
        });
      }

      // Remove project from workspace
      await Workspace.updateOne(
        { _id: project.workspace },
        { $pull: { projects: project._id } }
      );

      // Delete project
      await Project.findByIdAndDelete(id);

      logger.info(`Project deleted: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async addCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, role = UserRole.VIEWER } = req.body;
      const userId = req.user!._id;

      const project = await Project.findById(id);
      if (!project) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Project not found'
        });
      }

      // Only owner can add collaborators
      if (project.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the project owner can add collaborators'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'User not found'
        });
      }

      // Check if user is already a collaborator
      const existingCollaborator = project.collaborators.find(
        c => c.user.toString() === user._id.toString()
      );

      if (existingCollaborator) {
        throw new AppError({
          code: ErrorCode.CONFLICT,
          message: 'User is already a collaborator'
        });
      }

      // Add collaborator
      project.collaborators.push({
        user: user._id as any,
        role,
        addedAt: new Date()
      });

      await project.save();

      logger.info(`Collaborator added to project: ${id}, user: ${email}`);

      res.json({
        success: true,
        data: { project },
        message: 'Collaborator added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, collaboratorId } = req.params;
      const userId = req.user!._id;

      const project = await Project.findById(id);
      if (!project) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Project not found'
        });
      }

      // Only owner can remove collaborators
      if (project.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the project owner can remove collaborators'
        });
      }

      // Remove collaborator
      project.collaborators = project.collaborators.filter(
        c => c.user.toString() !== collaboratorId
      );

      await project.save();

      logger.info(`Collaborator removed from project: ${id}, user: ${collaboratorId}`);

      res.json({
        success: true,
        data: { project },
        message: 'Collaborator removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCollaboratorRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, collaboratorId } = req.params;
      const { role } = req.body;
      const userId = req.user!._id;

      const project = await Project.findById(id);
      if (!project) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Project not found'
        });
      }

      // Only owner can update collaborator roles
      if (project.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the project owner can update collaborator roles'
        });
      }

      // Find and update collaborator
      const collaborator = project.collaborators.find(
        c => c.user.toString() === collaboratorId
      );

      if (!collaborator) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Collaborator not found'
        });
      }

      collaborator.role = role;
      await project.save();

      logger.info(`Collaborator role updated in project: ${id}, user: ${collaboratorId}, role: ${role}`);

      res.json({
        success: true,
        data: { project },
        message: 'Collaborator role updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const projectsController = new ProjectsController();