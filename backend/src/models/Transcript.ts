import mongoose, { Schema, Document, Types } from 'mongoose';
import { Transcript as ITranscript, TranscriptSegment } from '@clueso/shared';

export interface TranscriptDocument extends Omit<ITranscript, '_id' | 'video'>, Document {
  video: Types.ObjectId;
}

const transcriptSegmentSchema = new Schema<TranscriptSegment>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  speaker: String
}, { _id: false });

const transcriptSchema = new Schema<TranscriptDocument>({
  video: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    unique: true
  },
  originalText: {
    type: String,
    required: true
  },
  enhancedText: String,
  segments: [transcriptSegmentSchema],
  language: {
    type: String,
    required: true,
    default: 'en'
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  }
}, {
  timestamps: true
});

// Indexes (video index is already created by unique: true)
// transcriptSchema.index({ video: 1 }); // Removed duplicate index

export const Transcript = mongoose.model<TranscriptDocument>('Transcript', transcriptSchema);