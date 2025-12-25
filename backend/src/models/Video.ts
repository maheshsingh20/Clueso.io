import mongoose, { Schema, Document, Types } from 'mongoose';
import { 
  Video as IVideo, 
  VideoStatus, 
  VideoFile, 
  VideoMetadata, 
  ProcessingStatus, 
  ProcessingStage,
  Scene,
  Highlight,
  Keyframe,
  AudioLevel
} from '@clueso/shared';

export interface VideoDocument extends Omit<IVideo, '_id' | 'project' | 'owner'>, Document {
  project?: Types.ObjectId;
  owner: Types.ObjectId;
}

const videoFileSchema = new Schema<VideoFile>({
  url: { type: String, required: true },
  key: { type: String, required: true },
  size: { type: Number, required: true },
  duration: { type: Number, required: true },
  format: { type: String, required: true },
  resolution: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  }
}, { _id: false });

const sceneSchema = new Schema<Scene>({
  id: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true }
}, { _id: false });

const highlightSchema = new Schema<Highlight>({
  id: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['zoom', 'highlight', 'annotation'],
    required: true 
  },
  data: { type: Schema.Types.Mixed }
}, { _id: false });

const keyframeSchema = new Schema<Keyframe>({
  timestamp: { type: Number, required: true },
  thumbnail: { type: String, required: true }
}, { _id: false });

const audioLevelSchema = new Schema<AudioLevel>({
  timestamp: { type: Number, required: true },
  level: { type: Number, required: true }
}, { _id: false });

const videoMetadataSchema = new Schema<VideoMetadata>({
  scenes: [sceneSchema],
  highlights: [highlightSchema],
  keyframes: [keyframeSchema],
  audioLevels: [audioLevelSchema]
}, { _id: false });

const processingStatusSchema = new Schema<ProcessingStatus>({
  stage: {
    type: String,
    enum: Object.values(ProcessingStage),
    default: ProcessingStage.UPLOAD
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  error: String,
  startedAt: Date,
  completedAt: Date
}, { _id: false });

const videoSchema = new Schema<VideoDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(VideoStatus),
    default: VideoStatus.UPLOADING
  },
  originalFile: {
    type: videoFileSchema,
    required: true
  },
  processedFile: videoFileSchema,
  transcript: {
    type: Schema.Types.ObjectId,
    ref: 'Transcript'
  },
  captions: [{
    id: String,
    start: Number,
    end: Number,
    text: String,
    style: {
      fontSize: Number,
      fontFamily: String,
      color: String,
      backgroundColor: String,
      position: {
        type: String,
        enum: ['top', 'center', 'bottom']
      }
    }
  }],
  metadata: {
    type: videoMetadataSchema,
    default: () => ({
      scenes: [],
      highlights: [],
      keyframes: [],
      audioLevels: []
    })
  },
  processing: {
    type: processingStatusSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Indexes
videoSchema.index({ project: 1 });
videoSchema.index({ owner: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ createdAt: -1 });

export const Video = mongoose.model<VideoDocument>('Video', videoSchema);