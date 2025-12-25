import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { FeedbackData } from '../services/feedback'

interface UseWebSocketReturn {
  socket: Socket | null
  isConnected: boolean
  newFeedback: FeedbackData | null
  clearNewFeedback: () => void
}

export const useWebSocket = (serverUrl: string = 'http://localhost:5000'): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [newFeedback, setNewFeedback] = useState<FeedbackData | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      setIsConnected(false)
    })

    // Feedback event handlers
    socket.on('new-feedback', (feedback: FeedbackData) => {
      console.log('📝 New feedback received:', feedback)
      setNewFeedback(feedback)
      
      // Show toast notification for new feedback
      toast.info(`New ${feedback.type} feedback from ${feedback.userName}`, {
        description: feedback.message.substring(0, 100) + (feedback.message.length > 100 ? '...' : ''),
        duration: 5000
      })
    })

    socket.on('feedback-updated', (feedback: FeedbackData) => {
      console.log('📝 Feedback updated:', feedback)
      
      toast.success(`Feedback status updated to ${feedback.status}`, {
        description: `Feedback from ${feedback.userName}`,
        duration: 3000
      })
    })

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      socket.disconnect()
    }
  }, [serverUrl])

  const clearNewFeedback = () => {
    setNewFeedback(null)
  }

  return {
    socket: socketRef.current,
    isConnected,
    newFeedback,
    clearNewFeedback
  }
}