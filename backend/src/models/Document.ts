import mongoose, { Schema, Document as MongoDocument, Types } from 'mongoose';
import { Document as IDocument, DocumentFormat, DocumentContent, DocumentStep } from '@clueso/shared';

export interface DocumentDocument extends Omit<IDocument, '_id' | 'project' | 'video' | 'owner'>, MongoDocument {
  project: Types.ObjectId;
  video?: Types.ObjectId;
  owner: Types.ObjectId;
}

const documentStepSchema = new Schema<DocumentStep>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  screenshot: String,
  timestamp: Number,
  order: { type: Number, required: true }
}, { _id: false });

const documentContentSchema = new Schema<DocumentContent>({
  steps: [documentStepSchema],
  introduction: String,
  conclusion: String
}, { _id: false });

const documentSchema = new Schema<DocumentDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: 'Video'
  },
  content: {
    type: documentContentSchema,
    required: true
  },
  format: {
    type: String,
    enum: Object.values(DocumentFormat),
    default: DocumentFormat.HTML
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ project: 1 });
documentSchema.index({ owner: 1 });
documentSchema.index({ video: 1 });

export const Document = mongoose.model<DocumentDocument>('Document', documentSchema);