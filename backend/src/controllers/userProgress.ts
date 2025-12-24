import { Request, Response } from 'express'
import { UserProgress } from '../models/UserProgress'
import { AuthRequest } from '../middleware/auth'

export const userProgressController = {
  // Get user progress
  getUserProgress: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id

      let progress = await UserProgress.findOne({ userId })
      
      if (!progress) {
        // Create initial progress for new user
        progress = new UserProgress({
          userId,
          completedTutorials: [],
          onboardingStep: 0,
          lastActiveDate: new Date(),
          achievements: [],
          preferences: {
            showTutorialHints: true,
            skipIntroVideos: false
          }
        })
        await progress.save()
      }

      // Update last active date
      progress.lastActiveDate = new Date()
      await progress.save()

      res.json({
        success: true,
        data: progress
      })
    } catch (error) {
      console.error('❌ Error getting user progress:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get user progress'
      })
    }
  },

  // Update onboarding step
  updateOnboardingStep: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const { step } = req.body

      if (typeof step !== 'number' || step < 0 || step > 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid onboarding step'
        })
      }

      const progress = await UserProgress.findOneAndUpdate(
        { userId },
        { 
          onboardingStep: step,
          lastActiveDate: new Date()
        },
        { new: true, upsert: true }
      )

      res.json({
        success: true,
        data: progress
      })
    } catch (error) {
      console.error('❌ Error updating onboarding step:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update onboarding step'
      })
    }
  },

  // Mark tutorial as completed
  completeTutorial: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const { tutorialId } = req.body

      if (!tutorialId || typeof tutorialId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Tutorial ID is required'
        })
      }

      const progress = await UserProgress.findOneAndUpdate(
        { userId },
        { 
          $addToSet: { completedTutorials: tutorialId },
          lastActiveDate: new Date()
        },
        { new: true, upsert: true }
      )

      // Check for achievements
      const achievements = []
      if (progress.completedTutorials.length === 1) {
        achievements.push('first_tutorial')
      }
      if (progress.completedTutorials.length >= 5) {
        achievements.push('tutorial_master')
      }

      if (achievements.length > 0) {
        progress.achievements = [...new Set([...progress.achievements, ...achievements])]
        await progress.save()
      }

      res.json({
        success: true,
        data: progress,
        newAchievements: achievements
      })
    } catch (error) {
      console.error('❌ Error completing tutorial:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to complete tutorial'
      })
    }
  },

  // Update user preferences
  updatePreferences: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const { preferences } = req.body

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Preferences object is required'
        })
      }

      const progress = await UserProgress.findOneAndUpdate(
        { userId },
        { 
          preferences: {
            showTutorialHints: preferences.showTutorialHints ?? true,
            skipIntroVideos: preferences.skipIntroVideos ?? false
          },
          lastActiveDate: new Date()
        },
        { new: true, upsert: true }
      )

      res.json({
        success: true,
        data: progress
      })
    } catch (error) {
      console.error('❌ Error updating preferences:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences'
      })
    }
  },

  // Get tutorial content
  getTutorials: async (req: AuthRequest, res: Response) => {
    try {
      const tutorials = [
        {
          id: 'getting_started',
          title: 'Getting Started with Clueso',
          description: 'Learn the basics of creating and editing videos',
          duration: '3 min',
          category: 'basics',
          videoUrl: '/tutorials/getting-started.mp4',
          steps: [
            'Create your first project',
            'Upload or record a video',
            'Use basic editing tools',
            'Export your video'
          ]
        },
        {
          id: 'ai_tools',
          title: 'AI-Powered Editing',
          description: 'Discover how to use AI tools for video enhancement',
          duration: '5 min',
          category: 'ai',
          videoUrl: '/tutorials/ai-tools.mp4',
          steps: [
            'Enhance scripts with AI',
            'Generate captions automatically',
            'Apply AI-powered cuts',
            'Use voice enhancement'
          ]
        },
        {
          id: 'collaboration',
          title: 'Team Collaboration',
          description: 'Work together with your team on video projects',
          duration: '4 min',
          category: 'collaboration',
          videoUrl: '/tutorials/collaboration.mp4',
          steps: [
            'Create workspaces',
            'Invite team members',
            'Share projects',
            'Manage permissions'
          ]
        },
        {
          id: 'advanced_editing',
          title: 'Advanced Editing Features',
          description: 'Master advanced video editing techniques',
          duration: '7 min',
          category: 'advanced',
          videoUrl: '/tutorials/advanced-editing.mp4',
          steps: [
            'Timeline management',
            'Multi-track editing',
            'Effects and transitions',
            'Audio synchronization'
          ]
        },
        {
          id: 'export_share',
          title: 'Export and Sharing',
          description: 'Learn different ways to export and share your videos',
          duration: '3 min',
          category: 'basics',
          videoUrl: '/tutorials/export-share.mp4',
          steps: [
            'Choose export settings',
            'Download videos',
            'Share via link',
            'Embed in websites'
          ]
        }
      ]

      res.json({
        success: true,
        data: tutorials
      })
    } catch (error) {
      console.error('❌ Error getting tutorials:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get tutorials'
      })
    }
  },

  // Get help articles
  getHelpArticles: async (req: AuthRequest, res: Response) => {
    try {
      const { category, search } = req.query

      let articles = [
        {
          id: 'video_formats',
          title: 'Supported Video Formats',
          category: 'technical',
          content: 'Learn about supported video formats and best practices for uploading.',
          tags: ['video', 'formats', 'upload'],
          lastUpdated: new Date('2024-01-15')
        },
        {
          id: 'ai_enhancement',
          title: 'How AI Enhancement Works',
          category: 'ai',
          content: 'Understand how our AI tools enhance your video content automatically.',
          tags: ['ai', 'enhancement', 'automation'],
          lastUpdated: new Date('2024-01-20')
        },
        {
          id: 'team_management',
          title: 'Managing Team Workspaces',
          category: 'collaboration',
          content: 'Complete guide to creating and managing team workspaces.',
          tags: ['team', 'workspace', 'collaboration'],
          lastUpdated: new Date('2024-01-18')
        },
        {
          id: 'export_options',
          title: 'Export Settings Guide',
          category: 'export',
          content: 'Choose the right export settings for different platforms.',
          tags: ['export', 'settings', 'quality'],
          lastUpdated: new Date('2024-01-22')
        },
        {
          id: 'keyboard_shortcuts',
          title: 'Keyboard Shortcuts',
          category: 'productivity',
          content: 'Speed up your workflow with keyboard shortcuts.',
          tags: ['shortcuts', 'productivity', 'workflow'],
          lastUpdated: new Date('2024-01-10')
        },
        {
          id: 'troubleshooting',
          title: 'Common Issues and Solutions',
          category: 'support',
          content: 'Solutions to frequently encountered problems.',
          tags: ['troubleshooting', 'issues', 'support'],
          lastUpdated: new Date('2024-01-25')
        }
      ]

      // Filter by category
      if (category && typeof category === 'string') {
        articles = articles.filter(article => article.category === category)
      }

      // Filter by search term
      if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase()
        articles = articles.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          article.content.toLowerCase().includes(searchTerm) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }

      res.json({
        success: true,
        data: articles
      })
    } catch (error) {
      console.error('❌ Error getting help articles:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get help articles'
      })
    }
  }
}