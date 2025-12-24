import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models';
import { config } from '../config';
import { AppError, ErrorCode } from '@clueso/shared';

export interface AuthRequest extends Request {
  user?: UserDocument;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError({
        code: ErrorCode.AUTHENTICATION_ERROR,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId).populate('workspaces');
    
    if (!user) {
      throw new AppError({
        code: ErrorCode.AUTHENTICATION_ERROR,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId).populate('workspaces');
      req.user = user || undefined;
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};