import { Video, Transcript } from '../models';
import { ffmpegService } from './ffmpeg';
import { geminiService } from './gemini';
import { s3Service } from './s3';
import { logger } from '../utils/logger';
import { ProcessingStage, VideoStatus, JobProgress } from '@clueso/shared';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

type ProgressCallback = (progress: JobProgress) => void;

export class VideoProcessingService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'clueso-processing');
  }

  async extractAudio(videoId: string, onProgress: ProgressCallback): Promise<void> {
    logger.info(`Extracting audio for video: ${videoId}`);
    
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    await this.updateVideoProcessing(videoId, ProcessingStage.EXTRACT_AUDIO, 0);
    onProgress({ stage: ProcessingStage.EXTRACT_AUDIO, progress: 0 });

    try {
      // Create temp directory
      await fs.mkdir(this.tempDir, { recursive: true });

      // Download video from S3
      const videoPath = path.join(this.tempDir, `${videoId}.mp4`);
      const audioPath = path.join(this.tempDir, `${videoId}.wav`);

      onProgress({ stage: ProcessingStage.EXTRACT_AUDIO, progress: 20 });

      // Extract audio using FFmpeg
      await ffmpegService.extractAudio(videoPath, audioPath, { format: 'wav' });

      onProgress({ stage: ProcessingStage.EXTRACT_AUDIO, progress: 80 });

      // Upload audio to S3
      const audioBuffer = await fs.readFile(audioPath);
      const audioKey = s3Service.generateKey('audio', `${videoId}.wav`);
      await s3Service.uploadFile(audioBuffer, audioKey, 'audio/wav');

      // Clean up temp files
      await fs.unlink(videoPath).catch(() => {});
      await fs.unlink(audioPath).catch(() => {});

      await this.updateVideoProcessing(videoId, ProcessingStage.EXTRACT_AUDIO, 100);
      onProgress({ stage: ProcessingStage.EXTRACT_AUDIO, progress: 100 });

      logger.info(`Audio extracted successfully for video: ${videoId}`);
    } catch (error) {
      logger.error(`Audio extraction failed for video: ${videoId}`, error);
      throw error;
    }
  }

  async transcribeVideo(videoId: string, onProgress: ProgressCallback): Promise<void> {
    logger.info(`Transcribing video: ${videoId}`);
    
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    await this.updateVideoProcessing(videoId, ProcessingStage.TRANSCRIBE, 0);
    onProgress({ stage: ProcessingStage.TRANSCRIBE, progress: 0 });

    try {
      // Download audio from S3
      const audioKey = `audio/${videoId}.wav`;
      const audioPath = path.join(this.tempDir, `${videoId}.wav`);

      onProgress({ stage: ProcessingStage.TRANSCRIBE, progress: 20 });

      // Read audio file
      const audioBuffer = await fs.readFile(audioPath);

      // Transcribe using Google Gemini
      const transcription = await geminiService.transcribeAudio(audioBuffer, `${videoId}.wav`);

      onProgress({ stage: ProcessingStage.TRANSCRIBE, progress: 80 });

      // Save transcript to database
      const transcript = new Transcript({
        video: videoId,
        originalText: transcription.text,
        segments: transcription.segments,
        language: transcription.language,
        confidence: transcription.confidence
      });

      await transcript.save();

      // Update video with transcript reference
      video.transcript = transcript._id as any;
      await video.save();

      // Clean up
      await fs.unlink(audioPath).catch(() => {});

      await this.updateVideoProcessing(videoId, ProcessingStage.TRANSCRIBE, 100);
      onProgress({ stage: ProcessingStage.TRANSCRIBE, progress: 100 });

      logger.info(`Transcription completed for video: ${videoId}`);
    } catch (error) {
      logger.error(`Transcription failed for video: ${videoId}`, error);
      throw error;
    }
  }

  async enhanceScript(videoId: string, onProgress: ProgressCallback): Promise<void> {
    logger.info(`Enhancing script for video: ${videoId}`);
    
    const video = await Video.findById(videoId).populate('transcript');
    if (!video) throw new Error('Video not found');
    if (!video.transcript) throw new Error('Transcript not found');

    await this.updateVideoProcessing(videoId, ProcessingStage.ENHANCE_SCRIPT, 0);
    onProgress({ stage: ProcessingStage.ENHANCE_SCRIPT, progress: 0 });

    try {
      const transcript = video.transcript as any;
      
      onProgress({ stage: ProcessingStage.ENHANCE_SCRIPT, progress: 30 });

      // Enhance script using Google Gemini
      const enhancement = await geminiService.enhanceScript(
        transcript.originalText,
        video.title
      );

      onProgress({ stage: ProcessingStage.ENHANCE_SCRIPT, progress: 80 });

      // Update transcript with enhanced text
      transcript.enhancedText = enhancement.enhancedText;
      await transcript.save();

      await this.updateVideoProcessing(videoId, ProcessingStage.ENHANCE_SCRIPT, 100);
      onProgress({ stage: ProcessingStage.ENHANCE_SCRIPT, progress: 100 });

      logger.info(`Script enhanced for video: ${videoId}`);
    } catch (error) {
      logger.error(`Script enhancement failed for video: ${videoId}`, error);
      throw error;
    }
  }

  async generateVoiceover(videoId: string, onProgress: ProgressCallback): Promise<void> {
    logger.info(`Generating voiceover for video: ${videoId}`);
    
    const video = await Video.findById(videoId).populate('transcript');
    if (!video) throw new Error('Video not found');
    if (!video.transcript) throw new Error('Transcript not found');

    await this.updateVideoProcessing(videoId, ProcessingStage.GENERATE_VOICEOVER, 0);
    onProgress({ stage: ProcessingStage.GENERATE_VOICEOVER, progress: 0 });

    try {
      const transcript = video.transcript as any;
      const textToSpeak = transcript.enhancedText || transcript.originalText;

      onProgress({ stage: ProcessingStage.GENERATE_VOICEOVER, progress: 30 });

      // Generate voiceover using Google Gemini (with Google Cloud TTS)
      const audioBuffer = await geminiService.generateVoiceover(textToSpeak, 'alloy');

      onProgress({ stage: ProcessingStage.GENERATE_VOICEOVER, progress: 80 });

      // Upload voiceover to S3
      const voiceoverKey = s3Service.generateKey('voiceovers', `${videoId}.mp3`);
      await s3Service.uploadFile(audioBuffer, voiceoverKey, 'audio/mp3');

      await this.updateVideoProcessing(videoId, ProcessingStage.GENERATE_VOICEOVER, 100);
      onProgress({ stage: ProcessingStage.GENERATE_VOICEOVER, progress: 100 });

      logger.info(`Voiceover generated for video: ${videoId}`);
    } catch (error) {
      logger.error(`Voiceover generation failed for video: ${videoId}`, error);
      throw error;
    }
  }

  async detectScenes(videoId: string, onProgress: ProgressCallback): Promise<void> {
    logger.info(`Detecting scenes for video: ${videoId}`);
    
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    await this.updateVideoProcessing(videoId, ProcessingStage.DETECT_SCENES, 0);
    onProgress({ stage: ProcessingStage.DETECT_SCENES, progress: 0 });

    try {
      const videoPath = path.join(this.tempDir, `${videoId}.mp4`);
      const thumbsDir = path.join(this.tempDir, `${videoId}-thumbs`);

      onProgress({ stage: ProcessingStage.DETECT_SCENES, progress: 30 });

      // Generate thumbnails at regular intervals
      const thumbnails = await ffmpegService.generateThumbnails(videoPath, thumbsDir, 10);

      onProgress({ stage: ProcessingStage.DETECT_SCENES, progress: 70 });

      // Upload thumbnails and create keyframes
      const keyframes = [];
      const duration = video.originalFile.duration;
      const interval = duration / thumbnails.length;

      for (let i = 0; i < thumbnails.length; i++) {
        const thumbBuffer = await fs.readFile(thumbnails[i]);
        const thumbKey = s3Service.generateKey('thumbnails', `${videoId}-${i}.png`);
        const result = await s3Service.uploadFile(thumbBuffer, thumbKey, 'image/png');
        
        keyframes.push({
          timestamp: i * interval,
          thumbnail: result.url
        });
      }

      // Update video metadata
      video.metadata.keyframes = keyframes;
      await video.save();

      // Clean up
      await fs.rm(thumbsDir, { recursive: true, force: true });

      await this.updateVideoProcessing(videoId, ProcessingStage.DETECT_SCENES, 100);
      onProgress({ stage: ProcessingStage.DETECT_SCENES, progress: 100 });

      logger.info(`Scenes detected for video: ${videoId}`);
    } catch (error) {
      logger.error(`Scene detection failed for video: ${videoId}`, error);
      throw error;
    }
  }

  async generateCaptions(videoId: string, onProgress: ProgressCallback): Promise<void> {
    logger.info(`Generating captions for video: ${videoId}`);
    
    const video = await Video.findById(videoId).populate('transcript');
    if (!video) throw new Error('Video not found');
    if (!video.transcript) throw new Error('Transcript not found');

    await this.updateVideoProcessing(videoId, ProcessingStage.GENERATE_CAPTIONS, 0);
    onProgress({ stage: ProcessingStage.GENERATE_CAPTIONS, progress: 0 });

    try {
      const transcript = video.transcript as any;

      // Convert transcript segments to captions
      const captions = transcript.segments.map((segment: any, index: number) => ({
        id: `caption_${index}`,
        start: segment.start,
        end: segment.end,
        text: segment.text.trim(),
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#FFFFFF',
          backgroundColor: '#000000',
          position: 'bottom' as const
        }
      }));

      video.captions = captions;
      await video.save();

      // Generate SRT file
      const srtContent = this.generateSRT(captions);
      const srtKey = s3Service.generateKey('captions', `${videoId}.srt`);
      await s3Service.uploadFile(Buffer.from(srtContent), srtKey, 'text/plain');

      await this.updateVideoProcessing(videoId, ProcessingStage.GENERATE_CAPTIONS, 100);
      onProgress({ stage: ProcessingStage.GENERATE_CAPTIONS, progress: 100 });

      logger.info(`Captions generated for video: ${videoId}`);
    } catch (error) {
      logger.error(`Caption generation failed for video: ${videoId}`, error);
      throw error;
    }
  }

  async renderFinalVideo(videoId: string, onProgress: ProgressCallback): Promise<void> {
    logger.info(`Rendering final video: ${videoId}`);
    
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    await this.updateVideoProcessing(videoId, ProcessingStage.RENDER_VIDEO, 0);
    onProgress({ stage: ProcessingStage.RENDER_VIDEO, progress: 0 });

    try {
      const videoPath = path.join(this.tempDir, `${videoId}.mp4`);
      const voiceoverPath = path.join(this.tempDir, `${videoId}-voiceover.mp3`);
      const captionsPath = path.join(this.tempDir, `${videoId}.srt`);
      const outputPath = path.join(this.tempDir, `${videoId}-final.mp4`);

      onProgress({ stage: ProcessingStage.RENDER_VIDEO, progress: 20 });

      // Render video with captions
      await ffmpegService.renderVideoWithCaptions(videoPath, outputPath, captionsPath);

      onProgress({ stage: ProcessingStage.RENDER_VIDEO, progress: 80 });

      // Upload final video
      const finalBuffer = await fs.readFile(outputPath);
      const finalKey = s3Service.generateKey('processed', `${videoId}.mp4`);
      const result = await s3Service.uploadFile(finalBuffer, finalKey, 'video/mp4');

      // Update video with processed file info
      const metadata = await ffmpegService.getVideoMetadata(outputPath);
      video.processedFile = {
        url: result.url,
        key: result.key,
        size: result.size,
        duration: metadata.duration,
        format: 'mp4',
        resolution: {
          width: metadata.width,
          height: metadata.height
        }
      };
      video.status = VideoStatus.READY;
      await video.save();

      // Clean up
      await fs.unlink(videoPath).catch(() => {});
      await fs.unlink(voiceoverPath).catch(() => {});
      await fs.unlink(captionsPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});

      await this.updateVideoProcessing(videoId, ProcessingStage.COMPLETE, 100);
      onProgress({ stage: ProcessingStage.COMPLETE, progress: 100 });

      logger.info(`Final video rendered: ${videoId}`);
    } catch (error) {
      logger.error(`Video rendering failed for video: ${videoId}`, error);
      throw error;
    }
  }

  async markVideoError(videoId: string, error: Error): Promise<void> {
    await Video.findByIdAndUpdate(videoId, {
      status: VideoStatus.ERROR,
      'processing.error': error.message
    });
  }

  private async updateVideoProcessing(
    videoId: string,
    stage: ProcessingStage,
    progress: number
  ): Promise<void> {
    await Video.findByIdAndUpdate(videoId, {
      'processing.stage': stage,
      'processing.progress': progress,
      ...(progress === 0 && { 'processing.startedAt': new Date() }),
      ...(progress === 100 && { 'processing.completedAt': new Date() })
    });
  }

  private generateSRT(captions: any[]): string {
    return captions.map((caption, index) => {
      const startTime = this.formatSRTTime(caption.start);
      const endTime = this.formatSRTTime(caption.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    }).join('\n');
  }

  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}

export const videoProcessingService = new VideoProcessingService();