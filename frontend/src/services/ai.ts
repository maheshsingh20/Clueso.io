import { apiService } from './api'
import { ApiResponse } from '@clueso/shared'

export interface ScriptEnhancementResult {
  enhancedText: string
  improvements: string[]
}

export interface VoiceoverResult {
  message: string
  audioUrl: string
  duration: number
}

export interface DocumentationResult {
  introduction: string
  steps: Array<{
    title: string
    description: string
    timestamp?: number
  }>
  conclusion: string
}

export interface VideoEffectsResult {
  message: string
  effects: {
    smartZoom: string
    sceneDetection: string
    autoHighlight: string
  }
  processingTime: string
}

export interface VideoStyleResult {
  message: string
  style: {
    colors: string[]
    fonts: string[]
  }
  previewUrl: string
}

class AIService {
  async enhanceScript(text: string, context?: string): Promise<ScriptEnhancementResult> {
    try {
      console.log('🤖 Calling Gemini AI to enhance script...');
      console.log('📝 Text length:', text.length, 'characters');
      
      const response = await apiService.post<ApiResponse<ScriptEnhancementResult>>(
        '/ai/enhance-script',
        { text, context }
      )
      
      console.log('✅ Script enhancement successful:', response.data);
      return response.data!
    } catch (error: any) {
      console.error('❌ Script enhancement failed:', error);
      
      // Provide more detailed error information
      if (error.response?.status === 400) {
        throw new Error('Invalid input: ' + (error.response.data?.message || 'Please check your text'));
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
    }
  }

  async generateVoiceover(text: string, voice: string = 'alloy'): Promise<VoiceoverResult> {
    try {
      console.log('🎤 Generating voiceover with Gemini AI...');
      console.log('📝 Text length:', text.length, 'characters');
      console.log('🗣️ Voice:', voice);
      
      const response = await apiService.post<ApiResponse<VoiceoverResult>>(
        '/ai/generate-voiceover',
        { text, voice }
      )
      
      console.log('✅ Voiceover generation successful:', response.data);
      return response.data!
    } catch (error: any) {
      console.error('❌ Voiceover generation failed:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid input: ' + (error.response.data?.message || 'Text may be too long'));
      } else {
        throw new Error('Voiceover generation failed. Please try again.');
      }
    }
  }

  async generateDocumentation(videoId: string): Promise<DocumentationResult> {
    try {
      console.log('Calling AI generate documentation for video:', videoId);
      const response = await apiService.post<ApiResponse<DocumentationResult>>(
        `/ai/videos/${videoId}/generate-docs`
      )
      console.log('AI generate documentation response:', response.data);
      return response.data!
    } catch (error) {
      console.error('AI generate documentation error:', error);
      throw error;
    }
  }

  async generateSummary(text: string): Promise<{ summary: string }> {
    try {
      console.log('Calling AI generate summary with text:', text.substring(0, 100) + '...');
      const response = await apiService.post<ApiResponse<{ summary: string }>>(
        '/ai/generate-summary',
        { text }
      )
      console.log('AI generate summary response:', response.data);
      return response.data!
    } catch (error) {
      console.error('AI generate summary error:', error);
      throw error;
    }
  }

  async processVideoEffects(videoId: string, effects: {
    smartZoom: boolean
    sceneDetection: boolean
    autoHighlight: boolean
  }): Promise<VideoEffectsResult> {
    try {
      console.log('🎬 Processing video effects with AI...');
      console.log('📹 Video ID:', videoId);
      console.log('⚡ Effects:', effects);
      
      const response = await apiService.post<ApiResponse<VideoEffectsResult>>(
        `/ai/videos/${videoId}/process-effects`,
        { effects }
      )
      
      console.log('✅ Video effects processing successful:', response.data);
      return response.data!
    } catch (error: any) {
      console.error('❌ Video effects processing failed:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Video not found');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to edit this video');
      } else {
        throw new Error('Effects processing failed. Please try again.');
      }
    }
  }

  async applyVideoStyle(videoId: string, style: string): Promise<VideoStyleResult> {
    try {
      console.log('Calling AI apply video style for video:', videoId, 'with style:', style);
      const response = await apiService.post<ApiResponse<VideoStyleResult>>(
        `/ai/videos/${videoId}/apply-style`,
        { style }
      )
      console.log('AI apply video style response:', response.data);
      return response.data!
    } catch (error) {
      console.error('AI apply video style error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService()
export default aiService