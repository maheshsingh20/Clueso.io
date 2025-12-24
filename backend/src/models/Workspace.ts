import mongoose, { Schema, Document, Types } from 'mongoose';
import { Workspace as IWorkspace, WorkspaceMember, WorkspaceSettings, UserRole, ProjectVisibility } from '@clueso/shared';

// Create Mongoose-specific interfaces that use ObjectId
export interface WorkspaceMemberDocument extends Omit<WorkspaceMember, 'user'> {
  user: Types.ObjectId;
}

export interface WorkspaceDocument extends Omit<IWorkspace, '_id' | 'owner' | 'members' | 'projects'>, Document {
  owner: Types.ObjectId;
  members: WorkspaceMemberDocument[];
  projects: Types.ObjectId[];
}

const workspaceMemberSchema = new Schema<WorkspaceMemberDocument>({
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
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const workspaceSettingsSchema = new Schema<WorkspaceSettings>({
  allowInvites: {
    type: Boolean,
    default: true
  },
  defaultProjectVisibility: {
    type: String,
    enum: Object.values(ProjectVisibility),
    default: ProjectVisibility.WORKSPACE
  }
}, { _id: false });

const workspaceSchema = new Schema<WorkspaceDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: [workspaceMemberSchema],
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    defaultProjectVisibility: {
      type: String,
      enum: Object.values(ProjectVisibility),
      default: ProjectVisibility.WORKSPACE
    }
  }
}, {
  timestamps: true
});

// Indexes
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

export const Workspace = mongoose.model<WorkspaceDocument>('Workspace', workspaceSchema);