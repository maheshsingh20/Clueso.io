import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

interface RecordingState {
  isRecording: false | 'starting' | 'recording' | 'stopping'
  isPaused: boolean
  duration: number
  hasAudio: boolean
}

interface RecordingSettings {
  includeAudio: boolean
  audioSource: 'system' | 'microphone' | 'both'
  quality: 'low' | 'medium' | 'high'
}

interface ScreenRecordingContextType {
  recordingState: RecordingState
  recordingSettings: RecordingSettings
  recordedBlob: Blob | null
  isUploading: boolean
  uploadProgress: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  togglePause: () => void
  downloadRecording: () => void
  uploadRecording: (projectId?: string) => Promise<void>
  discardRecording: () => void
  updateSettings: (settings: Partial<RecordingSettings>) => void
  formatDuration: (seconds: number) => string
}

const ScreenRecordingContext = createContext<ScreenRecordingContextType | undefined>(undefined)

export const useScreenRecording = () => {
  const context = useContext(ScreenRecordingContext)
  if (!context) {
    throw new Error('useScreenRecording must be used within a ScreenRecordingProvider')
  }
  return context
}

interface ScreenRecordingProviderProps {
  children: React.ReactNode
}

export const ScreenRecordingProvider: React.FC<ScreenRecordingProviderProps> = ({ children }) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    hasAudio: true
  })
  
  const [recordingSettings, setRecordingSettings] = useState<RecordingSettings>({
    includeAudio: true,
    audioSource: 'system',
    quality: 'high'
  })
  
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Start timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingState(prev => ({
        ...prev,
        duration: prev.duration + 1
      }))
    }, 1000)
  }, [])

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Get recording constraints
  const getRecordingConstraints = useCallback(() => {
    const constraints: any = {
      video: {
        mediaSource: 'screen',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: recordingSettings.quality === 'high' ? 30 : recordingSettings.quality === 'medium' ? 24 : 15
      }
    }

    if (recordingSettings.includeAudio) {
      constraints.audio = {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    }

    return constraints
  }, [recordingSettings])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setRecordingState(prev => ({ ...prev, isRecording: 'starting' }))
      
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia(getRecordingConstraints())
      streamRef.current = stream

      // Add microphone audio if requested
      if (recordingSettings.includeAudio && recordingSettings.audioSource !== 'system') {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            } 
          })
          
          const audioTrack = audioStream.getAudioTracks()[0]
          if (audioTrack) {
            stream.addTrack(audioTrack)
          }
        } catch (audioError) {
          console.warn('Could not access microphone:', audioError)
          toast.warning('Could not access microphone, recording system audio only')
        }
      }

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        setRecordingState(prev => ({ 
          ...prev, 
          isRecording: false,
          isPaused: false 
        }))
        stopTimer()
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        toast.success('Screen recording completed!')
      }

      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (mediaRecorderRef.current && recordingState.isRecording === 'recording') {
          stopRecording()
        }
      })

      // Start recording
      mediaRecorder.start(1000)
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: 'recording',
        duration: 0,
        hasAudio: stream.getAudioTracks().length > 0
      }))
      startTimer()
      toast.success('Screen recording started! You can navigate freely while recording.')

    } catch (error) {
      console.error('Error starting recording:', error)
      setRecordingState(prev => ({ ...prev, isRecording: false }))
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Screen recording permission denied')
        } else if (error.name === 'NotSupportedError') {
          toast.error('Screen recording not supported in this browser')
        } else {
          toast.error('Failed to start screen recording')
        }
      }
    }
  }, [recordingSettings, getRecordingConstraints, startTimer, stopTimer, recordingState.isRecording])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording === 'recording') {
      setRecordingState(prev => ({ ...prev, isRecording: 'stopping' }))
      mediaRecorderRef.current.stop()
    }
  }, [recordingState.isRecording])

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording === 'recording') {
      if (recordingState.isPaused) {
        mediaRecorderRef.current.resume()
        startTimer()
        setRecordingState(prev => ({ ...prev, isPaused: false }))
        toast.info('Recording resumed')
      } else {
        mediaRecorderRef.current.pause()
        stopTimer()
        setRecordingState(prev => ({ ...prev, isPaused: true }))
        toast.info('Recording paused')
      }
    }
  }, [recordingState.isRecording, recordingState.isPaused, startTimer, stopTimer])

  // Download recording
  const downloadRecording = useCallback(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Recording downloaded!')
    }
  }, [recordedBlob])

  // Upload recording
  const uploadRecording = useCallback(async (projectId?: string) => {
    if (!recordedBlob) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      const fileName = `screen-recording-${Date.now()}.webm`
      formData.append('video', recordedBlob, fileName)
      formData.append('title', `Screen Recording ${new Date().toLocaleString()}`)
      if (projectId) {
        formData.append('projectId', projectId)
      }

      // Create XMLHttpRequest for upload progress
      const response = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (error) {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('POST', '/api/videos/upload')
        
        // Add auth header if available
        const token = localStorage.getItem('token')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
        
        xhr.send(formData)
      })

      toast.success('Screen recording uploaded successfully!')
      discardRecording()
      return response

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload recording')
      setIsUploading(false)
      setUploadProgress(0)
      throw error
    }
  }, [recordedBlob])

  // Discard recording
  const discardRecording = useCallback(() => {
    setRecordedBlob(null)
    setRecordingState(prev => ({ ...prev, duration: 0 }))
    setIsUploading(false)
    setUploadProgress(0)
  }, [])

  // Update settings
  const updateSettings = useCallback((settings: Partial<RecordingSettings>) => {
    setRecordingSettings(prev => ({ ...prev, ...settings }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [stopTimer])

  const value: ScreenRecordingContextType = {
    recordingState,
    recordingSettings,
    recordedBlob,
    isUploading,
    uploadProgress,
    startRecording,
    stopRecording,
    togglePause,
    downloadRecording,
    uploadRecording,
    discardRecording,
    updateSettings,
    formatDuration
  }

  return (
    <ScreenRecordingContext.Provider value={value}>
      {children}
    </ScreenRecordingContext.Provider>
  )
}