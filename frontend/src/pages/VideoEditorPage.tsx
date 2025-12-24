import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Share2,
  Edit3,
  Type,
  Palette,
  Zap,
  Save,
  Undo,
  Redo,
  Video
} from 'lucide-react'
import { toast } from 'sonner'
import { videosService } from '../services/videos'
import { aiService } from '../services/ai'
import ExportModal from '../components/ExportModal'

const VideoEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [activeTab, setActiveTab] = useState('script')
  const [showExportModal, setShowExportModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(120) // Default 2 minutes
  const [timelineZoom, setTimelineZoom] = useState(1)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [trackVisibility, setTrackVisibility] = useState({
    video: true,
    voiceover: true,
    captions: true
  })
  const [videoSettings, setVideoSettings] = useState({
    script: 'Welcome to this screen recording. In this video, I\'ll show you how to use our application effectively.',
    voiceSettings: { voice: 'alloy', speed: 1, pitch: 1 },
    captionSettings: { fontSize: 'medium', position: 'bottom', style: 'blackbox' },
    effects: { smartZoom: true, sceneDetection: true, autoHighlight: false },
    style: 'professional'
  })

  const queryClient = useQueryClient()

  // Playback simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1 // Update every 100ms
          if (newTime >= duration) {
            setIsPlaying(false)
            return duration
          }
          return newTime
        })
      }, 100)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentTime, duration])

  // Keyboard shortcuts for timeline control
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case ' ':
          event.preventDefault()
          setIsPlaying(!isPlaying)
          break
        case 'ArrowLeft':
          event.preventDefault()
          setCurrentTime(Math.max(0, currentTime - 5))
          break
        case 'ArrowRight':
          event.preventDefault()
          setCurrentTime(Math.min(duration, currentTime + 5))
          break
        case 'Home':
          event.preventDefault()
          setCurrentTime(0)
          break
        case 'End':
          event.preventDefault()
          setCurrentTime(duration)
          break
        case 'm':
          event.preventDefault()
          setIsMuted(!isMuted)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, currentTime, duration, isMuted])

  const { data: video, isLoading } = useQuery(
    ['video', id],
    () => videosService.getVideo(id!),
    { enabled: !!id }
  )

  // Save video changes mutation
  const saveVideoMutation = useMutation(
    (updates: any) => videosService.updateVideo(id!, updates),
    {
      onSuccess: () => {
        setHasUnsavedChanges(false)
        toast.success('Video saved successfully!')
        queryClient.invalidateQueries(['video', id])
      },
      onError: () => {
        toast.error('Failed to save video changes')
      }
    }
  )

  // AI Enhancement Mutations
  const enhanceScriptMutation = useMutation(
    (text: string) => aiService.enhanceScript(text, `Video: ${video?.title}`),
    {
      onSuccess: (result) => {
        console.log('Script enhancement successful:', result);
        updateSettings('script', result.enhancedText)
        toast.success('Script enhanced with Gemini AI!')
        if (result.improvements && result.improvements.length > 0) {
          toast.info(`Improvements: ${result.improvements.slice(0, 2).join(', ')}`)
        }
      },
      onError: (error: any) => {
        console.error('Script enhancement failed:', error);
        toast.error('Failed to enhance script. Using mock enhancement instead.')
        // Fallback to simple enhancement
        const originalText = videoSettings.script;
        const enhanced = originalText.charAt(0).toUpperCase() + originalText.slice(1);
        updateSettings('script', enhanced + (enhanced.endsWith('.') ? '' : '.'));
      }
    }
  )

  const generateVoiceoverMutation = useMutation(
    ({ text, voice }: { text: string; voice: string }) => aiService.generateVoiceover(text, voice),
    {
      onSuccess: (result) => {
        console.log('Voiceover generation successful:', result);
        toast.success('Voiceover generated successfully!')
        toast.info(`Duration: ${result.duration} seconds`)
      },
      onError: (error: any) => {
        console.error('Voiceover generation failed:', error);
        toast.error('Failed to generate voiceover')
      }
    }
  )

  const processEffectsMutation = useMutation(
    (effects: any) => aiService.processVideoEffects(id!, effects),
    {
      onSuccess: (result) => {
        console.log('Effects processing successful:', result);
        toast.success('Video effects processed!')
        toast.info(`Processing time: ${result.processingTime}`)
      },
      onError: (error: any) => {
        console.error('Effects processing failed:', error);
        toast.error('Failed to process video effects')
      }
    }
  )

  const applyStyleMutation = useMutation(
    (style: string) => aiService.applyVideoStyle(id!, style),
    {
      onSuccess: (result) => {
        console.log('Style application successful:', result);
        toast.success(result.message)
      },
      onError: (error: any) => {
        console.error('Style application failed:', error);
        toast.error('Failed to apply video style')
      }
    }
  )

  // Button handlers
  const handleSave = () => {
    if (!hasUnsavedChanges) {
      toast.info('No changes to save')
      return
    }
    
    saveVideoMutation.mutate({
      title: video?.title,
      description: video?.description,
      settings: videoSettings
    })
  }

  const handleUndo = () => {
    if (undoStack.length === 0) {
      toast.info('Nothing to undo')
      return
    }
    
    const lastState = undoStack[undoStack.length - 1]
    setRedoStack([...redoStack, videoSettings])
    setVideoSettings(lastState)
    setUndoStack(undoStack.slice(0, -1))
    setHasUnsavedChanges(true)
    toast.success('Undone')
  }

  const handleRedo = () => {
    if (redoStack.length === 0) {
      toast.info('Nothing to redo')
      return
    }
    
    const nextState = redoStack[redoStack.length - 1]
    setUndoStack([...undoStack, videoSettings])
    setVideoSettings(nextState)
    setRedoStack(redoStack.slice(0, -1))
    setHasUnsavedChanges(true)
    toast.success('Redone')
  }

  const handleExport = () => {
    if (hasUnsavedChanges) {
      toast.warning('Please save your changes before exporting')
      return
    }
    setShowExportModal(true)
  }

  const handleDirectDownload = () => {
    if (!video?.originalFile?.url) {
      toast.error('No video file available for download')
      return
    }
    
    // Create download link
    const link = document.createElement('a')
    link.href = video.originalFile.url
    link.download = `${video.title}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started!')
  }

  const updateSettings = (section: string, updates: any) => {
    setUndoStack([...undoStack, videoSettings])
    setRedoStack([]) // Clear redo stack when making new changes
    setVideoSettings(prev => ({
      ...prev,
      [section]: { ...(prev as any)[section], ...updates }
    }))
    setHasUnsavedChanges(true)
  }

  // Timeline handlers
  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const timelineWidth = rect.width - 24 // Account for padding
    const newTime = (clickX / timelineWidth) * duration
    setCurrentTime(Math.max(0, Math.min(duration, newTime)))
    toast.info(`Jumped to ${formatTime(newTime)}`)
  }

  const handleTrackToggle = (trackName: string) => {
    setTrackVisibility(prev => ({
      ...prev,
      [trackName]: !prev[trackName as keyof typeof prev]
    }))
    toast.success(`${trackName.charAt(0).toUpperCase() + trackName.slice(1)} track ${trackVisibility[trackName as keyof typeof trackVisibility] ? 'hidden' : 'shown'}`)
  }

  const handleTrackSelect = (trackName: string) => {
    setSelectedTrack(selectedTrack === trackName ? null : trackName)
    if (selectedTrack !== trackName) {
      toast.info(`${trackName.charAt(0).toUpperCase() + trackName.slice(1)} track selected`)
    }
  }

  const handleZoomChange = (zoom: number) => {
    setTimelineZoom(zoom)
    toast.info(`Timeline zoom: ${zoom}x`)
  }

  const getTimelineProgress = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0
  }

  // Add timeline markers for key moments
  const timelineMarkers = [
    { time: 15, label: 'Intro End', color: 'bg-green-500' },
    { time: 45, label: 'Main Content', color: 'bg-blue-500' },
    { time: 90, label: 'Conclusion', color: 'bg-orange-500' }
  ]

  const handleMarkerClick = (time: number, label: string) => {
    setCurrentTime(time)
    toast.info(`Jumped to ${label} at ${formatTime(time)}`)
  }

  const tabs = [
    { id: 'script', label: 'Script', icon: Edit3 },
    { id: 'voiceover', label: 'Voiceover', icon: Volume2 },
    { id: 'captions', label: 'Captions', icon: Type },
    { id: 'effects', label: 'Effects', icon: Zap },
    { id: 'style', label: 'Style', icon: Palette }
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
          <p className="text-red-700 font-bold text-lg">Loading video editor...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100/90 to-red-200/70 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Video className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Video not found</h1>
          <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed text-lg">
            The video you're looking for doesn't exist.
          </p>
          <Link to="/projects" className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-red-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to={`/projects/${video.project}`}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-black text-gray-900">{video.title}</h1>
                <p className="text-sm text-red-600 font-bold">Gemini AI-Enhanced Video Editor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="bg-white/80 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-2 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </button>
              <button 
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="bg-white/80 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-2 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saveVideoMutation.isLoading}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${hasUnsavedChanges ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg' : 'bg-white/80 backdrop-blur-sm border border-red-200 text-red-700 hover:bg-red-50'}`}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveVideoMutation.isLoading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={handleDirectDownload}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button 
                onClick={handleExport}
                className="bg-white/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-300 flex items-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Export & Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200/50 overflow-hidden">
              {/* Video Player */}
              <div className="aspect-video bg-black relative">
                <video
                  ref={(video) => {
                    if (video) {
                      video.muted = isMuted
                      if (isPlaying) {
                        video.play().catch(() => {})
                      } else {
                        video.pause()
                      }
                    }
                  }}
                  className="w-full h-full"
                  src={video.originalFile?.url}
                  poster="/api/placeholder/800/450"
                  controls={false}
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-2xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-gray-900" />
                    ) : (
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    )}
                  </button>
                </div>

                {/* Gemini AI Enhancement Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  🤖 Gemini Enhanced
                </div>
              </div>

              {/* Video Controls */}
              <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-sm font-bold">{formatTime(currentTime)}</span>
                    <div 
                      className="flex-1 bg-gray-700 rounded-full h-2 cursor-pointer"
                      onClick={handleTimelineClick}
                    >
                      <div
                        className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${getTimelineProgress()}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{formatTime(duration)}</span>
                  </div>

                  <button 
                    onClick={() => {
                      toast.info('Video settings panel opened')
                      // In a real app, this would open a settings modal
                    }}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Timeline */}
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-gray-900">Timeline</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-bold">Zoom:</span>
                    <button 
                      onClick={() => handleZoomChange(0.5)}
                      className={`px-3 py-1 text-xs rounded-xl font-bold transition-all duration-300 ${timelineZoom === 0.5 ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      0.5x
                    </button>
                    <button 
                      onClick={() => handleZoomChange(1)}
                      className={`px-3 py-1 text-xs rounded-xl font-bold transition-all duration-300 ${timelineZoom === 1 ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      1x
                    </button>
                    <button 
                      onClick={() => handleZoomChange(2)}
                      className={`px-3 py-1 text-xs rounded-xl font-bold transition-all duration-300 ${timelineZoom === 2 ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      2x
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 font-bold">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>

              {/* Timeline Ruler */}
              <div className="mb-4 px-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>0:00</span>
                  <span>{formatTime(duration / 4)}</span>
                  <span>{formatTime(duration / 2)}</span>
                  <span>{formatTime((duration * 3) / 4)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div 
                  className="h-2 bg-gray-200 rounded-full cursor-pointer relative"
                  onClick={handleTimelineClick}
                >
                  <div
                    className="h-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full"
                    style={{ width: `${getTimelineProgress()}%` }}
                  ></div>
                  
                  {/* Timeline Markers */}
                  {timelineMarkers.map((marker, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkerClick(marker.time, marker.label)
                      }}
                      className={`absolute top-0 w-2 h-2 ${marker.color} rounded-full transform -translate-x-1 hover:scale-125 transition-transform`}
                      style={{ left: `${(marker.time / duration) * 100}%` }}
                      title={`${marker.label} - ${formatTime(marker.time)}`}
                    ></button>
                  ))}
                  
                  {/* Playhead */}
                  <div
                    className="absolute top-0 w-1 h-2 bg-red-500 rounded-full transform -translate-x-0.5 z-10"
                    style={{ left: `${getTimelineProgress()}%` }}
                  ></div>
                </div>
                
                {/* Marker Labels */}
                <div className="flex justify-between text-xs text-gray-500 mt-1 relative">
                  {timelineMarkers.map((marker, index) => (
                    <div
                      key={index}
                      className="absolute transform -translate-x-1/2"
                      style={{ left: `${(marker.time / duration) * 100}%` }}
                    >
                      {marker.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Track Controls */}
              <div className="space-y-3">
                {/* Video Track */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 w-32">
                    <button
                      onClick={() => handleTrackToggle('video')}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        trackVisibility.video ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300'
                      }`}
                    >
                      {trackVisibility.video && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </button>
                    <span className="text-sm font-medium text-gray-700">🎥 Video</span>
                  </div>
                  <div 
                    className={`flex-1 h-8 rounded cursor-pointer transition-all ${
                      selectedTrack === 'video' 
                        ? 'bg-gradient-to-r from-cyan-200 to-cyan-300 ring-2 ring-cyan-400' 
                        : 'bg-gradient-to-r from-cyan-100 to-cyan-200 hover:from-cyan-150 hover:to-cyan-250'
                    } ${!trackVisibility.video ? 'opacity-50' : ''}`}
                    onClick={() => handleTrackSelect('video')}
                  >
                    <div className="flex items-center justify-between px-3 h-full">
                      <span className="text-sm">Original Video Track</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-4 bg-cyan-400 rounded-sm"></div>
                        <div className="w-2 h-4 bg-cyan-500 rounded-sm"></div>
                        <div className="w-2 h-4 bg-cyan-400 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('Video track settings opened')
                      setActiveTab('effects')
                    }}
                    className="btn btn-outline btn-xs"
                  >
                    Edit
                  </button>
                </div>

                {/* Voiceover Track */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 w-32">
                    <button
                      onClick={() => handleTrackToggle('voiceover')}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        trackVisibility.voiceover ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
                      }`}
                    >
                      {trackVisibility.voiceover && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </button>
                    <span className="text-sm font-medium text-gray-700">🎙️ Voiceover</span>
                  </div>
                  <div 
                    className={`flex-1 h-8 rounded cursor-pointer transition-all ${
                      selectedTrack === 'voiceover' 
                        ? 'bg-gradient-to-r from-pink-200 to-pink-300 ring-2 ring-pink-400' 
                        : 'bg-gradient-to-r from-pink-100 to-pink-200 hover:from-pink-150 hover:to-pink-250'
                    } ${!trackVisibility.voiceover ? 'opacity-50' : ''}`}
                    onClick={() => handleTrackSelect('voiceover')}
                  >
                    <div className="flex items-center justify-between px-3 h-full">
                      <span className="text-sm">Gemini AI Voiceover ({videoSettings.voiceSettings.voice})</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-3 bg-pink-400 rounded-sm"></div>
                        <div className="w-1 h-5 bg-pink-500 rounded-sm"></div>
                        <div className="w-1 h-4 bg-pink-400 rounded-sm"></div>
                        <div className="w-1 h-6 bg-pink-600 rounded-sm"></div>
                        <div className="w-1 h-3 bg-pink-400 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('Voiceover settings opened')
                      setActiveTab('voiceover')
                    }}
                    className="btn btn-outline btn-xs"
                  >
                    Edit
                  </button>
                </div>

                {/* Captions Track */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 w-32">
                    <button
                      onClick={() => handleTrackToggle('captions')}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        trackVisibility.captions ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                      }`}
                    >
                      {trackVisibility.captions && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </button>
                    <span className="text-sm font-medium text-gray-700">📝 Captions</span>
                  </div>
                  <div 
                    className={`flex-1 h-8 rounded cursor-pointer transition-all ${
                      selectedTrack === 'captions' 
                        ? 'bg-gradient-to-r from-purple-200 to-purple-300 ring-2 ring-purple-400' 
                        : 'bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-150 hover:to-purple-250'
                    } ${!trackVisibility.captions ? 'opacity-50' : ''}`}
                    onClick={() => handleTrackSelect('captions')}
                  >
                    <div className="flex items-center justify-between px-3 h-full">
                      <span className="text-sm">Auto-Generated Captions ({videoSettings.captionSettings.fontSize})</span>
                      <div className="flex space-x-2">
                        <div className="w-8 h-2 bg-purple-400 rounded-sm"></div>
                        <div className="w-6 h-2 bg-purple-500 rounded-sm"></div>
                        <div className="w-10 h-2 bg-purple-400 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('Caption settings opened')
                      setActiveTab('captions')
                    }}
                    className="btn btn-outline btn-xs"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Timeline Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentTime(0)}
                    className="btn btn-outline btn-xs"
                    title="Go to start (Home)"
                  >
                    ⏮️ Start
                  </button>
                  <button
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                    className="btn btn-outline btn-xs"
                    title="Rewind 10 seconds"
                  >
                    ⏪ -10s
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="btn btn-primary btn-xs"
                    title="Play/Pause (Spacebar)"
                  >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                  <button
                    onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                    className="btn btn-outline btn-xs"
                    title="Forward 10 seconds"
                  >
                    ⏩ +10s
                  </button>
                  <button
                    onClick={() => setCurrentTime(duration)}
                    className="btn btn-outline btn-xs"
                    title="Go to end (End)"
                  >
                    ⏭️ End
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Selected:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedTrack ? selectedTrack.charAt(0).toUpperCase() + selectedTrack.slice(1) : 'None'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    <span className="hidden sm:inline">Shortcuts: Space=Play, ←→=Seek, M=Mute</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200/50">
            {/* Tabs */}
            <div className="border-b border-red-200/50">
              <nav className="flex space-x-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-1 px-3 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-500 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* Script Tab */}
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Gemini AI-Enhanced Script</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm mb-3">
                      <p className="text-gray-700 mb-2">
                        <span className="text-green-600 font-medium">✨ Enhanced:</span> Welcome to this comprehensive screen recording tutorial. In this professionally crafted video, I'll guide you through the effective use of our application, highlighting key features and best practices.
                      </p>
                      <hr className="my-2 border-gray-200" />
                      <p className="text-gray-500 text-xs">
                        <span className="font-medium">Original:</span> Welcome to this screen recording. In this video, I'll show you how to use our application effectively.
                      </p>
                    </div>
                    
                    <textarea
                      className="textarea w-full"
                      rows={6}
                      placeholder="Edit your script here..."
                      value={videoSettings.script}
                      onChange={(e) => updateSettings('script', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        if (!videoSettings.script.trim()) {
                          toast.error('Please enter some script text first')
                          return
                        }
                        enhanceScriptMutation.mutate(videoSettings.script)
                      }}
                      disabled={enhanceScriptMutation.isLoading}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {enhanceScriptMutation.isLoading ? 'Enhancing...' : 'Regenerate with AI'}
                    </button>
                    <button 
                      onClick={() => {
                        updateSettings('script', 'Welcome to this screen recording. In this video, I\'ll show you how to use our application effectively.')
                        toast.info('Script reset to original')
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Voiceover Tab */}
              {activeTab === 'voiceover' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Gemini AI Voiceover Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Voice</label>
                        <select 
                          className="input text-sm"
                          value={videoSettings.voiceSettings.voice}
                          onChange={(e) => updateSettings('voiceSettings', { voice: e.target.value })}
                        >
                          <option value="alloy">Alloy (Professional)</option>
                          <option value="echo">Echo (Friendly)</option>
                          <option value="fable">Fable (Warm)</option>
                          <option value="onyx">Onyx (Deep)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Speed: {videoSettings.voiceSettings.speed}x
                        </label>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2" 
                          step="0.1" 
                          value={videoSettings.voiceSettings.speed}
                          onChange={(e) => updateSettings('voiceSettings', { speed: parseFloat(e.target.value) })}
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Pitch: {videoSettings.voiceSettings.pitch}x
                        </label>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2" 
                          step="0.1" 
                          value={videoSettings.voiceSettings.pitch}
                          onChange={(e) => updateSettings('voiceSettings', { pitch: parseFloat(e.target.value) })}
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!videoSettings.script.trim()) {
                        toast.error('Please add script text first')
                        return
                      }
                      generateVoiceoverMutation.mutate({
                        text: videoSettings.script,
                        voice: videoSettings.voiceSettings.voice
                      })
                    }}
                    disabled={generateVoiceoverMutation.isLoading}
                    className="btn btn-primary btn-sm w-full"
                  >
                    🎙️ {generateVoiceoverMutation.isLoading ? 'Generating...' : 'Regenerate Voiceover'}
                  </button>
                </div>
              )}

              {/* Captions Tab */}
              {activeTab === 'captions' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Caption Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                        <select 
                          className="input text-sm"
                          value={videoSettings.captionSettings.fontSize}
                          onChange={(e) => updateSettings('captionSettings', { fontSize: e.target.value })}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                        <select 
                          className="input text-sm"
                          value={videoSettings.captionSettings.position}
                          onChange={(e) => updateSettings('captionSettings', { position: e.target.value })}
                        >
                          <option value="bottom">Bottom</option>
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => updateSettings('captionSettings', { style: 'blackbox' })}
                            className={`p-2 border rounded text-xs ${
                              videoSettings.captionSettings.style === 'blackbox' 
                                ? 'bg-black text-white border-black' 
                                : 'bg-gray-100 text-black border-gray-300'
                            }`}
                          >
                            Black Box
                          </button>
                          <button 
                            onClick={() => updateSettings('captionSettings', { style: 'outline' })}
                            className={`p-2 border rounded text-xs ${
                              videoSettings.captionSettings.style === 'outline' 
                                ? 'text-black border-black bg-white' 
                                : 'text-gray-600 border-gray-300 bg-gray-100'
                            }`}
                          >
                            Outline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const settings = videoSettings.captionSettings;
                      toast.success(`Captions updated: ${settings.fontSize} size, ${settings.position} position, ${settings.style} style`);
                      // In a real app, this would update the video captions
                      console.log('Caption settings applied:', settings);
                    }}
                    className="btn btn-primary btn-sm w-full"
                  >
                    📝 Apply Caption Settings
                  </button>
                </div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Smart Effects</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Smart Zoom</p>
                          <p className="text-xs text-gray-500">AI-detected focus areas</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={videoSettings.effects.smartZoom}
                          onChange={(e) => updateSettings('effects', { smartZoom: e.target.checked })}
                          className="toggle" 
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Scene Detection</p>
                          <p className="text-xs text-gray-500">Automatic scene transitions</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={videoSettings.effects.sceneDetection}
                          onChange={(e) => updateSettings('effects', { sceneDetection: e.target.checked })}
                          className="toggle" 
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Auto-Highlight</p>
                          <p className="text-xs text-gray-500">Highlight important moments</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={videoSettings.effects.autoHighlight}
                          onChange={(e) => updateSettings('effects', { autoHighlight: e.target.checked })}
                          className="toggle" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      processEffectsMutation.mutate(videoSettings.effects)
                    }}
                    disabled={processEffectsMutation.isLoading}
                    className="btn btn-primary btn-sm w-full"
                  >
                    ⚡ {processEffectsMutation.isLoading ? 'Processing...' : 'Apply Effects'}
                  </button>
                </div>
              )}

              {/* Style Tab */}
              {activeTab === 'style' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Video Style</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => updateSettings('style', 'professional')}
                        className={`p-3 border-2 rounded-lg ${
                          videoSettings.style === 'professional' 
                            ? 'border-cyan-500 bg-cyan-50' 
                            : 'border-gray-300 hover:border-cyan-500'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded mb-2"></div>
                        <p className="text-xs font-medium">Professional</p>
                      </button>
                      <button 
                        onClick={() => updateSettings('style', 'creative')}
                        className={`p-3 border-2 rounded-lg ${
                          videoSettings.style === 'creative' 
                            ? 'border-pink-500 bg-pink-50' 
                            : 'border-gray-300 hover:border-pink-500'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded mb-2"></div>
                        <p className="text-xs font-medium">Creative</p>
                      </button>
                      <button 
                        onClick={() => updateSettings('style', 'modern')}
                        className={`p-3 border-2 rounded-lg ${
                          videoSettings.style === 'modern' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded mb-2"></div>
                        <p className="text-xs font-medium">Modern</p>
                      </button>
                      <button 
                        onClick={() => updateSettings('style', 'vibrant')}
                        className={`p-3 border-2 rounded-lg ${
                          videoSettings.style === 'vibrant' 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-300 hover:border-orange-500'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded mb-2"></div>
                        <p className="text-xs font-medium">Vibrant</p>
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      applyStyleMutation.mutate(videoSettings.style)
                    }}
                    disabled={applyStyleMutation.isLoading}
                    className="btn btn-primary btn-sm w-full"
                  >
                    🎨 {applyStyleMutation.isLoading ? 'Applying...' : 'Apply Style'}
                  </button>
                </div>
              )}

              {/* Fallback for unknown tabs */}
              {!['script', 'voiceover', 'captions', 'effects', 'style'].includes(activeTab) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Unknown tab: {activeTab}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        videoTitle={video.title}
        videoId={video._id}
      />
    </div>
  )
}

export default VideoEditorPage