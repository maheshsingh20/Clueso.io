import { config } from '../config';
import { logger } from '../utils/logger';
import { JobData, JobProgress, ProcessingStage } from '@clueso/shared';
import { VideoProcessingService } from './videoProcessing';

// Simple in-memory queue for development without Redis
class SimpleQueue {
  private jobs: Map<string, any> = new Map();
  private jobCounter = 0;

  async add(name: string, data: JobData): Promise<{ id: string }> {
    const jobId = `job_${++this.jobCounter}`;
    const job = {
      id: jobId,
      name,
      data,
      progress: 0,
      status: 'waiting',
      createdAt: new Date()
    };
    
    this.jobs.set(jobId, job);
    
    // Process job immediately in development
    setTimeout(() => this.processJob(jobId), 100);
    
    return { id: jobId };
  }

  async getJob(jobId: string) {
    return this.jobs.get(jobId) || null;
  }

  async getWaiting() {
    return Array.from(this.jobs.values()).filter(job => job.status === 'waiting');
  }

  async getActive() {
    return Array.from(this.jobs.values()).filter(job => job.status === 'active');
  }

  async getCompleted() {
    return Array.from(this.jobs.values()).filter(job => job.status === 'completed');
  }

  async getFailed() {
    return Array.from(this.jobs.values()).filter(job => job.status === 'failed');
  }

  async close() {
    this.jobs.clear();
  }

  private async processJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'active';
    job.processedOn = new Date();

    try {
      // Simulate job processing
      logger.info(`Processing job: ${jobId} (development mode - no actual processing)`);
      job.progress = 100;
      job.status = 'completed';
      job.finishedOn = new Date();
    } catch (error) {
      job.status = 'failed';
      job.failedReason = error.message;
      logger.error(`Job failed: ${jobId}`, error);
    }
  }
}

export class QueueService {
  private videoQueue: SimpleQueue;
  private videoProcessingService: VideoProcessingService;
  private useRedis: boolean;

  constructor() {
    this.useRedis = !config.isDevelopment && config.REDIS_URL !== 'redis://localhost:6379';
    
    if (this.useRedis) {
      // Use Redis-based queue in production
      try {
        const { Queue, Worker } = require('bullmq');
        const connection = {
          host: config.REDIS_URL.includes('://') 
            ? new URL(config.REDIS_URL).hostname 
            : config.REDIS_URL.split(':')[0],
          port: config.REDIS_URL.includes('://') 
            ? parseInt(new URL(config.REDIS_URL).port) || 6379
            : parseInt(config.REDIS_URL.split(':')[1]) || 6379
        };
        this.videoQueue = new Queue('video-processing', { connection });
        logger.info('Using Redis-based queue');
      } catch (error) {
        logger.warn('Redis not available, falling back to simple queue');
        this.videoQueue = new SimpleQueue();
        this.useRedis = false;
      }
    } else {
      // Use simple in-memory queue for development
      this.videoQueue = new SimpleQueue();
      logger.info('Using simple in-memory queue for development');
    }
    
    this.videoProcessingService = new VideoProcessingService();
  }

  async addVideoProcessingJob(jobData: JobData): Promise<string> {
    const job = await this.videoQueue.add('process-video', jobData);
    logger.info(`Video processing job added: ${job.id} for video: ${jobData.videoId}`);
    
    // In development, simulate processing completion after a short delay
    if (config.isDevelopment) {
      setTimeout(async () => {
        try {
          await this.simulateVideoProcessing(jobData.videoId);
        } catch (error) {
          logger.error(`Simulated processing failed for video: ${jobData.videoId}`, error);
        }
      }, 3000); // 3 second delay to simulate processing
    }
    
    return job.id!;
  }

  private async simulateVideoProcessing(videoId: string): Promise<void> {
    const { Video } = require('../models');
    
    try {
      logger.info(`Starting AI processing pipeline for video: ${videoId}`);
      
      // Step 1: Extract Audio (0-20%)
      await Video.findByIdAndUpdate(videoId, {
        status: 'processing',
        'processing.stage': 'extract_audio',
        'processing.progress': 10,
        'processing.startedAt': new Date()
      });
      
      await this.delay(2000);
      
      // Step 2: Transcribe Audio (20-40%)
      await Video.findByIdAndUpdate(videoId, {
        'processing.stage': 'transcribe',
        'processing.progress': 30
      });
      
      await this.delay(3000);
      
      // Step 3: Clean & Enhance Script (40-60%)
      await Video.findByIdAndUpdate(videoId, {
        'processing.stage': 'enhance_script',
        'processing.progress': 50
      });
      
      await this.delay(2000);
      
      // Step 4: Generate AI Voiceover (60-75%)
      await Video.findByIdAndUpdate(videoId, {
        'processing.stage': 'generate_voiceover',
        'processing.progress': 70
      });
      
      await this.delay(3000);
      
      // Step 5: Detect Scenes & Smart Zooms (75-85%)
      await Video.findByIdAndUpdate(videoId, {
        'processing.stage': 'detect_scenes',
        'processing.progress': 80
      });
      
      await this.delay(2000);
      
      // Step 6: Generate Captions (85-95%)
      await Video.findByIdAndUpdate(videoId, {
        'processing.stage': 'generate_captions',
        'processing.progress': 90
      });
      
      await this.delay(2000);
      
      // Step 7: Render Final Video (95-100%)
      await Video.findByIdAndUpdate(videoId, {
        'processing.stage': 'render_video',
        'processing.progress': 95
      });
      
      await this.delay(3000);
      
      // Complete processing
      const video = await Video.findById(videoId);
      if (video) {
        // Simulate AI-generated metadata using Gemini
        const aiMetadata = {
          transcript: {
            originalText: "Welcome to this screen recording. In this video, I'll show you how to use our application effectively.",
            enhancedText: "Welcome to this comprehensive screen recording tutorial. In this professionally crafted video, I'll guide you through the effective use of our application, highlighting key features and best practices.",
            confidence: 0.95,
            language: 'en',
            aiProvider: 'gemini'
          },
          voiceover: {
            voice: 'alloy',
            speed: 1.0,
            pitch: 1.0,
            generated: true,
            aiProvider: 'gemini'
          },
          scenes: [
            { timestamp: 0, type: 'intro', confidence: 0.9 },
            { timestamp: 15, type: 'main_content', confidence: 0.85 },
            { timestamp: 45, type: 'conclusion', confidence: 0.88 }
          ],
          smartZooms: [
            { timestamp: 5, x: 100, y: 50, scale: 1.5, duration: 3 },
            { timestamp: 25, x: 200, y: 150, scale: 2.0, duration: 4 }
          ],
          captions: [
            { start: 0, end: 5, text: "Welcome to this screen recording tutorial" },
            { start: 5, end: 10, text: "I'll show you how to use our application" },
            { start: 10, end: 15, text: "Let's start with the main features" }
          ],
          aiProvider: 'gemini'
        };
        
        await Video.findByIdAndUpdate(videoId, {
          status: 'ready',
          'processing.stage': 'complete',
          'processing.progress': 100,
          'processing.completedAt': new Date(),
          'metadata.aiGenerated': aiMetadata,
          'metadata.processingTime': Date.now() - new Date(video.processing?.startedAt || new Date()).getTime(),
          'metadata.features': ['transcript', 'voiceover', 'captions', 'smart_zooms', 'scene_detection']
        });
      }
      
      logger.info(`AI processing pipeline completed successfully for video: ${videoId}`);
    } catch (error) {
      logger.error(`AI processing pipeline failed for video: ${videoId}`, error);
      
      // Mark as error
      await Video.findByIdAndUpdate(videoId, {
        status: 'error',
        'processing.error': 'AI processing pipeline failed: ' + error.message
      });
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.videoQueue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      progress: job.progress || 0,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      data: job.data,
      status: job.status || 'waiting'
    };
  }

  async removeJob(jobId: string): Promise<void> {
    if (this.useRedis && this.videoQueue.getJob) {
      const job = await this.videoQueue.getJob(jobId);
      if (job && job.remove) {
        await job.remove();
      }
    }
    // For simple queue, jobs are automatically cleaned up
  }

  async getQueueStats(): Promise<any> {
    if (this.useRedis) {
      try {
        const waiting = await this.videoQueue.getWaiting();
        const active = await this.videoQueue.getActive();
        const completed = await this.videoQueue.getCompleted();
        const failed = await this.videoQueue.getFailed();

        return {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length
        };
      } catch (error) {
        logger.warn('Error getting queue stats:', error);
      }
    }
    
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      note: 'Using simple queue - stats not available'
    };
  }

  async close(): Promise<void> {
    if (this.useRedis && typeof this.videoQueue.close === 'function') {
      try {
        await this.videoQueue.close();
      } catch (error) {
        logger.warn('Error closing queue:', error);
      }
    } else {
      await this.videoQueue.close();
    }
    logger.info('Queue service closed');
  }
}

export const queueService = new QueueService();