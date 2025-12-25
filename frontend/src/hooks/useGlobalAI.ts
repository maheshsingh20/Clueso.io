import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface UseGlobalAIReturn {
  isAIOpen: boolean
  openAI: () => void
  closeAI: () => void
  toggleAI: () => void
  currentContext: string
}

export const useGlobalAI = (): UseGlobalAIReturn => {
  const [isAIOpen, setIsAIOpen] = useState(false)
  const location = useLocation()

  // Generate context based on current page
  const getCurrentContext = (): string => {
    const path = location.pathname
    const searchParams = new URLSearchParams(location.search)
    
    if (path === '/dashboard') {
      return 'Dashboard - User is viewing their main dashboard with recent projects and quick actions. Help with navigation, project creation, or getting started.'
    } else if (path === '/projects') {
      return 'Projects Page - User is browsing their projects and can create new ones. Help with project management, organization, or creation.'
    } else if (path.startsWith('/projects/') && path.includes('/edit')) {
      return 'Video Editor - User is editing a video with AI-powered tools for script enhancement, voiceover, and effects. Help with video editing features, AI tools, or troubleshooting.'
    } else if (path.startsWith('/projects/')) {
      return 'Project Detail - User is viewing a specific project with its videos and settings. Help with project management, video organization, or collaboration.'
    } else if (path === '/workspaces') {
      return 'Workspaces - User is managing their workspaces and team collaboration. Help with team management, workspace settings, or collaboration features.'
    } else if (path === '/templates') {
      return 'Templates - User is browsing video templates and project starters. Help with template selection, customization, or getting started with templates.'
    } else if (path === '/analytics') {
      return 'Analytics - User is viewing their video performance and usage statistics. Help with understanding metrics, improving performance, or interpreting data.'
    } else if (path === '/settings') {
      return 'Settings - User is configuring their account and preferences. Help with account settings, preferences, or platform configuration.'
    } else if (path === '/feedback') {
      return 'Feedback Dashboard - User is viewing and managing feedback submissions. Help with feedback management, status updates, or understanding user input.'
    } else if (path === '/tutorials') {
      return 'Tutorials - User is learning how to use the platform. Help with tutorials, learning resources, or getting started guides.'
    } else if (path === '/help') {
      return 'Help Center - User is looking for help and support. Provide comprehensive assistance with any platform features or troubleshooting.'
    } else {
      return `Current page: ${path} - User is navigating the platform. Provide general assistance and help them find what they need.`
    }
  }

  const currentContext = getCurrentContext()

  // Keyboard shortcut to toggle AI (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setIsAIOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openAI = () => setIsAIOpen(true)
  const closeAI = () => setIsAIOpen(false)
  const toggleAI = () => setIsAIOpen(prev => !prev)

  return {
    isAIOpen,
    openAI,
    closeAI,
    toggleAI,
    currentContext
  }
}