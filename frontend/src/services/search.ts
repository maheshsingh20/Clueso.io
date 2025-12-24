import { apiService } from './api'
import { 
  Project, 
  Workspace, 
  Video, 
  ApiResponse 
} from '@clueso/shared'

export interface SearchResult {
  projects: Project[]
  workspaces: Workspace[]
  videos: Video[]
  total: number
}

export interface SearchQuery {
  query: string
  limit?: number
  types?: ('projects' | 'workspaces' | 'videos')[]
}

class SearchService {
  async globalSearch(searchQuery: SearchQuery): Promise<SearchResult> {
    const params = new URLSearchParams()
    params.append('q', searchQuery.query)
    
    if (searchQuery.limit) {
      params.append('limit', searchQuery.limit.toString())
    }
    
    if (searchQuery.types && searchQuery.types.length > 0) {
      params.append('types', searchQuery.types.join(','))
    }

    const response = await apiService.get<ApiResponse<SearchResult>>(
      `/search?${params.toString()}`
    )
    return response.data!
  }

  async searchProjects(query: string, limit = 10): Promise<Project[]> {
    const params = new URLSearchParams()
    params.append('search', query)
    params.append('limit', limit.toString())

    const response = await apiService.get<ApiResponse<{ data: Project[] }>>(
      `/projects?${params.toString()}`
    )
    return response.data!.data
  }

  async searchWorkspaces(query: string, limit = 10): Promise<Workspace[]> {
    const params = new URLSearchParams()
    params.append('search', query)
    params.append('limit', limit.toString())

    const response = await apiService.get<ApiResponse<{ data: Workspace[] }>>(
      `/workspaces?${params.toString()}`
    )
    return response.data!.data
  }

  async searchVideos(query: string, limit = 10): Promise<Video[]> {
    const params = new URLSearchParams()
    params.append('search', query)
    params.append('limit', limit.toString())

    const response = await apiService.get<ApiResponse<{ data: Video[] }>>(
      `/videos?${params.toString()}`
    )
    return response.data!.data
  }
}

export const searchService = new SearchService()
export default searchService