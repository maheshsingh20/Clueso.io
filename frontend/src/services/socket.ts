import { io, Socket } from 'socket.io-client'
import { VideoProgressMessage } from '@clueso/shared'

const WS_URL = (import.meta as any).env.VITE_WS_URL || 'http://localhost:5000'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect(token?: string): void {
    if (this.socket?.connected) return

    this.socket = io(WS_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    // Handle video progress updates
    this.socket.on('video_progress', (message: VideoProgressMessage) => {
      this.emit('video_progress', message)
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
  }

  // Join video room to receive progress updates
  joinVideo(videoId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-video', videoId)
    }
  }

  // Leave video room
  leaveVideo(videoId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-video', videoId)
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event)
      return
    }

    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  get connected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
export default socketService