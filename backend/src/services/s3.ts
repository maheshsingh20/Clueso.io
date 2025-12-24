import AWS from 'aws-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

// Configure AWS SDK only if credentials are provided
let s3: AWS.S3 | null = null;

if (config.AWS_ACCESS_KEY_ID && config.AWS_ACCESS_KEY_ID !== 'your-aws-access-key') {
  AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION
  });
  s3 = new AWS.S3();
  logger.info('Using AWS S3 for file storage');
} else {
  logger.info('AWS credentials not configured, using local file storage for development');
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export class S3Service {
  private bucket: string;
  private useLocalStorage: boolean;
  private localStoragePath: string;

  constructor() {
    this.bucket = config.AWS_S3_BUCKET;
    this.useLocalStorage = !s3;
    this.localStoragePath = path.join(process.cwd(), 'uploads');
    
    if (this.useLocalStorage) {
      // Ensure uploads directory exists
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
    }
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      if (this.useLocalStorage) {
        // Use local file storage for development
        const filePath = path.join(this.localStoragePath, key.replace(/\//g, '_'));
        fs.writeFileSync(filePath, buffer);
        
        logger.info(`File saved locally: ${filePath}`);
        
        return {
          url: `http://localhost:${config.PORT}/uploads/${key.replace(/\//g, '_')}`,
          key: key,
          size: buffer.length
        };
      } else {
        // Use AWS S3 for production
        const params: AWS.S3.PutObjectRequest = {
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          Metadata: metadata || {}
        };

        const result = await s3!.upload(params).promise();
        
        logger.info(`File uploaded to S3: ${key}`);
        
        return {
          url: result.Location,
          key: result.Key,
          size: buffer.length
        };
      }
    } catch (error) {
      logger.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (this.useLocalStorage) {
        // Delete local file
        const filePath = path.join(this.localStoragePath, key.replace(/\//g, '_'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`File deleted locally: ${filePath}`);
        }
      } else {
        // Delete from S3
        await s3!.deleteObject({
          Bucket: this.bucket,
          Key: key
        }).promise();
        
        logger.info(`File deleted from S3: ${key}`);
      }
    } catch (error) {
      logger.error('File delete error:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    try {
      if (this.useLocalStorage) {
        // Return local file URL
        return `http://localhost:${config.PORT}/uploads/${key.replace(/\//g, '_')}`;
      } else {
        // Generate S3 signed URL
        const url = await s3!.getSignedUrlPromise('getObject', {
          Bucket: this.bucket,
          Key: key,
          Expires: expires
        });
        
        return url;
      }
    } catch (error) {
      logger.error('Signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  async getUploadUrl(key: string, contentType: string, expires: number = 3600): Promise<string> {
    try {
      if (this.useLocalStorage) {
        // Return local upload endpoint
        return `http://localhost:${config.PORT}/api/v1/upload/${key}`;
      } else {
        // Generate S3 upload URL
        const url = await s3!.getSignedUrlPromise('putObject', {
          Bucket: this.bucket,
          Key: key,
          ContentType: contentType,
          Expires: expires
        });
        
        return url;
      }
    } catch (error) {
      logger.error('Upload URL error:', error);
      throw new Error(`Failed to generate upload URL: ${error}`);
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      if (this.useLocalStorage) {
        // Copy local file
        const sourcePath = path.join(this.localStoragePath, sourceKey.replace(/\//g, '_'));
        const destPath = path.join(this.localStoragePath, destinationKey.replace(/\//g, '_'));
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          logger.info(`File copied locally: ${sourcePath} -> ${destPath}`);
        }
      } else {
        // Copy in S3
        await s3!.copyObject({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${sourceKey}`,
          Key: destinationKey
        }).promise();
        
        logger.info(`File copied in S3: ${sourceKey} -> ${destinationKey}`);
      }
    } catch (error) {
      logger.error('File copy error:', error);
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      if (this.useLocalStorage) {
        // Check local file
        const filePath = path.join(this.localStoragePath, key.replace(/\//g, '_'));
        return fs.existsSync(filePath);
      } else {
        // Check S3 file
        await s3!.headObject({
          Bucket: this.bucket,
          Key: key
        }).promise();
        
        return true;
      }
    } catch (error) {
      if (this.useLocalStorage) {
        return false;
      } else if ((error as AWS.AWSError).statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  generateKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    
    return `${prefix}/${timestamp}-${randomString}.${extension}`;
  }
}

export const s3Service = new S3Service();