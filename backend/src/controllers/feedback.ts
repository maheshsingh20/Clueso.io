import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Server } from 'socket.io';
import { Feedback, IFeedback } from '../models/Feedback';

export interface FeedbackData {
  id: string;
  userId: string;
  userName: string;
  message: string;
  type: 'bug' | 'feature' | 'general' | 'compliment';
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  status: 'new' | 'reviewing' | 'resolved';
}

export class FeedbackController {
  async submitFeedback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, type = 'general', priority = 'medium' } = req.body;
      const userId = req.user!._id;
      const userName = `${req.user!.firstName} ${req.user!.lastName}`;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Feedback message is required'
        });
      }

      const feedback = new Feedback({
        userId,
        userName,
        message: message.trim(),
        type,
        priority,
        status: 'new'
      });

      await feedback.save();

      // Convert to response format
      const feedbackData: FeedbackData = {
        id: feedback.id,
        userId: feedback.userId.toString(),
        userName: feedback.userName,
        message: feedback.message,
        type: feedback.type,
        priority: feedback.priority,
        timestamp: feedback.createdAt,
        status: feedback.status
      };

      // Emit to all connected admin clients via WebSocket
      const io: Server = req.app.get('io');
      io.emit('new-feedback', feedbackData);

      logger.info(`New feedback submitted by ${userName}: ${type} - ${priority}`);

      res.status(201).json({
        success: true,
        data: feedbackData,
        message: 'Feedback submitted successfully! Thank you for helping us improve.'
      });
    } catch (error) {
      logger.error('Feedback submission error:', error);
      next(error);
    }
  }

  async getFeedback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, type, limit = 50, page = 1 } = req.query;
      
      // Build query
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (type && type !== 'all') {
        query.type = type;
      }

      // Execute query with pagination
      const feedbackList = await Feedback.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();

      const total = await Feedback.countDocuments(query);

      // Convert to response format
      const feedback = feedbackList.map(f => ({
        id: f._id.toString(),
        userId: f.userId.toString(),
        userName: f.userName,
        message: f.message,
        type: f.type,
        priority: f.priority,
        timestamp: f.createdAt,
        status: f.status
      }));

      res.json({
        success: true,
        data: {
          feedback,
          total,
          filtered: feedback.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Get feedback error:', error);
      next(error);
    }
  }

  async updateFeedbackStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const feedback = await Feedback.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      );
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
      }

      // Convert to response format
      const feedbackData: FeedbackData = {
        id: feedback.id,
        userId: feedback.userId.toString(),
        userName: feedback.userName,
        message: feedback.message,
        type: feedback.type,
        priority: feedback.priority,
        timestamp: feedback.createdAt,
        status: feedback.status
      };

      // Emit update to all connected clients
      const io: Server = req.app.get('io');
      io.emit('feedback-updated', feedbackData);

      logger.info(`Feedback ${id} status updated to ${status}`);

      res.json({
        success: true,
        data: feedbackData,
        message: 'Feedback status updated successfully'
      });
    } catch (error) {
      logger.error('Update feedback status error:', error);
      next(error);
    }
  }

  async getFeedbackStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await Feedback.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byType: {
              $push: {
                type: '$type',
                status: '$status',
                priority: '$priority'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            byType: 1
          }
        }
      ]);

      const typeStats = await Feedback.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            newCount: {
              $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
            },
            reviewingCount: {
              $sum: { $cond: [{ $eq: ['$status', 'reviewing'] }, 1, 0] }
            },
            resolvedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          total: stats[0]?.total || 0,
          byType: typeStats.reduce((acc, stat) => {
            acc[stat._id] = {
              total: stat.count,
              new: stat.newCount,
              reviewing: stat.reviewingCount,
              resolved: stat.resolvedCount
            };
            return acc;
          }, {} as Record<string, any>)
        }
      });
    } catch (error) {
      logger.error('Get feedback stats error:', error);
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();