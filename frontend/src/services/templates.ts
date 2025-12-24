import { apiService } from './api'
import { ApiResponse, PaginatedResponse } from '@clueso/shared'

export interface Template {
  _id: string
  name: string
  description: string
  category: string
  thumbnail: string
  previewVideo?: string
  features: string[]
  tags: string[]
  rating: number
  views: number
  downloads: number
  isPremium: boolean
  price?: number
  duration: number
  aspectRatio: string
  resolution: string
  templateData: {
    scenes: Array<{
      id: string
      type: 'intro' | 'content' | 'outro' | 'transition'
      duration: number
      elements: Array<{
        type: 'text' | 'image' | 'video' | 'shape' | 'animation'
        properties: Record<string, any>
      }>
    }>
    style: {
      colors: string[]
      fonts: string[]
      animations: string[]
    }
    settings: Record<string, any>
  }
  createdBy: {
    _id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface TemplateQuery {
  page?: number
  limit?: number
  category?: string
  search?: string
  isPremium?: boolean
  aspectRatio?: string
  sortBy?: 'popular' | 'rating' | 'newest' | 'name'
}

export interface UseTemplateRequest {
  projectName?: string
  projectDescription?: string
}

class TemplatesService {
  async getTemplates(query: TemplateQuery = {}): Promise<PaginatedResponse<Template> & {
    categories: string[]
    filters: {
      aspectRatios: string[]
      sortOptions: string[]
    }
  }> {
    const params = new URLSearchParams()
    
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.category) params.append('category', query.category)
    if (query.search) params.append('search', query.search)
    if (query.isPremium !== undefined) params.append('isPremium', query.isPremium.toString())
    if (query.aspectRatio) params.append('aspectRatio', query.aspectRatio)
    if (query.sortBy) params.append('sortBy', query.sortBy)

    const response = await apiService.get<ApiResponse<PaginatedResponse<Template> & {
      categories: string[]
      filters: {
        aspectRatios: string[]
        sortOptions: string[]
      }
    }>>(`/templates?${params.toString()}`)
    
    return response.data!
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await apiService.get<ApiResponse<{ template: Template }>>(`/templates/${id}`)
    return response.data!.template
  }

  async getFeaturedTemplates(): Promise<Template[]> {
    const response = await apiService.get<ApiResponse<{ templates: Template[] }>>('/templates/featured')
    return response.data!.templates
  }

  async getPopularTemplates(): Promise<Template[]> {
    const response = await apiService.get<ApiResponse<{ templates: Template[] }>>('/templates/popular')
    return response.data!.templates
  }

  async useTemplate(id: string, data: UseTemplateRequest): Promise<{
    message: string
    templateData: Template['templateData']
    projectName: string
    projectDescription: string
  }> {
    const response = await apiService.post<ApiResponse<{
      message: string
      templateData: Template['templateData']
      projectName: string
      projectDescription: string
    }>>(`/templates/${id}/use`, data)
    
    return response.data!
  }

  async rateTemplate(id: string, rating: number): Promise<{
    message: string
    newRating: number
  }> {
    const response = await apiService.post<ApiResponse<{
      message: string
      newRating: number
    }>>(`/templates/${id}/rate`, { rating })
    
    return response.data!
  }
}

export const templatesService = new TemplatesService()
export default templatesService