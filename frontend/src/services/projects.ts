import { apiService } from './api'
import { 
  Project, 
  ApiResponse, 
  PaginatedResponse,
  ProjectVisibility,
  UserRole 
} from '@clueso/shared'

export interface CreateProjectRequest {
  name: string
  description?: string
  workspaceId: string
  visibility?: ProjectVisibility
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  visibility?: ProjectVisibility
}

export interface ProjectQuery {
  page?: number
  limit?: number
  workspaceId?: string
  search?: string
}

export interface AddCollaboratorRequest {
  email: string
  role?: UserRole
}

class ProjectsService {
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await apiService.post<ApiResponse<{ project: Project }>>('/projects', data)
    return response.data!.project
  }

  async getProjects(query: ProjectQuery = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams()
    
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.workspaceId) params.append('workspaceId', query.workspaceId)
    if (query.search) params.append('search', query.search)

    const response = await apiService.get<ApiResponse<PaginatedResponse<Project>>>(
      `/projects?${params.toString()}`
    )
    return response.data!
  }

  async getProject(id: string): Promise<Project> {
    const response = await apiService.get<ApiResponse<{ project: Project }>>(`/projects/${id}`)
    return response.data!.project
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await apiService.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, data)
    return response.data!.project
  }

  async deleteProject(id: string): Promise<void> {
    await apiService.delete(`/projects/${id}`)
  }

  async addCollaborator(id: string, data: AddCollaboratorRequest): Promise<Project> {
    const response = await apiService.post<ApiResponse<{ project: Project }>>(
      `/projects/${id}/collaborators`,
      data
    )
    return response.data!.project
  }

  async removeCollaborator(id: string, collaboratorId: string): Promise<Project> {
    const response = await apiService.delete<ApiResponse<{ project: Project }>>(
      `/projects/${id}/collaborators/${collaboratorId}`
    )
    return response.data!.project
  }

  async updateCollaboratorRole(
    id: string, 
    collaboratorId: string, 
    role: UserRole
  ): Promise<Project> {
    const response = await apiService.put<ApiResponse<{ project: Project }>>(
      `/projects/${id}/collaborators/${collaboratorId}/role`,
      { role }
    )
    return response.data!.project
  }
}

export const projectsService = new ProjectsService()
export default projectsService