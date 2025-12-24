import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError, ErrorCode } from '@clueso/shared';
import { config } from '../config';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle known AppError instances
  if (error instanceof AppError) {
    return res.status(getStatusCode(error.code as ErrorCode)).json({
      success: false,
      error: error.message,
      code: error.code,
      ...(config.isDevelopment && { details: error.details })
    });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      code: ErrorCode.VALIDATION_ERROR,
      details: Object.values((error as any).errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }))
    });
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
      code: ErrorCode.CONFLICT
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: ErrorCode.AUTHENTICATION_ERROR
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: ErrorCode.AUTHENTICATION_ERROR
    });
  }

  // Handle Multer errors
  if (error.name === 'MulterError') {
    let message = 'File upload error';
    if ((error as any).code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if ((error as any).code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    }
    
    return res.status(400).json({
      success: false,
      error: message,
      code: ErrorCode.VALIDATION_ERROR
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: config.isDevelopment ? error.message : 'Internal server error',
    code: ErrorCode.INTERNAL_ERROR,
    ...(config.isDevelopment && { stack: error.stack })
  });
};

const getStatusCode = (errorCode: ErrorCode): number => {
  switch (errorCode) {
    case ErrorCode.VALIDATION_ERROR:
      return 400;
    case ErrorCode.AUTHENTICATION_ERROR:
      return 401;
    case ErrorCode.AUTHORIZATION_ERROR:
      return 403;
    case ErrorCode.NOT_FOUND:
      return 404;
    case ErrorCode.CONFLICT:
      return 409;
    case ErrorCode.PROCESSING_ERROR:
      return 422;
    default:
      return 500;
  }
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: ErrorCode.NOT_FOUND
  });
};