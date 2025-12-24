import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

// Set FFmpeg paths
ffmpeg.setFfmpegPath(config.FFMPEG_PATH);
ffmpeg.setFfprobePath(config.FFPROBE_PATH);

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  format: string;
  bitrate: number;
  fps: number;
}

export interface ExtractAudioOptions {
  format?: 'mp3' | 'wav';
  bitrate?: string;
}

export interface RenderOptions {
  resolution?: string;
  fps?: number;
  bitrate?: string;
  codec?: string;
}

export class FFmpegService {
  async getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          logger.error('FFprobe error:', err);
          return reject(new Error(`Failed to get video metadata: ${err.message}`));
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        
        if (!videoStream) {
          return reject(new Error('No video stream found'));
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || 'unknown',
          bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate.toString()) : 0,
          fps: this.parseFps(videoStream.r_frame_rate || '30/1')
        });
      });
    });
  }

  async extractAudio(
    inputPath: string,
    outputPath: string,
    options: ExtractAudioOptions = {}
  ): Promise<void> {
    const { format = 'wav', bitrate = '192k' } = options;

    return new Promise((resolve, reject) => {
      logger.info(`Extracting audio from: ${inputPath}`);

      ffmpeg(inputPath)
        .noVideo()
        .audioCodec(format === 'wav' ? 'pcm_s16le' : 'libmp3lame')
        .audioBitrate(bitrate)
        .format(format)
        .on('start', (cmd) => {
          logger.debug(`FFmpeg command: ${cmd}`);
        })
        .on('progress', (progress) => {
          logger.debug(`Audio extraction progress: ${progress.percent?.toFixed(2)}%`);
        })
        .on('end', () => {
          logger.info(`Audio extracted successfully: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Audio extraction error:', err);
          reject(new Error(`Audio extraction failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  async generateThumbnails(
    inputPath: string,
    outputDir: string,
    count: number = 10
  ): Promise<string[]> {
    await fs.mkdir(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
      logger.info(`Generating ${count} thumbnails from: ${inputPath}`);

      const thumbnails: string[] = [];

      ffmpeg(inputPath)
        .screenshots({
          count,
          folder: outputDir,
          filename: 'thumb-%i.png',
          size: '640x360'
        })
        .on('end', async () => {
          // Get generated thumbnail paths
          const files = await fs.readdir(outputDir);
          const thumbFiles = files
            .filter(f => f.startsWith('thumb-'))
            .sort()
            .map(f => path.join(outputDir, f));
          
          logger.info(`Generated ${thumbFiles.length} thumbnails`);
          resolve(thumbFiles);
        })
        .on('error', (err) => {
          logger.error('Thumbnail generation error:', err);
          reject(new Error(`Thumbnail generation failed: ${err.message}`));
        });
    });
  }

  async renderVideoWithCaptions(
    inputPath: string,
    outputPath: string,
    captionsPath: string,
    options: RenderOptions = {}
  ): Promise<void> {
    const {
      resolution,
      fps = 30,
      bitrate = '2000k',
      codec = 'libx264'
    } = options;

    return new Promise((resolve, reject) => {
      logger.info(`Rendering video with captions: ${inputPath}`);

      let command = ffmpeg(inputPath)
        .videoCodec(codec)
        .videoBitrate(bitrate)
        .fps(fps)
        .outputOptions([
          `-vf subtitles=${captionsPath}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=3'`
        ]);

      if (resolution) {
        command = command.size(resolution);
      }

      command
        .on('start', (cmd) => {
          logger.debug(`FFmpeg command: ${cmd}`);
        })
        .on('progress', (progress) => {
          logger.debug(`Rendering progress: ${progress.percent?.toFixed(2)}%`);
        })
        .on('end', () => {
          logger.info(`Video rendered successfully: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Video rendering error:', err);
          reject(new Error(`Video rendering failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  async mergeAudioVideo(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info(`Merging audio and video: ${videoPath} + ${audioPath}`);

      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .videoCodec('copy')
        .audioCodec('aac')
        .audioBitrate('192k')
        .on('start', (cmd) => {
          logger.debug(`FFmpeg command: ${cmd}`);
        })
        .on('progress', (progress) => {
          logger.debug(`Merge progress: ${progress.percent?.toFixed(2)}%`);
        })
        .on('end', () => {
          logger.info(`Audio and video merged successfully: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Audio/video merge error:', err);
          reject(new Error(`Merge failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  async convertToFormat(
    inputPath: string,
    outputPath: string,
    format: string,
    options: RenderOptions = {}
  ): Promise<void> {
    const { resolution, fps, bitrate = '2000k', codec = 'libx264' } = options;

    return new Promise((resolve, reject) => {
      logger.info(`Converting video to ${format}: ${inputPath}`);

      let command = ffmpeg(inputPath)
        .videoCodec(codec)
        .videoBitrate(bitrate)
        .format(format);

      if (resolution) {
        command = command.size(resolution);
      }

      if (fps) {
        command = command.fps(fps);
      }

      command
        .on('start', (cmd) => {
          logger.debug(`FFmpeg command: ${cmd}`);
        })
        .on('progress', (progress) => {
          logger.debug(`Conversion progress: ${progress.percent?.toFixed(2)}%`);
        })
        .on('end', () => {
          logger.info(`Video converted successfully: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Video conversion error:', err);
          reject(new Error(`Conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  async extractFrameAtTime(
    inputPath: string,
    outputPath: string,
    timestamp: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1920x1080'
        })
        .on('end', () => {
          logger.info(`Frame extracted at ${timestamp}s: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Frame extraction error:', err);
          reject(new Error(`Frame extraction failed: ${err.message}`));
        });
    });
  }

  private parseFps(fpsString: string): number {
    const parts = fpsString.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(fpsString);
  }
}

export const ffmpegService = new FFmpegService();