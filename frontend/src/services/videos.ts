import { apiService } from './api'
import { 
  Video, 
  ApiResponse, 
  PaginatedResponse,
  ProcessingStatus,
  VideoStatus 
} from '@clueso/shared'

export interface CreateVideoRequest {
  title: string
  description?: string
  projectId: string
}

export interface UpdateVideoRequest {
  title?: string
  description?: string
}

export interface VideoQuery {
  page?: number
  limit?: number
  projectId?: string
  status?: VideoStatus
  search?: string
}

class VideosService {
  async createVideo(
    file: File, 
    data: CreateVideoRequest,
    onProgress?: (progress: number) => void
  ): Promise<Video> {
    const response = await apiService.uploadFile<ApiResponse<{ video: Video }>>(
      '/videos',
      file,
      data,
      onProgress
    )
    return response.data!.video
  }

  async getVideos(query: VideoQuery = {}): Promise<PaginatedResponse<Video>> {
    const params = new URLSearchParams()
    
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.projectId) params.append('projectId', query.projectId)
    if (query.status) params.append('status', query.status)
    if (query.search) params.append('search', query.search)

    const response = await apiService.get<ApiResponse<PaginatedResponse<Video>>>(
      `/videos?${params.toString()}`
    )
    return response.data!
  }

  async getVideo(id: string): Promise<Video> {
    const response = await apiService.get<ApiResponse<{ video: Video }>>(`/videos/${id}`)
    return response.data!.video
  }

  async updateVideo(id: string, data: UpdateVideoRequest): Promise<Video> {
    const response = await apiService.put<ApiResponse<{ video: Video }>>(`/videos/${id}`, data)
    return response.data!.video
  }

  async deleteVideo(id: string): Promise<void> {
    await apiService.delete(`/videos/${id}`)
  }

  async getVideoProgress(id: string): Promise<{
    processing: ProcessingStatus
    status: VideoStatus
  }> {
    const response = await apiService.get<ApiResponse<{
      processing: ProcessingStatus
      status: VideoStatus
    }>>(`/videos/${id}/progress`)
    return response.data!
  }

  async regenerateVideo(id: string, stage: string): Promise<void> {
    await apiService.post(`/videos/${id}/regenerate`, { stage })
  }
}

export const videosService = new VideosService()
export default videosService