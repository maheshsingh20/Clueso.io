import { apiService } from './api'
import { 
  Workspace, 
  ApiResponse, 
  PaginatedResponse,
  UserRole 
} from '@clueso/shared'

export interface CreateWorkspaceRequest {
  name: string
  description?: string
}

export interface UpdateWorkspaceRequest {
  name?: string
  description?: string
  settings?: {
    allowInvites?: boolean
    defaultProjectVisibility?: string
  }
}

export interface WorkspaceQuery {
  page?: number
  limit?: number
  search?: string
}

export interface InviteMemberRequest {
  email: string
  role?: UserRole
}

class WorkspacesService {
  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await apiService.post<ApiResponse<{ workspace: Workspace }>>('/workspaces', data)
    return response.data!.workspace
  }

  async getWorkspaces(query: WorkspaceQuery = {}): Promise<PaginatedResponse<Workspace>> {
    const params = new URLSearchParams()
    
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.search) params.append('search', query.search)

    const response = await apiService.get<ApiResponse<PaginatedResponse<Workspace>>>(
      `/workspaces?${params.toString()}`
    )
    return response.data!
  }

  async getWorkspace(id: string): Promise<Workspace> {
    const response = await apiService.get<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${id}`)
    return response.data!.workspace
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    const response = await apiService.put<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${id}`, data)
    return response.data!.workspace
  }

  async deleteWorkspace(id: string): Promise<void> {
    await apiService.delete(`/workspaces/${id}`)
  }

  async inviteMember(id: string, data: InviteMemberRequest): Promise<Workspace> {
    const response = await apiService.post<ApiResponse<{ workspace: Workspace }>>(
      `/workspaces/${id}/members`,
      data
    )
    return response.data!.workspace
  }

  async removeMember(id: string, memberId: string): Promise<Workspace> {
    const response = await apiService.delete<ApiResponse<{ workspace: Workspace }>>(
      `/workspaces/${id}/members/${memberId}`
    )
    return response.data!.workspace
  }

  async updateMemberRole(
    id: string, 
    memberId: string, 
    role: UserRole
  ): Promise<Workspace> {
    const response = await apiService.put<ApiResponse<{ workspace: Workspace }>>(
      `/workspaces/${id}/members/${memberId}/role`,
      { role }
    )
    return response.data!.workspace
  }
}

export const workspacesService = new WorkspacesService()
export default workspacesService