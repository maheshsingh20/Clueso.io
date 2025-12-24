import { Response, NextFunction } from 'express';
import { Template } from '../models/Template';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class TemplatesController {
  async getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 12, 
        category, 
        search, 
        isPremium, 
        aspectRatio,
        sortBy = 'popular' 
      } = req.query;

      // Build query
      const query: any = { isActive: true };
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } }
        ];
      }
      
      if (isPremium !== undefined) {
        query.isPremium = isPremium === 'true';
      }
      
      if (aspectRatio) {
        query.aspectRatio = aspectRatio;
      }

      // Build sort
      let sort: any = {};
      switch (sortBy) {
        case 'popular':
          sort = { views: -1, downloads: -1 };
          break;
        case 'rating':
          sort = { rating: -1, views: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'name':
          sort = { name: 1 };
          break;
        default:
          sort = { views: -1, downloads: -1 };
      }

      // Execute query with pagination
      const templates = await Template.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort(sort)
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Template.countDocuments(query);

      // Get categories for filters
      const categories = await Template.distinct('category', { isActive: true });

      res.json({
        success: true,
        data: {
          data: templates,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          },
          categories,
          filters: {
            aspectRatios: ['16:9', '9:16', '1:1', '4:3', '21:9'],
            sortOptions: ['popular', 'rating', 'newest', 'name']
          }
        }
      });
    } catch (error) {
      logger.error('Get templates error:', error);
      next(error);
    }
  }

  async getTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const template = await Template.findById(id)
        .populate('createdBy', 'firstName lastName');

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Increment views
      await Template.findByIdAndUpdate(id, { $inc: { views: 1 } });

      res.json({
        success: true,
        data: { template }
      });
    } catch (error) {
      logger.error('Get template error:', error);
      next(error);
    }
  }

  async useTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { projectName, projectDescription } = req.body;
      const userId = req.user!._id;

      const template = await Template.findById(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Increment downloads
      await Template.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

      // In a real implementation, you would create a new project/video based on the template
      // For now, we'll return the template data for the frontend to use
      res.json({
        success: true,
        data: {
          message: 'Template ready to use',
          templateData: template.templateData,
          projectName: projectName || `${template.name} Project`,
          projectDescription: projectDescription || `Created from ${template.name} template`
        }
      });
    } catch (error) {
      logger.error('Use template error:', error);
      next(error);
    }
  }

  async getFeaturedTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await Template.find({ 
        isActive: true,
        rating: { $gte: 4.5 }
      })
        .populate('createdBy', 'firstName lastName')
        .sort({ views: -1, rating: -1 })
        .limit(6);

      res.json({
        success: true,
        data: { templates }
      });
    } catch (error) {
      logger.error('Get featured templates error:', error);
      next(error);
    }
  }

  async getPopularTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await Template.find({ isActive: true })
        .populate('createdBy', 'firstName lastName')
        .sort({ downloads: -1, views: -1 })
        .limit(8);

      res.json({
        success: true,
        data: { templates }
      });
    } catch (error) {
      logger.error('Get popular templates error:', error);
      next(error);
    }
  }

  async rateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const template = await Template.findById(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // In a real implementation, you would store individual ratings and calculate average
      // For now, we'll just update the rating directly
      template.rating = rating;
      await template.save();

      res.json({
        success: true,
        data: { 
          message: 'Rating submitted successfully',
          newRating: template.rating
        }
      });
    } catch (error) {
      logger.error('Rate template error:', error);
      next(error);
    }
  }
}

export const templatesController = new TemplatesController();