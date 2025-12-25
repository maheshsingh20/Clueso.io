import { useState, useEffect, useRef } from 'react'
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
  Video,
  Scissors,
  RotateCcw,
  Crop,
  Filter,
  ZoomIn,
  ZoomOut,
  Move,
  Square,
  Circle,
  Triangle,
  Loader2,
  RefreshCw,
  FileText,
  Mic,
  MessageSquare,
  Sparkles,
  Wand2,
  Brain,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Plus,
  Minus,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { videosService } from '../services/videos'
import { aiService } from '../services/ai'
import ExportModal from '../components/ExportModal'

// Custom CSS for scrollbar hiding
const customStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thumb-red-300::-webkit-scrollbar-thumb {
    background-color: #fca5a5;
    border-radius: 3px;
  }
  .scrollbar-track-red-100::-webkit-scrollbar-track {
    background-color: #fee2e2;
  }
`

const VideoEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  // Editor state
  const [activeTab, setActiveTab] = useState('script')
  const [showExportModal, setShowExportModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])

  // Timeline state
  const [timelineZoom, setTimelineZoom] = useState(1)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [trackVisibility, setTrackVisibility] = useState({
    video: true,
    voiceover: true,
    captions: true,
    effects: true
  })

  // Video processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)

  // Video settings with enhanced features
  const [videoSettings, setVideoSettings] = useState({
    // Script settings
    script: {
      originalText: '',
      enhancedText: '',
      isEnhanced: false,
      confidence: 0,
      language: 'en'
    },

    // Voiceover settings with local file support
    voiceover: {
      voice: 'alloy',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      enabled: true,
      audioUrl: '',
      duration: 0,
      useLocalFile: false,
      localFile: null as File | null,
      localFileUrl: '',
      backgroundMusicEnabled: false,
      backgroundMusicVolume: 0.3,
      noiseReduction: true,
      audioEnhancement: true
    },

    // Caption settings
    captions: {
      enabled: true,
      fontSize: 'medium',
      fontFamily: 'Inter',
      position: 'bottom',
      style: 'blackbox',
      color: '#ffffff',
      backgroundColor: '#000000',
      opacity: 0.8,
      segments: [] as Array<{
        id: string
        text: string
        start: number
        end: number
        confidence: number
      }>
    },

    // Video effects and filters with advanced controls
    effects: {
      // Smart AI effects
      smartZoom: { enabled: true, intensity: 0.5, autoDetect: true, keyframes: [] as Array<{ time: number, x: number, y: number, scale: number }> },
      sceneDetection: { enabled: true, sensitivity: 0.7, autoTransitions: true, transitions: [] as Array<{ time: number, type: string, duration: number }> },
      autoHighlight: { enabled: false, threshold: 0.8, highlights: [] as Array<{ start: number, end: number, type: string }> },

      // Color correction
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      gamma: 1.0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,

      // Advanced filters
      blur: 0,
      sharpen: 0,
      denoise: 0,
      stabilization: false,

      // Creative filters
      filter: 'none', // none, vintage, cinematic, vibrant, bw, sepia, warm, cool, dramatic
      filterIntensity: 1.0,
      vignette: 0,
      grain: 0,
      chromatic: 0,

      // Motion effects
      motionBlur: 0,
      speedRamping: { enabled: false, keyframes: [] as Array<{ time: number, speed: number }> },

      // Transformations
      scale: 1.0,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,

      // Advanced cropping
      crop: {
        enabled: false,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        aspectRatio: 'free', // free, 16:9, 4:3, 1:1, 9:16
        feather: 0
      },

      // Keyframe animation
      keyframes: [] as Array<{
        time: number,
        property: string,
        value: any,
        easing: string
      }>
    },

    // Style and branding
    style: {
      theme: 'professional',
      colorScheme: ['#0891b2', '#1e40af'],
      fonts: ['Inter', 'Roboto'],
      logo: null,
      watermark: null
    },

    // Timeline clips with advanced features
    clips: [
      {
        id: 'main-video',
        type: 'video',
        name: 'Main Video',
        start: 0,
        end: 120,
        track: 'video',
        locked: false,
        visible: true,
        muted: false,
        volume: 1.0,
        speed: 1.0,
        effects: [],
        transitions: {
          fadeIn: { enabled: false, duration: 1.0 },
          fadeOut: { enabled: false, duration: 1.0 }
        },
        color: '#3b82f6',
        thumbnail: '',
        markers: [] as Array<{ time: number, label: string, color: string }>
      }
    ],

    // Audio tracks
    audioTracks: [] as Array<{
      id: string,
      name: string,
      file: File | null,
      url: string,
      start: number,
      end: number,
      volume: 1.0,
      muted: false,
      effects: string[]
    }>,

    // Timeline settings
    timeline: {
      zoom: 1.0,
      snapToGrid: true,
      gridSize: 1.0, // seconds
      playheadPosition: 0,
      selectionStart: 0,
      selectionEnd: 0,
      loopEnabled: false,
      loopStart: 0,
      loopEnd: 120
    }
  })

  const queryClient = useQueryClient()

  // Video metadata and loading
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current

      const handleLoadedMetadata = () => {
        setDuration(video.duration)
        setVideoSettings(prev => ({
          ...prev,
          clips: prev.clips.map(clip =>
            clip.id === 'main-video'
              ? { ...clip, end: video.duration }
              : clip
          )
        }))
      }

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime)
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('timeupdate', handleTimeUpdate)

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [videoRef.current])

  // Playback control
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      video.muted = isMuted
      video.volume = volume

      if (isPlaying) {
        video.play().catch(() => { })
      } else {
        video.pause()
      }
    }
  }, [isPlaying, isMuted, volume])

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleSave()
      }, 30000) // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer)
    }
  }, [hasUnsavedChanges, videoSettings])

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

  // Enhanced AI Processing Mutations
  const extractScriptMutation = useMutation(
    () => aiService.extractScript(id!),
    {
      onMutate: () => {
        setIsProcessing(true)
        setProcessingStage('Extracting script from video...')
        setProcessingProgress(10)
      },
      onSuccess: (result) => {
        setProcessingProgress(100)
        updateSettings('script', {
          originalText: result.originalText,
          enhancedText: result.originalText,
          confidence: result.confidence,
          language: result.language
        })
        toast.success('Script extracted successfully!')
        setIsProcessing(false)
      },
      onError: (error: any) => {
        console.error('Script extraction failed:', error)
        toast.error('Failed to extract script from video')
        setIsProcessing(false)
      }
    }
  )

  const enhanceScriptMutation = useMutation(
    (text: string) => aiService.enhanceScript(text, `Video: ${video?.title}`),
    {
      onMutate: () => {
        setIsProcessing(true)
        setProcessingStage('Enhancing script with Gemini AI...')
        setProcessingProgress(20)
      },
      onSuccess: (result) => {
        setProcessingProgress(100)
        updateSettings('script', {
          enhancedText: result.enhancedText,
          isEnhanced: true
        })
        toast.success('Script enhanced with Gemini AI!')
        if (result.improvements && result.improvements.length > 0) {
          toast.info(`Improvements: ${result.improvements.slice(0, 2).join(', ')}`)
        }
        setIsProcessing(false)
      },
      onError: (error: any) => {
        console.error('Script enhancement failed:', error)
        toast.error('Failed to enhance script')
        setIsProcessing(false)
      }
    }
  )

  const generateVoiceoverMutation = useMutation(
    ({ text, voice }: { text: string; voice: string }) => aiService.generateVoiceover(text, voice),
    {
      onMutate: () => {
        setIsProcessing(true)
        setProcessingStage('Generating AI voiceover...')
        setProcessingProgress(30)
      },
      onSuccess: (result) => {
        setProcessingProgress(100)
        updateSettings('voiceover', {
          audioUrl: result.audioUrl,
          duration: result.duration,
          enabled: true
        })
        toast.success('AI voiceover generated successfully!')
        setIsProcessing(false)
      },
      onError: (error: any) => {
        console.error('Voiceover generation failed:', error)
        toast.error('Failed to generate voiceover')
        setIsProcessing(false)
      }
    }
  )

  const generateCaptionsMutation = useMutation(
    (text: string) => aiService.generateCaptions(text),
    {
      onMutate: () => {
        setIsProcessing(true)
        setProcessingStage('Generating auto-captions...')
        setProcessingProgress(40)
      },
      onSuccess: (result) => {
        setProcessingProgress(100)
        updateSettings('captions', {
          segments: result.segments,
          enabled: true
        })
        toast.success('Auto-captions generated!')
        setIsProcessing(false)
      },
      onError: (error: any) => {
        console.error('Caption generation failed:', error)
        toast.error('Failed to generate captions')
        setIsProcessing(false)
      }
    }
  )

  const processEffectsMutation = useMutation(
    (effects: any) => aiService.processVideoEffects(id!, effects),
    {
      onMutate: () => {
        setIsProcessing(true)
        setProcessingStage('Processing video effects...')
        setProcessingProgress(50)
      },
      onSuccess: (_result) => {
        setProcessingProgress(100)
        toast.success('Video effects processed!')
        setIsProcessing(false)
      },
      onError: (error: any) => {
        console.error('Effects processing failed:', error)
        toast.error('Failed to process video effects')
        setIsProcessing(false)
      }
    }
  )

  const applyStyleMutation = useMutation(
    (style: string) => aiService.applyVideoStyle(id!, style),
    {
      onMutate: () => {
        setIsProcessing(true)
        setProcessingStage('Applying video style...')
        setProcessingProgress(60)
      },
      onSuccess: (result) => {
        setProcessingProgress(100)
        toast.success(result.message)
        setIsProcessing(false)
      },
      onError: (error: any) => {
        console.error('Style application failed:', error)
        toast.error('Failed to apply video style')
        setIsProcessing(false)
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

  // Enhanced utility functions
  const updateSettings = (section: string, updates: any) => {
    setUndoStack([...undoStack, videoSettings])
    setRedoStack([]) // Clear redo stack when making new changes

    if (typeof updates === 'object' && updates !== null) {
      setVideoSettings(prev => ({
        ...prev,
        [section]: { ...(prev as any)[section], ...updates }
      }))
    } else {
      setVideoSettings(prev => ({
        ...prev,
        [section]: updates
      }))
    }
    setHasUnsavedChanges(true)
  }

  const seekTo = (time: number) => {
    const clampedTime = Math.max(0, Math.min(duration, time))
    setCurrentTime(clampedTime)
    if (videoRef.current) {
      videoRef.current.currentTime = clampedTime
    }
    updateSettings('timeline', { playheadPosition: clampedTime })
  }

  // Advanced clip management
  const addClip = (type: 'video' | 'audio' | 'text' | 'image', _file?: File) => {
    const newClip = {
      id: `clip-${Date.now()}`,
      type,
      name: `New ${type} clip`,
      start: currentTime,
      end: currentTime + 10,
      track: type === 'video' ? 'video' : type === 'audio' ? 'audio' : 'effects',
      locked: false,
      visible: true,
      muted: false,
      volume: 1.0,
      speed: 1.0,
      effects: [],
      transitions: {
        fadeIn: { enabled: false, duration: 1.0 },
        fadeOut: { enabled: false, duration: 1.0 }
      },
      color: type === 'video' ? '#3b82f6' : type === 'audio' ? '#10b981' : '#f59e0b',
      thumbnail: '',
      markers: []
    }

    updateSettings('clips', [...videoSettings.clips, newClip])
    toast.success(`${type} clip added to timeline`)
  }

  const addAudioTrack = (file: File) => {
    const audioUrl = URL.createObjectURL(file)
    const newTrack = {
      id: `audio-${Date.now()}`,
      name: file.name,
      file,
      url: audioUrl,
      start: currentTime,
      end: currentTime + 30, // Default 30 seconds, will be updated when loaded
      volume: 1.0,
      muted: false,
      effects: []
    }

    updateSettings('audioTracks', [...videoSettings.audioTracks, newTrack])
    toast.success('Audio track added')
  }

  const deleteClip = (clipId: string) => {
    if (clipId === 'main-video') {
      toast.error('Cannot delete main video clip')
      return
    }

    updateSettings('clips', videoSettings.clips.filter(clip => clip.id !== clipId))
    if (selectedClip === clipId) {
      setSelectedClip(null)
    }
    toast.success('Clip deleted')
  }

  const duplicateClip = (clipId: string) => {
    const clip = videoSettings.clips.find(c => c.id === clipId)
    if (!clip) return

    const newClip = {
      ...clip,
      id: `clip-${Date.now()}`,
      name: `${clip.name} (Copy)`,
      start: clip.end,
      end: clip.end + (clip.end - clip.start)
    }

    updateSettings('clips', [...videoSettings.clips, newClip])
    toast.success('Clip duplicated')
  }

  const splitClip = (clipId: string, time: number) => {
    const clip = videoSettings.clips.find(c => c.id === clipId)
    if (!clip || time <= clip.start || time >= clip.end) return

    const clip1 = { ...clip, end: time }
    const clip2 = {
      ...clip,
      id: `clip-${Date.now()}`,
      name: `${clip.name} (Part 2)`,
      start: time
    }

    const updatedClips = videoSettings.clips.map(c =>
      c.id === clipId ? clip1 : c
    )
    updatedClips.push(clip2)

    updateSettings('clips', updatedClips)
    toast.success('Clip split successfully')
  }

  const trimClip = (clipId: string, newStart: number, newEnd: number) => {
    const updatedClips = videoSettings.clips.map(clip =>
      clip.id === clipId
        ? { ...clip, start: newStart, end: newEnd }
        : clip
    )
    updateSettings('clips', updatedClips)
    toast.success('Clip trimmed')
  }

  const addKeyframe = (property: string, value: any, time: number = currentTime) => {
    const newKeyframe = {
      time,
      property,
      value,
      easing: 'ease-in-out'
    }

    const existingKeyframes = videoSettings.effects.keyframes.filter(
      kf => !(kf.time === time && kf.property === property)
    )

    updateSettings('effects', {
      keyframes: [...existingKeyframes, newKeyframe].sort((a, b) => a.time - b.time)
    })
    toast.success(`Keyframe added for ${property}`)
  }

  const removeKeyframe = (time: number, property: string) => {
    const updatedKeyframes = videoSettings.effects.keyframes.filter(
      kf => !(kf.time === time && kf.property === property)
    )
    updateSettings('effects', { keyframes: updatedKeyframes })
    toast.success('Keyframe removed')
  }

  // File handling functions
  const handleVoiceFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      const audioUrl = URL.createObjectURL(file)
      updateSettings('voiceover', {
        useLocalFile: true,
        localFile: file,
        localFileUrl: audioUrl
      })
      toast.success('Voice file uploaded successfully')
    } else {
      toast.error('Please select a valid audio file')
    }
  }

  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      addAudioTrack(file)
    } else {
      toast.error('Please select a valid audio file')
    }
  }

  // Advanced filter presets
  const applyFilterPreset = (presetName: string) => {
    const presets = {
      cinematic: {
        brightness: -10,
        contrast: 15,
        saturation: -5,
        highlights: -20,
        shadows: 10,
        vignette: 30,
        filter: 'cinematic',
        filterIntensity: 0.8
      },
      vintage: {
        brightness: 5,
        contrast: -10,
        saturation: -15,
        hue: 10,
        grain: 25,
        vignette: 20,
        filter: 'vintage',
        filterIntensity: 0.7
      },
      vibrant: {
        brightness: 5,
        contrast: 20,
        saturation: 25,
        highlights: 10,
        filter: 'vibrant',
        filterIntensity: 0.9
      },
      dramatic: {
        brightness: -5,
        contrast: 30,
        saturation: 10,
        highlights: -30,
        shadows: 20,
        blacks: -15,
        filter: 'dramatic',
        filterIntensity: 1.0
      }
    }

    const preset = presets[presetName as keyof typeof presets]
    if (preset) {
      updateSettings('effects', { ...videoSettings.effects, ...preset })
      toast.success(`${presetName} filter applied`)
    }
  }

  // Video processing functions
  const processFullVideo = async () => {
    try {
      setIsProcessing(true)
      setProcessingStage('Starting full AI processing pipeline...')
      setProcessingProgress(0)

      // Step 1: Extract script
      setProcessingStage('Extracting script from video...')
      setProcessingProgress(20)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 2: Enhance script
      setProcessingStage('Enhancing script with AI...')
      setProcessingProgress(40)
      if (videoSettings.script.originalText) {
        await enhanceScriptMutation.mutateAsync(videoSettings.script.originalText)
      }

      // Step 3: Generate voiceover
      setProcessingStage('Generating AI voiceover...')
      setProcessingProgress(60)
      if (videoSettings.script.enhancedText) {
        await generateVoiceoverMutation.mutateAsync({
          text: videoSettings.script.enhancedText,
          voice: videoSettings.voiceover.voice
        })
      }

      // Step 4: Generate captions
      setProcessingStage('Creating auto-captions...')
      setProcessingProgress(80)
      if (videoSettings.script.enhancedText) {
        await generateCaptionsMutation.mutateAsync(videoSettings.script.enhancedText)
      }

      // Step 5: Apply effects
      setProcessingStage('Applying video effects...')
      setProcessingProgress(90)
      await processEffectsMutation.mutateAsync(videoSettings.effects)

      setProcessingProgress(100)
      setProcessingStage('Processing complete!')
      toast.success('🎉 Full AI processing completed!')

    } catch (error) {
      console.error('Full processing failed:', error)
      toast.error('Processing failed at some stage')
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStage('')
        setProcessingProgress(0)
      }, 2000)
    }
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
    { id: 'script', label: 'Script', icon: FileText },
    { id: 'voiceover', label: 'Voiceover', icon: Mic },
    { id: 'captions', label: 'Captions', icon: MessageSquare },
    { id: 'clips', label: 'Clips', icon: Scissors },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'filters', label: 'Filters', icon: Filter },
    { id: 'transform', label: 'Transform', icon: Move },
    { id: 'audio', label: 'Audio', icon: Volume2 },
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
        <div className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-red-200/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/projects/${video.project}`}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{video.title}</h1>
                  <p className="text-xs text-red-600">AI Video Editor</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                >
                  <Undo className="w-3 h-3" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                >
                  <Redo className="w-3 h-3" />
                </button>

                <button
                  onClick={processFullVideo}
                  disabled={isProcessing}
                  className="bg-red-500 text-white px-3 py-1.5 text-xs rounded hover:bg-red-600 disabled:opacity-50"
                >
                  <Brain className="w-3 h-3 mr-1 inline" />
                  {isProcessing ? 'Processing...' : 'AI Process'}
                </button>

                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saveVideoMutation.isLoading}
                  className={`px-3 py-1.5 text-xs rounded ${hasUnsavedChanges ? 'bg-red-500 text-white hover:bg-red-600' : 'border border-red-200 text-red-700 hover:bg-red-50'}`}
                >
                  <Save className="w-3 h-3 mr-1 inline" />
                  Save
                </button>
                <button
                  onClick={handleDirectDownload}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded hover:bg-red-50"
                >
                  <Download className="w-3 h-3 mr-1 inline" />
                  Download
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded hover:bg-red-50"
                >
                  <Share2 className="w-3 h-3 mr-1 inline" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Video Preview */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-red-200/50 overflow-hidden">
                {/* Video Player */}
                <div className="aspect-video bg-black relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    src={video.originalFile?.url}
                    poster="/api/placeholder/800/450"
                    controls={false}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration)
                      }
                    }}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime)
                      }
                    }}
                  />

                  {/* Canvas overlay for effects preview */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                      opacity: videoSettings.effects.crop.enabled ? 0.3 : 0,
                      mixBlendMode: 'overlay'
                    }}
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg border border-red-200/30"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-gray-900" />
                      ) : (
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">AI Processing</h3>
                        <p className="text-sm mb-4">{processingStage}</p>
                        <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-2">{processingProgress}% Complete</p>
                      </div>
                    </div>
                  )}

                  {/* Gemini AI Enhancement Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    🤖 Gemini Enhanced
                  </div>

                  {/* Current captions overlay */}
                  {videoSettings.captions.enabled && videoSettings.captions.segments.length > 0 && (
                    <div className={`absolute ${videoSettings.captions.position === 'top' ? 'top-4' :
                      videoSettings.captions.position === 'center' ? 'top-1/2 -translate-y-1/2' :
                        'bottom-4'
                      } left-4 right-4 text-center`}>
                      {videoSettings.captions.segments
                        .filter(segment => currentTime >= segment.start && currentTime <= segment.end)
                        .map(segment => (
                          <div
                            key={segment.id}
                            className={`inline-block px-3 py-1 rounded text-${videoSettings.captions.fontSize} font-medium ${videoSettings.captions.style === 'blackbox'
                              ? 'bg-black/80 text-white'
                              : 'text-white'
                              }`}
                            style={{
                              color: videoSettings.captions.color,
                              backgroundColor: videoSettings.captions.style === 'blackbox'
                                ? videoSettings.captions.backgroundColor
                                : 'transparent',
                              textShadow: videoSettings.captions.style === 'outline'
                                ? '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                                : 'none',
                              fontFamily: videoSettings.captions.fontFamily
                            }}
                          >
                            {segment.text}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Enhanced Video Controls */}
                <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => seekTo(Math.max(0, currentTime - 10))}
                      className="text-white hover:text-red-400 transition-colors"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                      className="text-white hover:text-red-400 transition-colors"
                      title="Forward 10s"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>

                    <div className="flex-1 flex items-center space-x-2">
                      <span className="text-sm font-bold">{formatTime(currentTime)}</span>
                      <div
                        className="flex-1 bg-gray-700 rounded-full h-2 cursor-pointer relative"
                        onClick={handleTimelineClick}
                      >
                        <div
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${getTimelineProgress()}%` }}
                        ></div>

                        {/* Clip markers on timeline */}
                        {videoSettings.clips.map(clip => (
                          <div
                            key={clip.id}
                            className="absolute top-0 h-2 bg-yellow-400/50 rounded"
                            style={{
                              left: `${(clip.start / duration) * 100}%`,
                              width: `${((clip.end - clip.start) / duration) * 100}%`
                            }}
                            title={clip.name}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold">{formatTime(duration)}</span>
                    </div>

                    <button
                      onClick={() => {
                        toast.info('Video settings panel opened')
                      }}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Timeline */}
              <div className="mt-4 bg-white rounded-lg border border-red-200/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Timeline</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Zoom:</span>
                    <button
                      onClick={() => handleZoomChange(0.5)}
                      className={`px-2 py-1 text-xs rounded ${timelineZoom === 0.5 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      0.5x
                    </button>
                    <button
                      onClick={() => handleZoomChange(1)}
                      className={`px-2 py-1 text-xs rounded ${timelineZoom === 1 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      1x
                    </button>
                    <button
                      onClick={() => handleZoomChange(2)}
                      className={`px-2 py-1 text-xs rounded ${timelineZoom === 2 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      2x
                    </button>
                  </div>
                </div>

                {/* Timeline Ruler */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>0:00</span>
                    <span>{formatTime(duration / 2)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div
                    className="h-2 bg-gray-200 rounded cursor-pointer relative"
                    onClick={handleTimelineClick}
                  >
                    <div
                      className="h-2 bg-red-500 rounded"
                      style={{ width: `${getTimelineProgress()}%` }}
                    ></div>

                    {/* Playhead */}
                    <div
                      className="absolute top-0 w-0.5 h-2 bg-red-600 z-10"
                      style={{ left: `${getTimelineProgress()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Track Controls */}
                <div className="space-y-3">
                  {/* Video Track */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 w-32">
                      <button
                        onClick={() => handleTrackToggle('video')}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${trackVisibility.video ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300'
                          }`}
                      >
                        {trackVisibility.video && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                      <span className="text-sm font-medium text-gray-700">🎥 Video</span>
                    </div>
                    <div
                      className={`flex-1 h-8 rounded cursor-pointer transition-all ${selectedTrack === 'video'
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
                      className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Voiceover Track */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 w-32">
                      <button
                        onClick={() => handleTrackToggle('voiceover')}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${trackVisibility.voiceover ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
                          }`}
                      >
                        {trackVisibility.voiceover && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                      <span className="text-sm font-medium text-gray-700">🎙️ Voiceover</span>
                    </div>
                    <div
                      className={`flex-1 h-8 rounded cursor-pointer transition-all ${selectedTrack === 'voiceover'
                        ? 'bg-gradient-to-r from-pink-200 to-pink-300 ring-2 ring-pink-400'
                        : 'bg-gradient-to-r from-pink-100 to-pink-200 hover:from-pink-150 hover:to-pink-250'
                        } ${!trackVisibility.voiceover ? 'opacity-50' : ''}`}
                      onClick={() => handleTrackSelect('voiceover')}
                    >
                      <div className="flex items-center justify-between px-3 h-full">
                        <span className="text-sm">Gemini AI Voiceover ({videoSettings.voiceover.voice})</span>
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
                      className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Captions Track */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 w-32">
                      <button
                        onClick={() => handleTrackToggle('captions')}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${trackVisibility.captions ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                          }`}
                      >
                        {trackVisibility.captions && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                      <span className="text-sm font-medium text-gray-700">📝 Captions</span>
                    </div>
                    <div
                      className={`flex-1 h-8 rounded cursor-pointer transition-all ${selectedTrack === 'captions'
                        ? 'bg-gradient-to-r from-purple-200 to-purple-300 ring-2 ring-purple-400'
                        : 'bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-150 hover:to-purple-250'
                        } ${!trackVisibility.captions ? 'opacity-50' : ''}`}
                      onClick={() => handleTrackSelect('captions')}
                    >
                      <div className="flex items-center justify-between px-3 h-full">
                        <span className="text-sm">Auto-Generated Captions ({videoSettings.captions.fontSize})</span>
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
                      className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Timeline Controls */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentTime(0)}
                      className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                      className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      -10s
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                      className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      +10s
                    </button>
                    <button
                      onClick={() => setCurrentTime(duration)}
                      className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      End
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50">
              {/* Tabs - Horizontal Sliding */}
              <div className="border-b border-red-200/50 bg-white/50">
                <div className="relative">
                  <div
                    id="tab-container"
                    className="flex overflow-x-auto scrollbar-hide p-3 space-x-1 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-shrink-0 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                            : 'text-gray-600 hover:text-red-700 hover:bg-red-50/80 backdrop-blur-sm'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Navigation arrows */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('tab-container')
                      if (container) container.scrollLeft -= 100
                    }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 backdrop-blur-sm border border-red-200 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById('tab-container')
                      if (container) container.scrollLeft += 100
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 backdrop-blur-sm border border-red-200 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm"
                  >
                    ›
                  </button>

                  {/* Tab indicator dots */}
                  <div className="flex justify-center space-x-1 mt-2 pb-2">
                    {tabs.map((tab, index) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${activeTab === tab.id
                          ? 'bg-red-500'
                          : 'bg-red-200 hover:bg-red-300'
                          }`}
                        title={tab.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Content - Fixed Height with Better Scrolling */}
              <div className="h-[calc(100vh-400px)] min-h-96 overflow-hidden">
                <div className="p-4 h-full overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-100">

                  {/* Script Tab - Enhanced */}
                  {activeTab === 'script' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">AI Script Processing</h4>
                        <button
                          onClick={() => extractScriptMutation.mutate()}
                          disabled={extractScriptMutation.isLoading}
                          className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          <FileText className="w-3 h-3 mr-1 inline" />
                          {extractScriptMutation.isLoading ? 'Extracting...' : 'Extract'}
                        </button>
                      </div>

                      {/* Original vs Enhanced Script Comparison */}
                      <div className="space-y-3">
                        {videoSettings.script.originalText && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Original Script
                            </label>
                            <div className="text-xs text-gray-700 leading-relaxed max-h-20 overflow-y-auto">
                              {videoSettings.script.originalText}
                            </div>
                          </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded p-3">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Enhanced Script
                            {videoSettings.script.isEnhanced && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                AI Enhanced
                              </span>
                            )}
                          </label>
                          <textarea
                            className="w-full p-2 border border-gray-200 rounded text-xs resize-none"
                            rows={6}
                            placeholder="Your enhanced script will appear here..."
                            value={videoSettings.script.enhancedText}
                            onChange={(e) => updateSettings('script', { enhancedText: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const textToEnhance = videoSettings.script.enhancedText || videoSettings.script.originalText
                            if (!textToEnhance.trim()) {
                              toast.error('Please extract or enter script text first')
                              return
                            }
                            enhanceScriptMutation.mutate(textToEnhance)
                          }}
                          disabled={enhanceScriptMutation.isLoading}
                          className="bg-red-500 text-white px-3 py-1.5 text-xs rounded hover:bg-red-600 disabled:opacity-50 flex-1"
                        >
                          <Wand2 className="w-3 h-3 mr-1 inline" />
                          {enhanceScriptMutation.isLoading ? 'Enhancing...' : 'Enhance'}
                        </button>
                        <button
                          onClick={() => {
                            updateSettings('script', {
                              enhancedText: videoSettings.script.originalText,
                              isEnhanced: false
                            })
                            toast.info('Script reset to original')
                          }}
                          className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Voiceover Tab - Enhanced with Local Upload */}
                  {activeTab === 'voiceover' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900">Voice & Audio</h4>
                        <button
                          onClick={() => updateSettings('voiceover', { enabled: !videoSettings.voiceover.enabled })}
                          className={`px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${videoSettings.voiceover.enabled ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 hover:bg-red-50'}`}
                        >
                          {videoSettings.voiceover.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Voice Source Selection - Compact */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900 text-sm">Voice Source</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateSettings('voiceover', { useLocalFile: false })}
                            className={`flex-1 p-3 border rounded-lg transition-all duration-200 text-center ${!videoSettings.voiceover.useLocalFile
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-red-200/50 hover:border-red-300 bg-white/90 text-gray-700'
                              }`}
                          >
                            <Brain className="w-5 h-5 mx-auto mb-1" />
                            <p className="text-xs font-medium">AI Generated</p>
                          </button>
                          <button
                            onClick={() => updateSettings('voiceover', { useLocalFile: true })}
                            className={`flex-1 p-3 border rounded-lg transition-all duration-200 text-center ${videoSettings.voiceover.useLocalFile
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-red-200/50 hover:border-red-300 bg-white/90 text-gray-700'
                              }`}
                          >
                            <Upload className="w-5 h-5 mx-auto mb-1" />
                            <p className="text-xs font-medium">Upload Audio</p>
                          </button>
                        </div>
                      </div>

                      {/* AI Voice Settings */}
                      {!videoSettings.voiceover.useLocalFile && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Voice</label>
                              <select
                                className="w-full p-2 border border-red-200/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-sm"
                                value={videoSettings.voiceover.voice}
                                onChange={(e) => updateSettings('voiceover', { voice: e.target.value })}
                              >
                                <option value="alloy">Alloy</option>
                                <option value="echo">Echo</option>
                                <option value="fable">Fable</option>
                                <option value="onyx">Onyx</option>
                                <option value="nova">Nova</option>
                                <option value="shimmer">Shimmer</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Volume: {Math.round(videoSettings.voiceover.volume * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoSettings.voiceover.volume}
                                onChange={(e) => updateSettings('voiceover', { volume: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Speed: {videoSettings.voiceover.speed}x
                              </label>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={videoSettings.voiceover.speed}
                                onChange={(e) => updateSettings('voiceover', { speed: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Pitch: {videoSettings.voiceover.pitch}x
                              </label>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={videoSettings.voiceover.pitch}
                                onChange={(e) => updateSettings('voiceover', { pitch: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const textToSpeak = videoSettings.script.enhancedText || videoSettings.script.originalText
                              if (!textToSpeak.trim()) {
                                toast.error('Please add script text first')
                                return
                              }
                              generateVoiceoverMutation.mutate({
                                text: textToSpeak,
                                voice: videoSettings.voiceover.voice
                              })
                            }}
                            disabled={generateVoiceoverMutation.isLoading}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full"
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            {generateVoiceoverMutation.isLoading ? 'Generating...' : 'Generate AI Voice'}
                          </button>
                        </div>
                      )}

                      {/* Local File Upload */}
                      {videoSettings.voiceover.useLocalFile && (
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-900">Upload Voice File</h5>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleVoiceFileUpload}
                              className="hidden"
                              id="voice-upload"
                            />
                            <label htmlFor="voice-upload" className="cursor-pointer">
                              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p className="text-lg font-medium text-gray-700 mb-2">
                                {videoSettings.voiceover.localFile ? 'Change Voice File' : 'Upload Voice File'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Supports MP3, WAV, M4A, and other audio formats
                              </p>
                            </label>
                          </div>

                          {videoSettings.voiceover.localFile && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-green-800">
                                    ✅ {videoSettings.voiceover.localFile.name}
                                  </p>
                                  <p className="text-sm text-green-600">
                                    {(videoSettings.voiceover.localFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <audio controls className="h-8">
                                  <source src={videoSettings.voiceover.localFileUrl} />
                                </audio>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Audio Enhancement Options */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Audio Enhancement</h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Noise Reduction</p>
                              <p className="text-xs text-gray-500">Remove background noise</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={videoSettings.voiceover.noiseReduction}
                              onChange={(e) => updateSettings('voiceover', { noiseReduction: e.target.checked })}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Audio Enhancement</p>
                              <p className="text-xs text-gray-500">Improve audio quality</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={videoSettings.voiceover.audioEnhancement}
                              onChange={(e) => updateSettings('voiceover', { audioEnhancement: e.target.checked })}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Background Music</p>
                              <p className="text-xs text-gray-500">Add subtle background music</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={videoSettings.voiceover.backgroundMusicEnabled}
                              onChange={(e) => updateSettings('voiceover', { backgroundMusicEnabled: e.target.checked })}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                          </div>

                          {videoSettings.voiceover.backgroundMusicEnabled && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Background Music Volume: {Math.round(videoSettings.voiceover.backgroundMusicVolume * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoSettings.voiceover.backgroundMusicVolume}
                                onChange={(e) => updateSettings('voiceover', { backgroundMusicVolume: parseFloat(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {(videoSettings.voiceover.audioUrl || videoSettings.voiceover.localFileUrl) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                              ✅ Voice Ready ({videoSettings.voiceover.duration || 'Unknown'}s)
                            </span>
                            <audio controls className="h-8">
                              <source src={videoSettings.voiceover.audioUrl || videoSettings.voiceover.localFileUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Captions Tab - Enhanced */}
                  {activeTab === 'captions' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900">Auto-Generated Captions</h4>
                        <button
                          onClick={() => updateSettings('captions', { enabled: !videoSettings.captions.enabled })}
                          className={`px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${videoSettings.captions.enabled ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 hover:bg-red-50'}`}
                        >
                          {videoSettings.captions.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                            <select
                              className="w-full p-2 border border-red-200/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-sm"
                              value={videoSettings.captions.fontSize}
                              onChange={(e) => updateSettings('captions', { fontSize: e.target.value })}
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                              <option value="xl">Extra Large</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                            <select
                              className="w-full p-2 border border-red-200/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-sm"
                              value={videoSettings.captions.fontFamily}
                              onChange={(e) => updateSettings('captions', { fontFamily: e.target.value })}
                            >
                              <option value="Inter">Inter</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                            <select
                              className="w-full p-2 border border-red-200/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-sm"
                              value={videoSettings.captions.position}
                              onChange={(e) => updateSettings('captions', { position: e.target.value })}
                            >
                              <option value="bottom">Bottom</option>
                              <option value="top">Top</option>
                              <option value="center">Center</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                            <select
                              className="w-full p-2 border border-red-200/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-sm"
                              value={videoSettings.captions.style}
                              onChange={(e) => updateSettings('captions', { style: e.target.value })}
                            >
                              <option value="blackbox">Black Box</option>
                              <option value="outline">Text Outline</option>
                              <option value="shadow">Drop Shadow</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                            <input
                              type="color"
                              value={videoSettings.captions.color}
                              onChange={(e) => updateSettings('captions', { color: e.target.value })}
                              className="w-full h-10 rounded-lg border border-red-200/50 cursor-pointer focus:ring-2 focus:ring-red-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                            <input
                              type="color"
                              value={videoSettings.captions.backgroundColor}
                              onChange={(e) => updateSettings('captions', { backgroundColor: e.target.value })}
                              className="w-full h-10 rounded-lg border border-red-200/50 cursor-pointer focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>

                        {videoSettings.captions.segments.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-800">
                                ✅ {videoSettings.captions.segments.length} Caption Segments Generated
                              </span>
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {videoSettings.captions.segments.slice(0, 3).map(segment => (
                                <div key={segment.id} className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                                  {formatTime(segment.start)} - {formatTime(segment.end)}: {segment.text}
                                </div>
                              ))}
                              {videoSettings.captions.segments.length > 3 && (
                                <div className="text-xs text-blue-600">
                                  ... and {videoSettings.captions.segments.length - 3} more segments
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const textForCaptions = videoSettings.script.enhancedText || videoSettings.script.originalText
                          if (!textForCaptions.trim()) {
                            toast.error('Please add script text first')
                            return
                          }
                          generateCaptionsMutation.mutate(textForCaptions)
                        }}
                        disabled={generateCaptionsMutation.isLoading}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-full"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {generateCaptionsMutation.isLoading ? 'Generating...' : 'Generate Auto-Captions'}
                      </button>
                    </div>
                  )}

                  {/* Clips Tab - New Advanced Clip Management */}
                  {activeTab === 'clips' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900">Clip Management</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => addClip('video')}
                            className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-2 rounded-lg font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Clip
                          </button>
                        </div>
                      </div>

                      {/* Add New Clips */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Add New Content</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => addClip('video')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                          >
                            <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium">Video Clip</p>
                          </button>

                          <div>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleAudioFileUpload}
                              className="hidden"
                              id="audio-upload"
                            />
                            <label
                              htmlFor="audio-upload"
                              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors cursor-pointer"
                            >
                              <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm font-medium">Audio Track</p>
                            </label>
                          </div>

                          <button
                            onClick={() => addClip('text')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors"
                          >
                            <Type className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium">Text Overlay</p>
                          </button>

                          <button
                            onClick={() => addClip('image')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 transition-colors"
                          >
                            <Square className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium">Image</p>
                          </button>
                        </div>
                      </div>

                      {/* Existing Clips */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Timeline Clips ({videoSettings.clips.length})</h5>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {videoSettings.clips.map((clip, index) => (
                            <div
                              key={clip.id}
                              className={`p-3 border rounded-lg transition-all cursor-pointer ${selectedClip === clip.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                              onClick={() => setSelectedClip(selectedClip === clip.id ? null : clip.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: clip.color }}
                                  ></div>
                                  <div>
                                    <p className="font-medium text-sm">{clip.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatTime(clip.start)} - {formatTime(clip.end)}
                                      ({formatTime(clip.end - clip.start)})
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      seekTo(clip.start)
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Go to start"
                                  >
                                    <Play className="w-3 h-3" />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      duplicateClip(clip.id)
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Duplicate"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      splitClip(clip.id, currentTime)
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Split at playhead"
                                    disabled={currentTime <= clip.start || currentTime >= clip.end}
                                  >
                                    <Scissors className="w-3 h-3" />
                                  </button>

                                  {clip.id !== 'main-video' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteClip(clip.id)
                                      }}
                                      className="p-1 hover:bg-red-200 rounded text-red-600"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const newLocked = !clip.locked
                                      const updatedClips = videoSettings.clips.map(c =>
                                        c.id === clip.id ? { ...c, locked: newLocked } : c
                                      )
                                      updateSettings('clips', updatedClips)
                                    }}
                                    className={`p-1 rounded ${clip.locked ? 'text-red-600 bg-red-100' : 'hover:bg-gray-200'}`}
                                    title={clip.locked ? 'Unlock' : 'Lock'}
                                  >
                                    {clip.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>

                              {/* Clip Details when selected */}
                              {selectedClip === clip.id && (
                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max={duration}
                                        value={clip.start}
                                        onChange={(e) => {
                                          const newStart = parseFloat(e.target.value)
                                          if (newStart < clip.end) {
                                            trimClip(clip.id, newStart, clip.end)
                                          }
                                        }}
                                        className="w-full p-1 border border-red-200/50 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90"
                                        disabled={clip.locked}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max={duration}
                                        value={clip.end}
                                        onChange={(e) => {
                                          const newEnd = parseFloat(e.target.value)
                                          if (newEnd > clip.start) {
                                            trimClip(clip.id, clip.start, newEnd)
                                          }
                                        }}
                                        className="w-full p-1 border border-red-200/50 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90"
                                        disabled={clip.locked}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Volume: {Math.round((clip.volume || 1) * 100)}%
                                      </label>
                                      <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={clip.volume || 1}
                                        onChange={(e) => {
                                          const updatedClips = videoSettings.clips.map(c =>
                                            c.id === clip.id ? { ...c, volume: parseFloat(e.target.value) } : c
                                          )
                                          updateSettings('clips', updatedClips)
                                        }}
                                        className="w-full"
                                        disabled={clip.locked}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Speed: {(clip.speed || 1).toFixed(1)}x
                                      </label>
                                      <input
                                        type="range"
                                        min="0.25"
                                        max="4"
                                        step="0.25"
                                        value={clip.speed || 1}
                                        onChange={(e) => {
                                          const updatedClips = videoSettings.clips.map(c =>
                                            c.id === clip.id ? { ...c, speed: parseFloat(e.target.value) } : c
                                          )
                                          updateSettings('clips', updatedClips)
                                        }}
                                        className="w-full"
                                        disabled={clip.locked}
                                      />
                                    </div>
                                  </div>

                                  {/* Transitions */}
                                  <div className="space-y-2">
                                    <h6 className="text-xs font-medium text-gray-700">Transitions</h6>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={clip.transitions?.fadeIn?.enabled || false}
                                          onChange={(e) => {
                                            const updatedClips = videoSettings.clips.map(c =>
                                              c.id === clip.id
                                                ? {
                                                  ...c,
                                                  transitions: {
                                                    ...c.transitions,
                                                    fadeIn: { ...c.transitions?.fadeIn, enabled: e.target.checked }
                                                  }
                                                }
                                                : c
                                            )
                                            updateSettings('clips', updatedClips)
                                          }}
                                          className="rounded"
                                          disabled={clip.locked}
                                        />
                                        <span className="text-xs">Fade In</span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={clip.transitions?.fadeOut?.enabled || false}
                                          onChange={(e) => {
                                            const updatedClips = videoSettings.clips.map(c =>
                                              c.id === clip.id
                                                ? {
                                                  ...c,
                                                  transitions: {
                                                    ...c.transitions,
                                                    fadeOut: { ...c.transitions?.fadeOut, enabled: e.target.checked }
                                                  }
                                                }
                                                : c
                                            )
                                            updateSettings('clips', updatedClips)
                                          }}
                                          className="rounded"
                                          disabled={clip.locked}
                                        />
                                        <span className="text-xs">Fade Out</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Audio Tracks */}
                      {videoSettings.audioTracks.length > 0 && (
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-900">Audio Tracks ({videoSettings.audioTracks.length})</h5>
                          <div className="space-y-2">
                            {videoSettings.audioTracks.map((track) => (
                              <div key={track.id} className="p-3 border border-green-200 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm text-green-800">{track.name}</p>
                                    <p className="text-xs text-green-600">
                                      {formatTime(track.start)} - {formatTime(track.end)}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max="2"
                                      step="0.1"
                                      value={track.volume}
                                      onChange={(e) => {
                                        const updatedTracks = videoSettings.audioTracks.map(t =>
                                          t.id === track.id ? { ...t, volume: parseFloat(e.target.value) } : t
                                        )
                                        updateSettings('audioTracks', updatedTracks)
                                      }}
                                      className="w-20"
                                    />
                                    <button
                                      onClick={() => {
                                        const updatedTracks = videoSettings.audioTracks.filter(t => t.id !== track.id)
                                        updateSettings('audioTracks', updatedTracks)
                                      }}
                                      className="p-1 hover:bg-red-200 rounded text-red-600"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Audio Tab - New Advanced Audio Controls */}
                  {activeTab === 'audio' && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-gray-900">Audio Controls</h4>

                      {/* Master Audio Controls */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Master Audio</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Master Volume: {Math.round(volume * 100)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={(e) => setVolume(parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => setIsMuted(!isMuted)}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${isMuted ? 'bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 hover:bg-red-50' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'}`}
                            >
                              {isMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                              {isMuted ? 'Unmute' : 'Mute'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Audio Enhancement */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Audio Enhancement</h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Auto Normalize</p>
                              <p className="text-xs text-gray-500">Automatically balance audio levels</p>
                            </div>
                            <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2" />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Noise Gate</p>
                              <p className="text-xs text-gray-500">Remove background noise during silence</p>
                            </div>
                            <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2" />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Compressor</p>
                              <p className="text-xs text-gray-500">Even out volume levels</p>
                            </div>
                            <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2" />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">EQ Enhancement</p>
                              <p className="text-xs text-gray-500">Improve frequency balance</p>
                            </div>
                            <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2" />
                          </div>
                        </div>
                      </div>

                      {/* Equalizer */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Equalizer</h5>
                        <div className="grid grid-cols-5 gap-2">
                          {['60Hz', '170Hz', '350Hz', '1kHz', '3.5kHz'].map((freq, index) => (
                            <div key={freq} className="text-center">
                              <label className="block text-xs font-medium text-gray-700 mb-2">{freq}</label>
                              <input
                                type="range"
                                min="-12"
                                max="12"
                                step="1"
                                defaultValue="0"
                                className="w-full transform rotate-90 h-20"
                                style={{ transform: 'rotate(90deg)' }}
                              />
                              <div className="text-xs text-gray-500 mt-2">0dB</div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center space-x-2">
                          <button className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200">Reset</button>
                          <button className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200">Vocal</button>
                          <button className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200">Music</button>
                          <button className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200">Bass Boost</button>
                        </div>
                      </div>

                      {/* Audio Effects */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Audio Effects</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reverb</label>
                            <input type="range" min="0" max="100" defaultValue="0" className="w-full" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Echo</label>
                            <input type="range" min="0" max="100" defaultValue="0" className="w-full" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chorus</label>
                            <input type="range" min="0" max="100" defaultValue="0" className="w-full" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Distortion</label>
                            <input type="range" min="0" max="100" defaultValue="0" className="w-full" />
                          </div>
                        </div>
                      </div>

                      {/* Audio Analysis */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Audio Analysis</h5>
                        <div className="bg-gray-900 rounded-lg p-4 h-32 flex items-end justify-center space-x-1">
                          {Array.from({ length: 32 }, (_, i) => (
                            <div
                              key={i}
                              className="bg-green-500 w-2 rounded-t"
                              style={{
                                height: `${Math.random() * 80 + 20}%`,
                                opacity: isPlaying ? 1 : 0.3
                              }}
                            ></div>
                          ))}
                        </div>
                        <div className="text-center text-sm text-gray-500">
                          Audio Spectrum Analyzer
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex-1">
                          Reset All Audio
                        </button>
                        <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center flex-1">
                          <Volume2 className="w-4 h-4 mr-2" />
                          Apply Audio Settings
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'effects' && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-gray-900">Smart AI Effects</h4>

                      <div className="space-y-4">
                        {/* Smart Zoom */}
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">Smart Zoom</h5>
                              <p className="text-sm text-gray-600">AI-detected focus areas with automatic zooming</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={videoSettings.effects.smartZoom.enabled}
                              onChange={(e) => updateSettings('effects', {
                                smartZoom: { ...videoSettings.effects.smartZoom, enabled: e.target.checked }
                              })}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                          </div>
                          {videoSettings.effects.smartZoom.enabled && (
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700">
                                Intensity: {Math.round(videoSettings.effects.smartZoom.intensity * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoSettings.effects.smartZoom.intensity}
                                onChange={(e) => updateSettings('effects', {
                                  smartZoom: { ...videoSettings.effects.smartZoom, intensity: parseFloat(e.target.value) }
                                })}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>

                        {/* Scene Detection */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">Scene Detection</h5>
                              <p className="text-sm text-gray-600">Automatic scene transitions and cuts</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={videoSettings.effects.sceneDetection.enabled}
                              onChange={(e) => updateSettings('effects', {
                                sceneDetection: { ...videoSettings.effects.sceneDetection, enabled: e.target.checked }
                              })}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                          </div>
                          {videoSettings.effects.sceneDetection.enabled && (
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700">
                                Sensitivity: {Math.round(videoSettings.effects.sceneDetection.sensitivity * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoSettings.effects.sceneDetection.sensitivity}
                                onChange={(e) => updateSettings('effects', {
                                  sceneDetection: { ...videoSettings.effects.sceneDetection, sensitivity: parseFloat(e.target.value) }
                                })}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>

                        {/* Auto Highlight */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">Auto-Highlight</h5>
                              <p className="text-sm text-gray-600">Highlight important moments automatically</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={videoSettings.effects.autoHighlight.enabled}
                              onChange={(e) => updateSettings('effects', {
                                autoHighlight: { ...videoSettings.effects.autoHighlight, enabled: e.target.checked }
                              })}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                          </div>
                          {videoSettings.effects.autoHighlight.enabled && (
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700">
                                Threshold: {Math.round(videoSettings.effects.autoHighlight.threshold * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoSettings.effects.autoHighlight.threshold}
                                onChange={(e) => updateSettings('effects', {
                                  autoHighlight: { ...videoSettings.effects.autoHighlight, threshold: parseFloat(e.target.value) }
                                })}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          processEffectsMutation.mutate(videoSettings.effects)
                        }}
                        disabled={processEffectsMutation.isLoading}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {processEffectsMutation.isLoading ? 'Processing...' : 'Apply AI Effects'}
                      </button>
                    </div>
                  )}

                  {/* Filters Tab - Enhanced with Advanced Controls */}
                  {activeTab === 'filters' && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-gray-900">Video Filters & Color Grading</h4>

                      {/* Quick Filter Presets */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Quick Presets</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'cinematic', name: 'Cinematic', gradient: 'from-blue-900 to-orange-600' },
                            { id: 'vintage', name: 'Vintage', gradient: 'from-yellow-600 to-orange-700' },
                            { id: 'vibrant', name: 'Vibrant', gradient: 'from-pink-500 to-purple-600' },
                            { id: 'dramatic', name: 'Dramatic', gradient: 'from-gray-900 to-red-800' }
                          ].map(preset => (
                            <button
                              key={preset.id}
                              onClick={() => applyFilterPreset(preset.id)}
                              className="p-4 border-2 border-red-200/50 rounded-lg hover:border-red-400 hover:shadow-md transition-all duration-200 bg-white/90 backdrop-blur-sm"
                            >
                              <div className={`w-full h-16 bg-gradient-to-r ${preset.gradient} rounded-lg mb-2`}></div>
                              <p className="text-sm font-medium">{preset.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Correction */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Color Correction</h5>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Brightness: {videoSettings.effects.brightness > 0 ? '+' : ''}{videoSettings.effects.brightness}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.brightness}
                              onChange={(e) => updateSettings('effects', { brightness: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Contrast: {videoSettings.effects.contrast > 0 ? '+' : ''}{videoSettings.effects.contrast}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.contrast}
                              onChange={(e) => updateSettings('effects', { contrast: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Saturation: {videoSettings.effects.saturation > 0 ? '+' : ''}{videoSettings.effects.saturation}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.saturation}
                              onChange={(e) => updateSettings('effects', { saturation: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hue: {videoSettings.effects.hue}°
                            </label>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={videoSettings.effects.hue}
                              onChange={(e) => updateSettings('effects', { hue: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Color Grading */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Advanced Color Grading</h5>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gamma: {videoSettings.effects.gamma?.toFixed(2) || '1.00'}
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="3"
                              step="0.1"
                              value={videoSettings.effects.gamma || 1.0}
                              onChange={(e) => updateSettings('effects', { gamma: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Exposure: {videoSettings.effects.exposure > 0 ? '+' : ''}{videoSettings.effects.exposure}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.exposure || 0}
                              onChange={(e) => updateSettings('effects', { exposure: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Highlights: {videoSettings.effects.highlights > 0 ? '+' : ''}{videoSettings.effects.highlights}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.highlights || 0}
                              onChange={(e) => updateSettings('effects', { highlights: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Shadows: {videoSettings.effects.shadows > 0 ? '+' : ''}{videoSettings.effects.shadows}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.shadows || 0}
                              onChange={(e) => updateSettings('effects', { shadows: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Whites: {videoSettings.effects.whites > 0 ? '+' : ''}{videoSettings.effects.whites}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.whites || 0}
                              onChange={(e) => updateSettings('effects', { whites: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Blacks: {videoSettings.effects.blacks > 0 ? '+' : ''}{videoSettings.effects.blacks}
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={videoSettings.effects.blacks || 0}
                              onChange={(e) => updateSettings('effects', { blacks: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Creative Filters */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Creative Filters</h5>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'none', name: 'None', gradient: 'from-gray-200 to-gray-300' },
                            { id: 'vintage', name: 'Vintage', gradient: 'from-yellow-200 to-orange-300' },
                            { id: 'cinematic', name: 'Cinematic', gradient: 'from-blue-200 to-purple-300' },
                            { id: 'vibrant', name: 'Vibrant', gradient: 'from-pink-200 to-red-300' },
                            { id: 'bw', name: 'B&W', gradient: 'from-gray-300 to-gray-500' },
                            { id: 'sepia', name: 'Sepia', gradient: 'from-yellow-300 to-brown-400' },
                            { id: 'warm', name: 'Warm', gradient: 'from-orange-200 to-red-300' },
                            { id: 'cool', name: 'Cool', gradient: 'from-blue-200 to-cyan-300' },
                            { id: 'dramatic', name: 'Dramatic', gradient: 'from-gray-600 to-black' }
                          ].map(filter => (
                            <button
                              key={filter.id}
                              onClick={() => updateSettings('effects', { filter: filter.id })}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 ${videoSettings.effects.filter === filter.id
                                ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                                : 'border-red-200/50 hover:border-red-300 bg-white/90 backdrop-blur-sm'
                                }`}
                            >
                              <div className={`w-full h-8 bg-gradient-to-r ${filter.gradient} rounded mb-1`}></div>
                              <span className="text-xs font-medium">{filter.name}</span>
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter Intensity: {Math.round((videoSettings.effects.filterIntensity || 1) * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={videoSettings.effects.filterIntensity || 1}
                            onChange={(e) => updateSettings('effects', { filterIntensity: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Image Enhancement */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Image Enhancement</h5>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Blur: {videoSettings.effects.blur}px
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={videoSettings.effects.blur}
                              onChange={(e) => updateSettings('effects', { blur: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sharpen: {videoSettings.effects.sharpen}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={videoSettings.effects.sharpen}
                              onChange={(e) => updateSettings('effects', { sharpen: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Denoise: {videoSettings.effects.denoise || 0}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={videoSettings.effects.denoise || 0}
                              onChange={(e) => updateSettings('effects', { denoise: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Stabilization</p>
                              <p className="text-xs text-gray-500">Reduce camera shake</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={videoSettings.effects.stabilization || false}
                              onChange={(e) => updateSettings('effects', { stabilization: e.target.checked })}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Artistic Effects */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Artistic Effects</h5>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Vignette: {videoSettings.effects.vignette}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={videoSettings.effects.vignette}
                              onChange={(e) => updateSettings('effects', { vignette: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Film Grain: {videoSettings.effects.grain}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={videoSettings.effects.grain}
                              onChange={(e) => updateSettings('effects', { grain: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chromatic Aberration: {videoSettings.effects.chromatic || 0}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={videoSettings.effects.chromatic || 0}
                              onChange={(e) => updateSettings('effects', { chromatic: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Motion Blur: {videoSettings.effects.motionBlur || 0}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={videoSettings.effects.motionBlur || 0}
                              onChange={(e) => updateSettings('effects', { motionBlur: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Keyframe Controls */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Keyframe Animation</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => addKeyframe('brightness', videoSettings.effects.brightness)}
                            className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-2 rounded-lg font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center flex-1"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Keyframe
                          </button>
                          <button
                            onClick={() => {
                              const keyframes = videoSettings.effects.keyframes.filter(kf => kf.time === currentTime)
                              keyframes.forEach(kf => removeKeyframe(kf.time, kf.property))
                            }}
                            className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-2 rounded-lg font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center flex-1"
                          >
                            <Minus className="w-3 h-3 mr-1" />
                            Remove Keyframes
                          </button>
                        </div>

                        {videoSettings.effects.keyframes.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-800 mb-2">
                              Active Keyframes: {videoSettings.effects.keyframes.length}
                            </p>
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {videoSettings.effects.keyframes.slice(0, 3).map((kf, index) => (
                                <div key={index} className="text-xs text-blue-700">
                                  {formatTime(kf.time)}: {kf.property} = {kf.value}
                                </div>
                              ))}
                              {videoSettings.effects.keyframes.length > 3 && (
                                <div className="text-xs text-blue-600">
                                  ... and {videoSettings.effects.keyframes.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            updateSettings('effects', {
                              brightness: 0,
                              contrast: 0,
                              saturation: 0,
                              hue: 0,
                              gamma: 1.0,
                              exposure: 0,
                              highlights: 0,
                              shadows: 0,
                              whites: 0,
                              blacks: 0,
                              blur: 0,
                              sharpen: 0,
                              denoise: 0,
                              stabilization: false,
                              filter: 'none',
                              filterIntensity: 1.0,
                              vignette: 0,
                              grain: 0,
                              chromatic: 0,
                              motionBlur: 0,
                              keyframes: []
                            })
                            toast.success('All filters reset')
                          }}
                          className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex-1"
                        >
                          Reset All
                        </button>
                        <button
                          onClick={() => {
                            toast.success('Filters applied to video')
                          }}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center flex-1"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Transform Tab - New */}
                  {activeTab === 'transform' && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-gray-900">Transform & Crop</h4>

                      {/* Scale & Rotation */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Scale & Rotation</h5>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Scale: {Math.round(videoSettings.effects.scale * 100)}%
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="3"
                              step="0.1"
                              value={videoSettings.effects.scale}
                              onChange={(e) => updateSettings('effects', { scale: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Rotation: {videoSettings.effects.rotation}°
                            </label>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={videoSettings.effects.rotation}
                              onChange={(e) => updateSettings('effects', { rotation: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            onClick={() => updateSettings('effects', { flipHorizontal: !videoSettings.effects.flipHorizontal })}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-1 ${videoSettings.effects.flipHorizontal ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 hover:bg-red-50'}`}
                          >
                            Flip Horizontal
                          </button>
                          <button
                            onClick={() => updateSettings('effects', { flipVertical: !videoSettings.effects.flipVertical })}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-1 ${videoSettings.effects.flipVertical ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 hover:bg-red-50'}`}
                          >
                            Flip Vertical
                          </button>
                        </div>
                      </div>

                      {/* Cropping */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">Cropping</h5>
                          <button
                            onClick={() => updateSettings('effects', {
                              crop: { ...videoSettings.effects.crop, enabled: !videoSettings.effects.crop.enabled }
                            })}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${videoSettings.effects.crop.enabled ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 hover:bg-red-50'}`}
                          >
                            <Crop className="w-4 h-4 mr-2" />
                            {videoSettings.effects.crop.enabled ? 'Disable' : 'Enable'} Crop
                          </button>
                        </div>

                        {videoSettings.effects.crop.enabled && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  X Position: {videoSettings.effects.crop.x}%
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={videoSettings.effects.crop.x}
                                  onChange={(e) => updateSettings('effects', {
                                    crop: { ...videoSettings.effects.crop, x: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Y Position: {videoSettings.effects.crop.y}%
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={videoSettings.effects.crop.y}
                                  onChange={(e) => updateSettings('effects', {
                                    crop: { ...videoSettings.effects.crop, y: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Width: {videoSettings.effects.crop.width}%
                                </label>
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  value={videoSettings.effects.crop.width}
                                  onChange={(e) => updateSettings('effects', {
                                    crop: { ...videoSettings.effects.crop, width: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Height: {videoSettings.effects.crop.height}%
                                </label>
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  value={videoSettings.effects.crop.height}
                                  onChange={(e) => updateSettings('effects', {
                                    crop: { ...videoSettings.effects.crop, height: parseInt(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => updateSettings('effects', {
                                  crop: { ...videoSettings.effects.crop, width: 100, height: 56.25 } // 16:9
                                })}
                                className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                              >
                                16:9
                              </button>
                              <button
                                onClick={() => updateSettings('effects', {
                                  crop: { ...videoSettings.effects.crop, width: 100, height: 75 } // 4:3
                                })}
                                className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                              >
                                4:3
                              </button>
                              <button
                                onClick={() => updateSettings('effects', {
                                  crop: { ...videoSettings.effects.crop, width: 100, height: 100 } // 1:1
                                })}
                                className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                              >
                                1:1
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            updateSettings('effects', {
                              scale: 1.0,
                              rotation: 0,
                              flipHorizontal: false,
                              flipVertical: false,
                              crop: { enabled: false, x: 0, y: 0, width: 100, height: 100 }
                            })
                            toast.success('Transform reset')
                          }}
                          className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex-1"
                        >
                          Reset Transform
                        </button>
                        <button
                          onClick={() => {
                            toast.success('Transform applied to video')
                          }}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center flex-1"
                        >
                          <Move className="w-4 h-4 mr-2" />
                          Apply Transform
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Style Tab - Enhanced */}
                  {activeTab === 'style' && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-gray-900">Video Style & Branding</h4>

                      {/* Theme Selection */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Style Themes</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              id: 'professional',
                              name: 'Professional',
                              colors: ['#0891b2', '#1e40af'],
                              gradient: 'from-cyan-400 to-blue-500'
                            },
                            {
                              id: 'creative',
                              name: 'Creative',
                              colors: ['#ec4899', '#8b5cf6'],
                              gradient: 'from-pink-400 to-purple-500'
                            },
                            {
                              id: 'modern',
                              name: 'Modern',
                              colors: ['#10b981', '#059669'],
                              gradient: 'from-green-400 to-teal-500'
                            },
                            {
                              id: 'vibrant',
                              name: 'Vibrant',
                              colors: ['#f97316', '#dc2626'],
                              gradient: 'from-orange-400 to-red-500'
                            }
                          ].map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => updateSettings('style', {
                                theme: theme.id,
                                colorScheme: theme.colors
                              })}
                              className={`p-4 border-2 rounded-lg transition-all duration-200 ${videoSettings.style.theme === theme.id
                                ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                                : 'border-red-200/50 hover:border-red-300 bg-white/90 backdrop-blur-sm'
                                }`}
                            >
                              <div className={`w-full h-16 bg-gradient-to-br ${theme.gradient} rounded-lg mb-3 shadow-sm`}></div>
                              <p className="text-sm font-bold text-gray-900">{theme.name}</p>
                              <div className="flex space-x-1 mt-2 justify-center">
                                {theme.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Colors */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Custom Colors</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Primary Color</label>
                            <input
                              type="color"
                              value={videoSettings.style.colorScheme[0]}
                              onChange={(e) => updateSettings('style', {
                                colorScheme: [e.target.value, videoSettings.style.colorScheme[1]]
                              })}
                              className="w-full h-12 rounded-lg border border-red-200/50 cursor-pointer focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Secondary Color</label>
                            <input
                              type="color"
                              value={videoSettings.style.colorScheme[1]}
                              onChange={(e) => updateSettings('style', {
                                colorScheme: [videoSettings.style.colorScheme[0], e.target.value]
                              })}
                              className="w-full h-12 rounded-lg border border-red-200/50 cursor-pointer focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Typography */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Typography</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Primary Font</label>
                            <select
                              className="w-full p-2 border border-red-200/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-sm"
                              value={videoSettings.style.fonts[0]}
                              onChange={(e) => updateSettings('style', {
                                fonts: [e.target.value, videoSettings.style.fonts[1]]
                              })}
                            >
                              <option value="Inter">Inter</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Poppins">Poppins</option>
                              <option value="Open Sans">Open Sans</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Secondary Font</label>
                            <select
                              className="w-full p-2 border border-red-200/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-sm"
                              value={videoSettings.style.fonts[1]}
                              onChange={(e) => updateSettings('style', {
                                fonts: [videoSettings.style.fonts[0], e.target.value]
                              })}
                            >
                              <option value="Roboto">Roboto</option>
                              <option value="Inter">Inter</option>
                              <option value="Source Sans Pro">Source Sans Pro</option>
                              <option value="Nunito">Nunito</option>
                              <option value="Raleway">Raleway</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Branding Elements */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Branding</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Logo Upload</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <div className="text-gray-500 text-sm">
                                <Upload className="w-6 h-6 mx-auto mb-2" />
                                Click to upload logo or drag and drop
                              </div>
                              <input type="file" accept="image/*" className="hidden" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Watermark</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <div className="text-gray-500 text-sm">
                                <Upload className="w-6 h-6 mx-auto mb-2" />
                                Click to upload watermark
                              </div>
                              <input type="file" accept="image/*" className="hidden" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          applyStyleMutation.mutate(videoSettings.style.theme)
                        }}
                        disabled={applyStyleMutation.isLoading}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-full"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        {applyStyleMutation.isLoading ? 'Applying...' : 'Apply Style & Branding'}
                      </button>
                    </div>
                  )}

                  {/* Fallback for unknown tabs */}
                  {!['script', 'voiceover', 'captions', 'clips', 'effects', 'filters', 'transform', 'audio', 'style'].includes(activeTab) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Select a tab to start editing</p>
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
    </div>
  )
}
export default VideoEditorPage;