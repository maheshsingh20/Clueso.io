import mongoose, { Schema, Document, Types } from 'mongoose';

export interface TemplateDocument extends Document {
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  previewVideo?: string;
  features: string[];
  tags: string[];
  rating: number;
  views: number;
  downloads: number;
  isPremium: boolean;
  price?: number;
  duration: number; // in seconds
  aspectRatio: string; // e.g., "16:9", "9:16", "1:1"
  resolution: string; // e.g., "1920x1080", "1080x1920"
  templateData: {
    scenes: Array<{
      id: string;
      type: 'intro' | 'content' | 'outro' | 'transition';
      duration: number;
      elements: Array<{
        type: 'text' | 'image' | 'video' | 'shape' | 'animation';
        properties: Record<string, any>;
      }>;
    }>;
    style: {
      colors: string[];
      fonts: string[];
      animations: string[];
    };
    settings: Record<string, any>;
  };
  createdBy: Types.ObjectId;
  isActive: boolean;
}

const templateSchema = new Schema<TemplateDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['Education', 'Business', 'Marketing', 'Entertainment', 'Social Media', 'Presentation', 'Tutorial', 'Promotional']
  },
  thumbnail: {
    type: String,
    required: true
  },
  previewVideo: String,
  features: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  aspectRatio: {
    type: String,
    required: true,
    enum: ['16:9', '9:16', '1:1', '4:3', '21:9']
  },
  resolution: {
    type: String,
    required: true
  },
  templateData: {
    scenes: [{
      id: String,
      type: {
        type: String,
        enum: ['intro', 'content', 'outro', 'transition']
      },
      duration: Number,
      elements: [{
        type: {
          type: String,
          enum: ['text', 'image', 'video', 'shape', 'animation']
        },
        properties: Schema.Types.Mixed
      }]
    }],
    style: {
      colors: [String],
      fonts: [String],
      animations: [String]
    },
    settings: Schema.Types.Mixed
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
templateSchema.index({ category: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ rating: -1 });
templateSchema.index({ views: -1 });
templateSchema.index({ downloads: -1 });
templateSchema.index({ isPremium: 1 });
templateSchema.index({ isActive: 1 });
templateSchema.index({ name: 'text', description: 'text' });

export const Template = mongoose.model<TemplateDocument>('Template', templateSchema);