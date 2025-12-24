import { Response, NextFunction } from 'express';
import { Video, Project } from '../models';
import { AuthRequest } from '../middleware';
import { s3Service, queueService } from '../services';
import { logger } from '../utils/logger';
import { AppError, ErrorCode, VideoStatus, ProcessingStage } from '@clueso/shared';
import multer from 'multer';
import { config } from '../config';

// Configure multer for video uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, AVI, and MOV files are allowed.'));
    }
  }
});

export class VideosController {
  uploadMiddleware = upload.single('video');

  async createVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, projectId } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Video file is required'
        });
      }

      // Verify project exists and user has access
      const project = await Project.findById(projectId);
      if (!project) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Project not found'
        });
      }

      // Check if user has access to project
      const hasAccess = project.owner.toString() === req.user!._id.toString() ||
        project.collaborators.some(c => c.user.toString() === req.user!._id.toString());

      if (!hasAccess) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Access denied to this project'
        });
      }

      // Upload video to S3
      const videoKey = s3Service.generateKey('videos', file.originalname);
      const uploadResult = await s3Service.uploadFile(
        file.buffer,
        videoKey,
        file.mimetype,
        {
          originalName: file.originalname,
          uploadedBy: req.user!._id.toString()
        }
      );

      // Create video record
      const video = new Video({
        title,
        description,
        project: projectId,
        owner: req.user!._id,
        status: VideoStatus.UPLOADING,
        originalFile: {
          url: uploadResult.url,
          key: uploadResult.key,
          size: uploadResult.size,
          duration: 0, // Will be updated during processing
          format: file.mimetype.split('/')[1],
          resolution: { width: 0, height: 0 } // Will be updated during processing
        }
      });

      await video.save();

      // Add video to project
      project.videos.push(video._id as any);
      await project.save();

      // Start video processing
      await queueService.addVideoProcessingJob({
        videoId: video._id.toString(),
        userId: req.user!._id.toString(),
        stage: ProcessingStage.EXTRACT_AUDIO
      });

      logger.info(`Video uploaded: ${video._id} by user: ${req.user!.email}`);

      res.status(201).json({
        success: true,
        data: { video },
        message: 'Video uploaded successfully and processing started'
      });
    } catch (error) {
      next(error);
    }
  }

  async getVideos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, projectId, status, search } = req.query;
      const userId = req.user!._id;

      // Build query
      const query: any = { owner: userId };
      if (projectId) query.project = projectId;
      if (status) query.status = status;

      if (search) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        });
      }

      // Execute query with pagination
      const videos = await Video.find(query)
        .populate('project', 'name')
        .populate('transcript')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Video.countDocuments(query);

      res.json({
        success: true,
        data: {
          data: videos,
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

  async getVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const video = await Video.findById(id)
        .populate('project')
        .populate('transcript');

      if (!video) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Video not found'
        });
      }

      // Check access permissions
      const project = video.project as any;
      const hasAccess = video.owner.toString() === userId.toString() ||
        project.collaborators.some((c: any) => c.user.toString() === userId.toString());

      if (!hasAccess) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Access denied to this video'
        });
      }

      res.json({
        success: true,
        data: { video }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const userId = req.user!._id;

      const video = await Video.findById(id);
      if (!video) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Video not found'
        });
      }

      // Check ownership
      if (video.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the video owner can update it'
        });
      }

      // Update fields
      if (title !== undefined) video.title = title;
      if (description !== undefined) video.description = description;

      await video.save();

      logger.info(`Video updated: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        data: { video },
        message: 'Video updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const video = await Video.findById(id);
      if (!video) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Video not found'
        });
      }

      // Check ownership
      if (video.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the video owner can delete it'
        });
      }

      // Delete files from S3
      try {
        await s3Service.deleteFile(video.originalFile.key);
        if (video.processedFile) {
          await s3Service.deleteFile(video.processedFile.key);
        }
      } catch (error) {
        logger.warn(`Failed to delete S3 files for video: ${id}`, error);
      }

      // Remove from project
      await Project.updateOne(
        { _id: video.project },
        { $pull: { videos: video._id } }
      );

      // Delete video
      await Video.findByIdAndDelete(id);

      logger.info(`Video deleted: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getVideoProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const video = await Video.findById(id);
      if (!video) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Video not found'
        });
      }

      // Check access
      if (video.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: {
          processing: video.processing,
          status: video.status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async regenerateVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { stage } = req.body;
      const userId = req.user!._id;

      const video = await Video.findById(id);
      if (!video) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Video not found'
        });
      }

      // Check ownership
      if (video.owner.toString() !== userId.toString()) {
        throw new AppError({
          code: ErrorCode.AUTHORIZATION_ERROR,
          message: 'Only the video owner can regenerate it'
        });
      }

      // Validate stage
      const validStages = Object.values(ProcessingStage);
      if (!validStages.includes(stage)) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid processing stage'
        });
      }

      // Start regeneration from specified stage
      await queueService.addVideoProcessingJob({
        videoId: video._id.toString(),
        userId: userId.toString(),
        stage
      });

      logger.info(`Video regeneration started: ${id} from stage: ${stage}`);

      res.json({
        success: true,
        message: 'Video regeneration started'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const videosController = new VideosController();