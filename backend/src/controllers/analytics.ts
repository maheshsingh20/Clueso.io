import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Project, Video, Workspace } from '../models';
import { logger } from '../utils/logger';

export class AnalyticsController {
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;

      // Get user's projects with detailed information
      const userProjects = await Project.find({
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ]
      }).populate('videos').sort({ createdAt: -1 });

      const projectIds = userProjects.map(p => p._id);

      // Get user's videos with detailed information
      const userVideos = await Video.find({
        project: { $in: projectIds }
      }).populate('project', 'name').sort({ createdAt: -1 });

      // Get user's workspaces
      const userWorkspaces = await Workspace.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }).populate('members.user', 'firstName lastName');

      // Calculate actual storage used from video files
      const storageUsedBytes = userVideos.reduce((total, video) => {
        return total + (video.originalFile?.size || 0);
      }, 0);
      const storageUsedMB = storageUsedBytes / (1024 * 1024);

      // Get processing videos
      const processingVideos = userVideos.filter(video => 
        video.status === 'processing' || video.status === 'uploading'
      ).length;

      // Calculate video duration statistics
      const totalDuration = userVideos.reduce((total, video) => {
        return total + (video.originalFile?.duration || 0);
      }, 0);

      // Get recent activity from actual data
      const recentActivity = [
        ...userVideos.slice(0, 8).map(video => ({
          type: 'video_created',
          message: `Video "${video.title}" was created`,
          timestamp: video.createdAt,
          projectName: (video.project as any)?.name || 'Unknown Project',
          videoId: video._id
        })),
        ...userProjects.slice(0, 5).map(project => ({
          type: 'project_created', 
          message: `Project "${project.name}" was created`,
          timestamp: project.createdAt,
          projectId: project._id,
          videoCount: project.videos?.length || 0
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);

      // Calculate monthly stats for the last 6 months
      const now = new Date();
      const monthlyStats = [];
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthVideos = userVideos.filter(video => 
          video.createdAt >= month && video.createdAt < nextMonth
        ).length;
        
        const monthProjects = userProjects.filter(project => 
          project.createdAt >= month && project.createdAt < nextMonth
        ).length;

        // Calculate storage used in this month
        const monthStorageMB = userVideos
          .filter(video => video.createdAt >= month && video.createdAt < nextMonth)
          .reduce((total, video) => total + ((video.originalFile?.size || 0) / (1024 * 1024)), 0);

        monthlyStats.push({
          name: month.toLocaleDateString('en-US', { month: 'short' }),
          fullName: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          videos: monthVideos,
          projects: monthProjects,
          storage: Math.round(monthStorageMB)
        });
      }

      // Calculate project statistics
      const projectStats = userProjects.map(project => ({
        id: project._id,
        name: project.name,
        videoCount: project.videos?.length || 0,
        createdAt: project.createdAt,
        visibility: project.visibility,
        collaborators: project.collaborators?.length || 0
      })).sort((a, b) => b.videoCount - a.videoCount).slice(0, 10);

      // Calculate workspace statistics
      const workspaceStats = userWorkspaces.map(workspace => ({
        id: workspace._id,
        name: workspace.name,
        memberCount: workspace.members?.length || 0,
        projectCount: userProjects.filter(p => p.workspace?.toString() === workspace._id.toString()).length,
        isOwner: workspace.owner.toString() === userId.toString()
      }));

      // Video format distribution
      const formatDistribution = userVideos.reduce((acc, video) => {
        const format = video.originalFile?.format || 'unknown';
        acc[format] = (acc[format] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Video status distribution
      const videosByStatus = {
        ready: userVideos.filter(v => v.status === 'ready').length,
        processing: userVideos.filter(v => v.status === 'processing').length,
        error: userVideos.filter(v => v.status === 'error').length,
        uploading: userVideos.filter(v => v.status === 'uploading').length
      };

      // Performance metrics
      const avgProcessingTime = userVideos
        .filter(v => v.processing?.completedAt && v.processing?.startedAt)
        .reduce((acc, v) => {
          const processingTime = new Date(v.processing!.completedAt!).getTime() - 
                               new Date(v.processing!.startedAt!).getTime();
          return acc + processingTime;
        }, 0) / Math.max(1, userVideos.filter(v => v.processing?.completedAt).length);

      res.json({
        success: true,
        data: {
          // Basic counts
          totalVideos: userVideos.length,
          totalProjects: userProjects.length,
          totalWorkspaces: userWorkspaces.length,
          processingVideos,
          
          // Storage information
          storageUsed: storageUsedMB > 1024 ? 
            `${(storageUsedMB / 1024).toFixed(1)} GB` : 
            `${storageUsedMB.toFixed(1)} MB`,
          storageUsedBytes,
          storageLimit: '10 GB',
          storagePercentage: Math.min(100, (storageUsedMB / (10 * 1024)) * 100),
          
          // Duration statistics
          totalDuration: Math.round(totalDuration),
          avgVideoDuration: userVideos.length > 0 ? Math.round(totalDuration / userVideos.length) : 0,
          
          // Activity and trends
          recentActivity,
          monthlyStats,
          
          // Detailed statistics
          projectStats,
          workspaceStats,
          formatDistribution,
          videosByStatus,
          
          // Performance metrics
          avgProcessingTime: Math.round(avgProcessingTime / 1000), // Convert to seconds
          
          // Growth metrics
          growthMetrics: {
            videosThisMonth: monthlyStats[5]?.videos || 0,
            videosLastMonth: monthlyStats[4]?.videos || 0,
            projectsThisMonth: monthlyStats[5]?.projects || 0,
            projectsLastMonth: monthlyStats[4]?.projects || 0
          }
        }
      });
    } catch (error) {
      logger.error('Analytics overview error:', error);
      next(error);
    }
  }

  async getProjectAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const userId = req.user!._id;

      // Get project with videos
      const project = await Project.findById(projectId)
        .populate('videos')
        .populate('owner', 'firstName lastName')
        .populate('collaborators.user', 'firstName lastName');
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check access permissions
      const hasAccess = project.owner._id.toString() === userId.toString() ||
        project.collaborators.some((c: any) => c.user._id.toString() === userId.toString());

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const projectVideos = await Video.find({ project: projectId }).sort({ createdAt: -1 });

      // Calculate project-specific metrics
      const totalDuration = projectVideos.reduce((sum, video) => 
        sum + (video.originalFile?.duration || 0), 0);
      
      const totalSize = projectVideos.reduce((sum, video) => 
        sum + (video.originalFile?.size || 0), 0);

      // Video creation timeline
      const videoTimeline = projectVideos.map(video => ({
        id: video._id,
        title: video.title,
        createdAt: video.createdAt,
        status: video.status,
        duration: video.originalFile?.duration || 0,
        size: video.originalFile?.size || 0
      }));

      res.json({
        success: true,
        data: {
          project: {
            id: project._id,
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
            visibility: project.visibility
          },
          metrics: {
            totalVideos: projectVideos.length,
            totalDuration: Math.round(totalDuration),
            totalSize: Math.round(totalSize / (1024 * 1024)), // MB
            avgVideoDuration: projectVideos.length > 0 ? Math.round(totalDuration / projectVideos.length) : 0,
            collaborators: project.collaborators.length
          },
          videoTimeline,
          statusDistribution: {
            ready: projectVideos.filter(v => v.status === 'ready').length,
            processing: projectVideos.filter(v => v.status === 'processing').length,
            error: projectVideos.filter(v => v.status === 'error').length,
            uploading: projectVideos.filter(v => v.status === 'uploading').length
          }
        }
      });
    } catch (error) {
      logger.error('Project analytics error:', error);
      next(error);
    }
  }

  async getVideoAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const userId = req.user!._id;

      const video = await Video.findById(videoId).populate('project');
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Check if user has access to this video
      const project = video.project as any;
      const hasAccess = project.owner.toString() === userId.toString() ||
        project.collaborators.some((c: any) => c.user.toString() === userId.toString());

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Mock video analytics data
      const analytics = {
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 50) + 10,
        shares: Math.floor(Math.random() * 20) + 5,
        comments: Math.floor(Math.random() * 30) + 2,
        watchTime: Math.floor(Math.random() * 300) + 60, // seconds
        engagement: Math.floor(Math.random() * 40) + 60, // percentage
        demographics: {
          ageGroups: [
            { range: '18-24', percentage: 25 },
            { range: '25-34', percentage: 35 },
            { range: '35-44', percentage: 20 },
            { range: '45-54', percentage: 15 },
            { range: '55+', percentage: 5 }
          ],
          locations: [
            { country: 'United States', percentage: 40 },
            { country: 'United Kingdom', percentage: 20 },
            { country: 'Canada', percentage: 15 },
            { country: 'Australia', percentage: 10 },
            { country: 'Other', percentage: 15 }
          ]
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Video analytics error:', error);
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();