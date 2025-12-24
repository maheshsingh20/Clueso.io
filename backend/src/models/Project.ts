import mongoose, { Schema, Document, Types } from 'mongoose';
import { Project as IProject, ProjectVisibility, ProjectCollaborator, UserRole } from '@clueso/shared';

// Create Mongoose-specific interfaces that use ObjectId
export interface ProjectCollaboratorDocument extends Omit<ProjectCollaborator, 'user'> {
  user: Types.ObjectId;
}

export interface ProjectDocument extends Omit<IProject, '_id' | 'workspace' | 'owner' | 'videos' | 'documents' | 'collaborators'>, Document {
  workspace: Types.ObjectId;
  owner: Types.ObjectId;
  videos: Types.ObjectId[];
  documents: Types.ObjectId[];
  collaborators: ProjectCollaboratorDocument[];
}

const projectCollaboratorSchema = new Schema<ProjectCollaboratorDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const projectSchema = new Schema<ProjectDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  visibility: {
    type: String,
    enum: Object.values(ProjectVisibility),
    default: ProjectVisibility.WORKSPACE
  },
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'Video'
  }],
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  collaborators: [projectCollaboratorSchema]
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ workspace: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'collaborators.user': 1 });

export const Project = mongoose.model<ProjectDocument>('Project', projectSchema);