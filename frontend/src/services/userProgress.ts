import { apiService } from './api'

export interface UserProgress {
  _id: string
  userId: string
  completedTutorials: string[]
  onboardingStep: number
  lastActiveDate: string
  achievements: string[]
  preferences: {
    showTutorialHints: boolean
    skipIntroVideos: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  category: string
  videoUrl: string
  steps: string[]
}

export interface HelpArticle {
  id: string
  title: string
  category: string
  content: string
  tags: string[]
  lastUpdated: string
}

export const userProgressService = {
  // Get user progress
  getUserProgress: async (): Promise<UserProgress> => {
    const response: any = await apiService.get('/user-progress')
    return response.data.data
  },

  // Update onboarding step
  updateOnboardingStep: async (step: number): Promise<UserProgress> => {
    const response: any = await apiService.put('/user-progress/onboarding', { step })
    return response.data.data
  },

  // Complete tutorial
  completeTutorial: async (tutorialId: string): Promise<{ 
    data: UserProgress
    newAchievements: string[] 
  }> => {
    const response: any = await apiService.post('/user-progress/tutorial/complete', { tutorialId })
    return {
      data: response.data.data,
      newAchievements: response.data.newAchievements || []
    }
  },

  // Update preferences
  updatePreferences: async (preferences: {
    showTutorialHints?: boolean
    skipIntroVideos?: boolean
  }): Promise<UserProgress> => {
    const response: any = await apiService.put('/user-progress/preferences', { preferences })
    return response.data.data
  },

  // Get tutorials
  getTutorials: async (): Promise<Tutorial[]> => {
    const response: any = await apiService.get('/user-progress/tutorials')
    return response.data.data
  },

  // Get help articles
  getHelpArticles: async (params?: {
    category?: string
    search?: string
  }): Promise<HelpArticle[]> => {
    const response: any = await apiService.get('/user-progress/help', { params })
    return response.data.data
  }
}