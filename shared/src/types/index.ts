// User & Authentication Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  workspaces: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Workspace Types
export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: WorkspaceMember[];
  projects: string[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  user: string;
  role: UserRole;
  joinedAt: Date;
}

export interface WorkspaceSettings {
  allowInvites: boolean;
  defaultProjectVisibility: ProjectVisibility;
}

// Project Types
export interface Project {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  owner: string;
  visibility: ProjectVisibility;
  videos: string[];
  documents: string[];
  collaborators: ProjectCollaborator[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectVisibility {
  PRIVATE = 'private',
  WORKSPACE = 'workspace',
  PUBLIC = 'public'
}

export interface ProjectCollaborator {
  user: string;
  role: UserRole;
  addedAt: Date;
}

// Video Types
export interface Video {
  _id: string;
  title: string;
  description?: string;
  project: string;
  owner: string;
  status: VideoStatus;
  originalFile: VideoFile;
  processedFile?: VideoFile;
  transcript?: Transcript;
  captions?: Caption[];
  metadata: VideoMetadata;
  processing: ProcessingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error'
}

export interface VideoFile {
  url: string;
  key: string;
  size: number;
  duration: number;
  format: string;
  resolution: {
    width: number;
    height: number;
  };
}

export interface Transcript {
  _id: string;
  video: string;
  originalText: string;
  enhancedText?: string;
  segments: TranscriptSegment[];
  language: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
  style?: CaptionStyle;
}

export interface CaptionStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom';
}

export interface VideoMetadata {
  scenes: Scene[];
  highlights: Highlight[];
  keyframes: Keyframe[];
  audioLevels: AudioLevel[];
}

export interface Scene {
  id: string;
  start: number;
  end: number;
  description: string;
  thumbnail: string;
}

export interface Highlight {
  id: string;
  start: number;
  end: number;
  type: 'zoom' | 'highlight' | 'annotation';
  data: any;
}

export interface Keyframe {
  timestamp: number;
  thumbnail: string;
}

export interface AudioLevel {
  timestamp: number;
  level: number;
}

export interface ProcessingStatus {
  stage: ProcessingStage;
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export enum ProcessingStage {
  UPLOAD = 'upload',
  EXTRACT_AUDIO = 'extract_audio',
  TRANSCRIBE = 'transcribe',
  ENHANCE_SCRIPT = 'enhance_script',
  GENERATE_VOICEOVER = 'generate_voiceover',
  DETECT_SCENES = 'detect_scenes',
  GENERATE_CAPTIONS = 'generate_captions',
  RENDER_VIDEO = 'render_video',
  COMPLETE = 'complete'
}

// Document Types
export interface Document {
  _id: string;
  title: string;
  project: string;
  video?: string;
  content: DocumentContent;
  format: DocumentFormat;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentFormat {
  HTML = 'html',
  MARKDOWN = 'markdown',
  PDF = 'pdf'
}

export interface DocumentContent {
  steps: DocumentStep[];
  introduction?: string;
  conclusion?: string;
}

export interface DocumentStep {
  id: string;
  title: string;
  description: string;
  screenshot?: string;
  timestamp?: number;
  order: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Job Types
export interface JobData {
  videoId: string;
  userId: string;
  stage: ProcessingStage;
  options?: any;
}

export interface JobProgress {
  stage: ProcessingStage;
  progress: number;
  message?: string;
}

// Export Types
export interface ExportRequest {
  videoId: string;
  format: ExportFormat;
  options: ExportOptions;
}

export enum ExportFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  HTML = 'html',
  MARKDOWN = 'markdown',
  PDF = 'pdf'
}

export interface ExportOptions {
  includeCaption?: boolean;
  quality?: 'low' | 'medium' | 'high';
  resolution?: string;
  includeAudio?: boolean;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface VideoProgressMessage extends WebSocketMessage {
  type: 'video_progress';
  payload: {
    videoId: string;
    progress: JobProgress;
  };
}

// Error Types
export class AppError extends Error {
  code: string;
  details?: any;

  constructor(options: { code: string; message: string; details?: any }) {
    super(options.message);
    this.code = options.code;
    this.details = options.details;
    this.name = 'AppError';
  }
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR'
}