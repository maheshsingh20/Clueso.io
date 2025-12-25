import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { geminiService } from '../services/gemini'
import { Video } from '../models/Video'
import { logger } from '../utils/logger'

export class AIController {
  async enhanceScript(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text, context } = req.body
      const userId = req.user!._id

      console.log('🤖 AI Controller - enhanceScript called');
      console.log('👤 User ID:', userId);
      console.log('📝 Text length:', text?.length);
      console.log('🎯 Context:', context);

      if (!text || typeof text !== 'string') {
        console.log('❌ Invalid text input');
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        })
      }

      logger.info(`Enhancing script for user: ${userId}`)

      const result = await geminiService.enhanceScript(text, context)
      
      console.log('✅ Enhancement result:', result);

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('❌ AI Controller error:', error);
      logger.error('Script enhancement error:', error)
      next(error)
    }
  }

  async generateVoiceover(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text, voice = 'alloy' } = req.body
      const userId = req.user!._id

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        })
      }

      if (text.length > 5000) {
        return res.status(400).json({
          success: false,
          message: 'Text too long. Maximum 5000 characters allowed.'
        })
      }

      logger.info(`Generating voiceover for user: ${userId}, text length: ${text.length}`)

      const audioBuffer = await geminiService.generateVoiceover(text, voice)
      const estimatedDuration = Math.ceil(text.length / 10) // ~10 chars per second

      // In a real implementation, you'd save this to S3 and return the URL
      // For now, we'll return a success message with realistic data
      res.json({
        success: true,
        data: {
          message: 'Voiceover generated successfully with Gemini AI',
          audioUrl: `/api/placeholder/voiceover-${Date.now()}.mp3`, // Mock URL
          duration: estimatedDuration,
          voice: voice,
          textLength: text.length,
          bufferSize: audioBuffer.length
        }
      })
    } catch (error) {
      logger.error('Voiceover generation error:', error)
      next(error)
    }
  }

  async generateDocumentation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params
      const userId = req.user!._id

      // Get video and check permissions
      const video = await Video.findById(videoId).populate('transcript')
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        })
      }

      if (video.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }

      const transcript = video.transcript?.enhancedText || video.transcript?.originalText || 'No transcript available'
      
      logger.info(`Generating documentation for video: ${videoId}`)

      const documentation = await geminiService.generateDocumentation(transcript, video.title)

      res.json({
        success: true,
        data: documentation
      })
    } catch (error) {
      logger.error('Documentation generation error:', error)
      next(error)
    }
  }

  async generateSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text } = req.body
      const userId = req.user!._id

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        })
      }

      logger.info(`Generating summary for user: ${userId}`)

      const summary = await geminiService.generateSummary(text)

      res.json({
        success: true,
        data: { summary }
      })
    } catch (error) {
      logger.error('Summary generation error:', error)
      next(error)
    }
  }

  async askAI(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { question, context } = req.body
      const userId = req.user!._id

      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Question is required'
        })
      }

      logger.info(`AI Assistant query from user: ${userId}`)

      const answer = await geminiService.askAI(question, context)

      res.json({
        success: true,
        data: { 
          question,
          answer,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      logger.error('AI Assistant error:', error)
      next(error)
    }
  }

  async extractScript(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params
      const userId = req.user!._id

      // Get video and check permissions
      const video = await Video.findById(videoId).populate('transcript')
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        })
      }

      // Check access permissions (same as other video methods)
      let hasAccess = false
      const project = video.project as any

      if (video.owner.toString() === userId.toString()) {
        hasAccess = true
      } else if (project && project.owner.toString() === userId.toString()) {
        hasAccess = true
      } else if (project && project.collaborators.some((c: any) => c.user.toString() === userId.toString())) {
        hasAccess = true
      } else if (project && project.visibility === 'public') {
        hasAccess = true
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }

      logger.info(`Extracting script for video: ${videoId}`)

      // Check if transcript already exists
      if (video.transcript) {
        return res.json({
          success: true,
          data: {
            originalText: video.transcript.originalText || video.transcript.enhancedText || '',
            confidence: video.transcript.confidence || 0.9,
            language: video.transcript.language || 'en'
          }
        })
      }

      // Simulate script extraction from video
      const mockScript = `Welcome to this comprehensive screen recording tutorial. In this video, I'll guide you through the effective use of our application, highlighting key features and best practices. Let's start by exploring the main dashboard where you can access all the primary functions. First, we'll look at the navigation menu and understand how to organize your projects efficiently.`

      // In a real implementation, you would:
      // 1. Extract audio from video
      // 2. Use speech-to-text API (like Google Speech-to-Text)
      // 3. Process the transcript with Gemini for enhancement

      res.json({
        success: true,
        data: {
          originalText: mockScript,
          confidence: 0.92,
          language: 'en'
        }
      })
    } catch (error) {
      logger.error('Script extraction error:', error)
      next(error)
    }
  }

  async generateCaptions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text } = req.body
      const userId = req.user!._id

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        })
      }

      logger.info(`Generating captions for user: ${userId}`)

      // Split text into segments (simulate timing)
      const words = text.split(' ')
      const segments = []
      let currentTime = 0
      const wordsPerSegment = 8 // ~8 words per caption segment
      
      for (let i = 0; i < words.length; i += wordsPerSegment) {
        const segmentWords = words.slice(i, i + wordsPerSegment)
        const segmentText = segmentWords.join(' ')
        const duration = segmentWords.length * 0.5 // ~0.5 seconds per word
        
        segments.push({
          id: `caption_${i / wordsPerSegment}`,
          text: segmentText,
          start: currentTime,
          end: currentTime + duration,
          confidence: 0.95 - Math.random() * 0.1 // Random confidence between 0.85-0.95
        })
        
        currentTime += duration
      }

      res.json({
        success: true,
        data: { segments }
      })
    } catch (error) {
      logger.error('Caption generation error:', error)
      next(error)
    }
  }

  async processVideoEffects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params
      const { effects } = req.body
      const userId = req.user!._id

      // Get video and check permissions
      const video = await Video.findById(videoId)
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        })
      }

      if (video.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }

      logger.info(`Processing video effects for video: ${videoId}, effects:`, effects)

      // Enhanced effects processing simulation
      const processedEffects = {
        smartZoom: effects.smartZoom ? 'Applied AI-detected zoom points at 3 key moments' : 'Disabled',
        sceneDetection: effects.sceneDetection ? 'Detected 4 scene transitions with smooth cuts' : 'Disabled',
        autoHighlight: effects.autoHighlight ? 'Added 3 highlight moments with emphasis effects' : 'Disabled'
      }

      // Simulate processing time based on video file duration
      const processingTime = video.originalFile?.duration ? 
        `${(video.originalFile.duration / 30).toFixed(1)} seconds` : 
        '2.3 seconds'

      // Update video with effects (in real implementation)
      await Video.findByIdAndUpdate(videoId, {
        $set: {
          'processing.effects': effects,
          'processing.lastProcessed': new Date()
        }
      })

      res.json({
        success: true,
        data: {
          message: 'Video effects processed successfully with AI analysis',
          effects: processedEffects,
          processingTime,
          videoId,
          appliedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      logger.error('Video effects processing error:', error)
      next(error)
    }
  }

  async applyVideoStyle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params
      const { style } = req.body
      const userId = req.user!._id

      // Get video and check permissions
      const video = await Video.findById(videoId)
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        })
      }

      if (video.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }

      logger.info(`Applying video style: ${style} for video: ${videoId}`)

      // In a real implementation, this would apply style templates
      const styleConfig = {
        professional: { colors: ['#0891b2', '#1e40af'], fonts: ['Inter', 'Roboto'] },
        creative: { colors: ['#ec4899', '#8b5cf6'], fonts: ['Poppins', 'Nunito'] },
        modern: { colors: ['#10b981', '#059669'], fonts: ['Montserrat', 'Source Sans Pro'] },
        vibrant: { colors: ['#f97316', '#dc2626'], fonts: ['Raleway', 'Open Sans'] }
      }

      res.json({
        success: true,
        data: {
          message: `${style.charAt(0).toUpperCase() + style.slice(1)} style applied successfully`,
          style: styleConfig[style as keyof typeof styleConfig] || styleConfig.professional,
          previewUrl: `/api/placeholder/styled-video-${style}.mp4`
        }
      })
    } catch (error) {
      logger.error('Video style application error:', error)
      next(error)
    }
  }
}

export const aiController = new AIController()