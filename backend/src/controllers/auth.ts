import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, Workspace } from '../models';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError, ErrorCode, AuthTokens, UserRole } from '@clueso/shared';

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError({
          code: ErrorCode.CONFLICT,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      // Create default workspace for the user
      const defaultWorkspace = new Workspace({
        name: `${firstName}'s Workspace`,
        description: 'Your personal workspace',
        owner: user._id,
        members: [{
          user: user._id,
          role: UserRole.OWNER,
          joinedAt: new Date()
        }]
      });

      await defaultWorkspace.save();

      // Add workspace to user
      user.workspaces = [defaultWorkspace._id as any];
      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user._id.toString());

      logger.info(`User registered: ${email} with default workspace: ${defaultWorkspace._id}`);

      res.status(201).json({
        success: true,
        data: {
          user: user.toJSON(),
          tokens
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AppError({
          code: ErrorCode.AUTHENTICATION_ERROR,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError({
          code: ErrorCode.AUTHENTICATION_ERROR,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const tokens = this.generateTokens(user._id.toString());

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          tokens
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError({
          code: ErrorCode.AUTHENTICATION_ERROR,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: string };

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError({
          code: ErrorCode.AUTHENTICATION_ERROR,
          message: 'Invalid refresh token'
        });
      }

      // Generate new tokens
      const tokens = this.generateTokens(user._id.toString());

      res.json({
        success: true,
        data: { tokens },
        message: 'Tokens refreshed successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError({
          code: ErrorCode.AUTHENTICATION_ERROR,
          message: 'Invalid refresh token'
        }));
      }
      next(error);
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a production app, you might want to blacklist the token
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      res.json({
        success: true,
        data: { user: user.toJSON() }
      });
    } catch (error) {
      next(error);
    }
  }

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { firstName, lastName, avatar } = req.body;

      // Update user fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        data: { user: user.toJSON() },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Current password and new password are required'
        });
      }

      // Get user with password for comparison
      const userWithPassword = await User.findById(user._id).select('+password');
      if (!userWithPassword) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AppError({
          code: ErrorCode.AUTHENTICATION_ERROR,
          message: 'Current password is incorrect'
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Update password
      userWithPassword.password = newPassword;
      await userWithPassword.save();

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  private generateTokens(userId: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as SignOptions
    );

    return { accessToken, refreshToken };
  }
}

export const authController = new AuthController();