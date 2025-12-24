import mongoose, { Document, Schema } from 'mongoose'

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId
  completedTutorials: string[]
  onboardingStep: number
  lastActiveDate: Date
  achievements: string[]
  preferences: {
    showTutorialHints: boolean
    skipIntroVideos: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  completedTutorials: [{
    type: String,
    default: []
  }],
  onboardingStep: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    type: String,
    default: []
  }],
  preferences: {
    showTutorialHints: {
      type: Boolean,
      default: true
    },
    skipIntroVideos: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
})

// Indexes for better performance
UserProgressSchema.index({ userId: 1 })
UserProgressSchema.index({ lastActiveDate: -1 })

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema)