import { apiService } from './api'
import { ApiResponse } from '@clueso/shared'

export interface FeedbackData {
  id: string
  userId: string
  userName: string
  message: string
  type: 'bug' | 'feature' | 'general' | 'compliment'
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  status: 'new' | 'reviewing' | 'resolved'
}

export interface SubmitFeedbackRequest {
  message: string
  type?: 'bug' | 'feature' | 'general' | 'compliment'
  priority?: 'low' | 'medium' | 'high'
}

class FeedbackService {
  async submitFeedback(feedback: SubmitFeedbackRequest): Promise<FeedbackData> {
    try {
      console.log('📝 Submitting feedback:', feedback);
      
      const response = await apiService.post<ApiResponse<FeedbackData>>(
        '/feedback',
        feedback
      )
      
      console.log('✅ Feedback submitted successfully:', response.data);
      return response.data!
    } catch (error: any) {
      console.error('❌ Feedback submission failed:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid feedback: ' + (error.response.data?.message || 'Please check your input'));
      } else if (error.response?.status === 401) {
        throw new Error('Please log in to submit feedback');
      } else {
        throw new Error('Failed to submit feedback. Please try again.');
      }
    }
  }

  async getFeedback(filters?: {
    status?: string
    type?: string
    limit?: number
  }): Promise<{
    feedback: FeedbackData[]
    total: number
    filtered: number
  }> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      
      const response = await apiService.get<ApiResponse<{
        feedback: FeedbackData[]
        total: number
        filtered: number
      }>>(`/feedback?${params.toString()}`)
      
      return response.data!
    } catch (error: any) {
      console.error('❌ Get feedback failed:', error);
      throw new Error('Failed to load feedback');
    }
  }

  async updateFeedbackStatus(id: string, status: 'new' | 'reviewing' | 'resolved'): Promise<FeedbackData> {
    try {
      const response = await apiService.put<ApiResponse<FeedbackData>>(
        `/feedback/${id}/status`,
        { status }
      )
      
      return response.data!
    } catch (error: any) {
      console.error('❌ Update feedback status failed:', error);
      throw new Error('Failed to update feedback status');
    }
  }
}

export const feedbackService = new FeedbackService()
export default feedbackService