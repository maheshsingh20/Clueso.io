import { Router } from 'express';
import authRoutes from './auth';
import videoRoutes from './videos';
import projectRoutes from './projects';
import workspaceRoutes from './workspaces';
import searchRoutes from './search';
import aiRoutes from './ai';
import templateRoutes from './templates';
import analyticsRoutes from './analytics';
import userProgressRoutes from './userProgress';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/projects', projectRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/search', searchRoutes);
router.use('/ai', aiRoutes);
router.use('/templates', templateRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/user-progress', userProgressRoutes);

export default router;