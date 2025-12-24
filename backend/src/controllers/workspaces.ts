import { Response, NextFunction } from 'express';
import { Workspace, User } from '../models';
import { AuthRequest } from '../middleware';
import { logger } from '../utils/logger';
import { AppError, ErrorCode, UserRole } from '@clueso/shared';

export class WorkspacesController {
  async createWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const userId = req.user!._id;

      // Create workspace
      const workspace = new Workspace({
        name,
        description,
        owner: userId,
        members: [{
          user: userId,
          role: UserRole.OWNER,
          joinedAt: new Date()
        }]
      });

      await workspace.save();

      // Add workspace to user
      await User.findByIdAndUpdate(userId, {
        $push: { workspaces: workspace._id }
      });

      logger.info(`Workspace created: ${workspace._id} by user: ${req.user!.email}`);

      res.status(201).json({
        success: true,
        data: { workspace },
        message: 'Workspace created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaces(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const userId = req.user!._id;

      // Build query - user must be owner or member
      const query: any = {
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      };

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
      const workspaces = await Workspace.find(query)
        .populate('owner', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email')
        .populate('projects', 'name description')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Workspace.countDocuments(query);

      // If user has no workspaces, create a default one
      if (total === 0 && !search) {
        const user = req.user!;
        const defaultWorkspace = new Workspace({
          name: `${user.firstName}'s Workspace`,
          description: 'Your personal workspace',
          owner: userId,
          members: [{
            user: userId,
            role: UserRole.OWNER,
            joinedAt: new Date()
          }]
        });

        await defaultWorkspace.save();

        // Add workspace to user
        await User.findByIdAndUpdate(userId, {
          $push: { workspaces: defaultWorkspace._id }
        });

        logger.info(`Default workspace created for existing user: ${user.email}`);

        // Return the newly created workspace
        const populatedWorkspace = await Workspace.findById(defaultWorkspace._id)
          .populate('owner', 'firstName lastName email')
          .populate('members.user', 'firstName lastName email')
          .populate('projects', 'name description');

        return res.json({
          success: true,
          data: {
            data: [populatedWorkspace],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 1,
              pages: 1
            }
          }
        });
      }

      res.json({
        success: true,
        data: {
          data: workspaces,
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

  async getWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const workspace = await Workspace.findById(id)
        .populate('owner', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email')
        .populate('projects');

      if (!workspace) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Workspace not found'
        });
      }

      // Check access permissions
      const hasAccess = workspace.owner.toString() === userId.toString() ||
        workspace.members.some(m => m.user.toString() === userId.toString());

      if (!hasAccess) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Access denied to this workspace'
        });
      }

      res.json({
        success: true,
        data: { workspace }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, settings } = req.body;
      const userId = req.user!._id;

      const workspace = await Workspace.findById(id);
      if (!workspace) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Workspace not found'
        });
      }

      // Check if user is owner or has admin role
      const isOwner = workspace.owner.toString() === userId.toString();
      const member = workspace.members.find(m => m.user.toString() === userId.toString());
      const canEdit = isOwner || (member && member.role === UserRole.OWNER);

      if (!canEdit) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Insufficient permissions to edit this workspace'
        });
      }

      // Update fields
      if (name !== undefined) workspace.name = name;
      if (description !== undefined) workspace.description = description;
      if (settings !== undefined && isOwner) workspace.settings = { ...workspace.settings, ...settings };

      await workspace.save();

      logger.info(`Workspace updated: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        data: { workspace },
        message: 'Workspace updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const workspace = await Workspace.findById(id);
      if (!workspace) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Workspace not found'
        });
      }

      // Only owner can delete workspace
      if (workspace.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the workspace owner can delete it'
        });
      }

      // Remove workspace from all members
      const memberIds = workspace.members.map(m => m.user);
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $pull: { workspaces: workspace._id } }
      );

      // Delete workspace
      await Workspace.findByIdAndDelete(id);

      logger.info(`Workspace deleted: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Workspace deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, role = UserRole.EDITOR } = req.body;
      const userId = req.user!._id;

      const workspace = await Workspace.findById(id);
      if (!workspace) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Workspace not found'
        });
      }

      // Check if user can invite (owner or admin)
      const isOwner = workspace.owner.toString() === userId.toString();
      const member = workspace.members.find(m => m.user.toString() === userId.toString());
      const canInvite = isOwner || (member && member.role === UserRole.OWNER);

      if (!canInvite) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Insufficient permissions to invite members'
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

      // Check if user is already a member
      const existingMember = workspace.members.find(
        m => m.user.toString() === user._id.toString()
      );

      if (existingMember) {
        throw new AppError({
          code: ErrorCode.CONFLICT,
          message: 'User is already a member of this workspace'
        });
      }

      // Add member to workspace
      workspace.members.push({
        user: user._id as any,
        role,
        joinedAt: new Date()
      });

      await workspace.save();

      // Add workspace to user
      await User.findByIdAndUpdate(user._id, {
        $push: { workspaces: workspace._id }
      });

      logger.info(`Member invited to workspace: ${id}, user: ${email}`);

      res.json({
        success: true,
        data: { workspace },
        message: 'Member invited successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params;
      const userId = req.user!._id;

      const workspace = await Workspace.findById(id);
      if (!workspace) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Workspace not found'
        });
      }

      // Check if user can remove members (owner only)
      if (workspace.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the workspace owner can remove members'
        });
      }

      // Cannot remove owner
      if (memberId === workspace.owner.toString()) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Cannot remove workspace owner'
        });
      }

      // Remove member from workspace
      workspace.members = workspace.members.filter(
        m => m.user.toString() !== memberId
      );

      await workspace.save();

      // Remove workspace from user
      await User.findByIdAndUpdate(memberId, {
        $pull: { workspaces: workspace._id }
      });

      logger.info(`Member removed from workspace: ${id}, user: ${memberId}`);

      res.json({
        success: true,
        data: { workspace },
        message: 'Member removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params;
      const { role } = req.body;
      const userId = req.user!._id;

      const workspace = await Workspace.findById(id);
      if (!workspace) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Workspace not found'
        });
      }

      // Only owner can update member roles
      if (workspace.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the workspace owner can update member roles'
        });
      }

      // Cannot change owner role
      if (memberId === workspace.owner.toString()) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Cannot change workspace owner role'
        });
      }

      // Find and update member
      const member = workspace.members.find(
        m => m.user.toString() === memberId
      );

      if (!member) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Member not found'
        });
      }

      member.role = role;
      await workspace.save();

      logger.info(`Member role updated in workspace: ${id}, user: ${memberId}, role: ${role}`);

      res.json({
        success: true,
        data: { workspace },
        message: 'Member role updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workspacesController = new WorkspacesController();