import { apiService } from './api'
import { ApiResponse } from '@clueso/shared'

export interface AnalyticsOverview {
  totalVideos: number
  totalProjects: number
  totalWorkspaces: number
  processingVideos: number
  storageUsed: string
  storageUsedBytes: number
  storageLimit: string
  storagePercentage: number
  totalDuration: number
  avgVideoDuration: number
  recentActivity: Array<{
    type: string
    message: string
    timestamp: string
    projectName?: string
    videoId?: string
    projectId?: string
    videoCount?: number
  }>
  monthlyStats: Array<{
    name: string
    fullName: string
    videos: number
    projects: number
    storage: number
  }>
  projectStats: Array<{
    id: string
    name: string
    videoCount: number
    createdAt: string
    visibility: string
    collaborators: number
  }>
  workspaceStats: Array<{
    id: string
    name: string
    memberCount: number
    projectCount: number
    isOwner: boolean
  }>
  formatDistribution: Record<string, number>
  videosByStatus: {
    ready: number
    processing: number
    error: number
    uploading: number
  }
  avgProcessingTime: number
  growthMetrics: {
    videosThisMonth: number
    videosLastMonth: number
    projectsThisMonth: number
    projectsLastMonth: number
  }
}

export interface ProjectAnalytics {
  project: {
    id: string
    name: string
    description: string
    createdAt: string
    visibility: string
  }
  metrics: {
    totalVideos: number
    totalDuration: number
    totalSize: number
    avgVideoDuration: number
    collaborators: number
  }
  videoTimeline: Array<{
    id: string
    title: string
    createdAt: string
    status: string
    duration: number
    size: number
  }>
  statusDistribution: {
    ready: number
    processing: number
    error: number
    uploading: number
  }
}

class AnalyticsService {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await apiService.get<ApiResponse<AnalyticsOverview>>('/analytics/overview')
    return response.data!
  }

  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    const response = await apiService.get<ApiResponse<ProjectAnalytics>>(`/analytics/project/${projectId}`)
    return response.data!
  }

  async getVideoAnalytics(videoId: string): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(`/analytics/video/${videoId}`)
    return response.data!
  }
}

export const analyticsService = new AnalyticsService()
export default analyticsService