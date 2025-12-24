import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from 'react-query'
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Play,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { videosService } from '../services/videos'

interface VideoUploadProps {
  onUpload?: (file: File) => void
  onComplete?: (videoId: string) => void
  projectId?: string
}

const VideoUpload = ({ onUpload, onComplete, projectId }: VideoUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [error, setError] = useState<string>('')

  const queryClient = useQueryClient()

  // Video upload mutation
  const uploadMutation = useMutation(
    async (data: { file: File; title: string; description?: string; projectId: string }) => {
      return videosService.createVideo(
        data.file,
        {
          title: data.title,
          description: data.description,
          projectId: data.projectId
        },
        (progress) => {
          setUploadProgress(progress)
        }
      )
    },
    {
      onSuccess: (video) => {
        setUploadStatus('complete')
        toast.success('Video uploaded successfully!')
        queryClient.invalidateQueries(['videos'])
        queryClient.invalidateQueries(['projects'])
        
        if (onUpload && selectedFile) {
          onUpload(selectedFile)
        }
        
        if (onComplete) {
          onComplete(video._id)
        }
      },
      onError: (error: any) => {
        setUploadStatus('error')
        const errorMessage = error.response?.data?.message || 'Failed to upload video'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    }
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''))
      setUploadStatus('idle')
      setUploadProgress(0)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.avi', '.mov']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024 // 500MB
  })

  const handleUpload = async () => {
    if (!selectedFile || !videoTitle.trim() || !projectId) {
      toast.error('Please provide video title and ensure project is selected')
      return
    }

    setUploadStatus('uploading')
    setError('')
    setUploadProgress(0)

    uploadMutation.mutate({
      file: selectedFile,
      title: videoTitle,
      description: videoDescription,
      projectId: projectId
    })
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setVideoTitle('')
    setVideoDescription('')
    setUploadProgress(0)
    setUploadStatus('idle')
    setError('')
    uploadMutation.reset()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary-600">Drop your video here...</p>
          ) : (
            <>
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop your video file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, WebM, AVI, MOV (max 500MB)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </h3>
                  <button
                    onClick={resetUpload}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{selectedFile.type}</span>
                </div>
                
                {/* Upload Progress */}
                {uploadStatus === 'uploading' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-cyan-600"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadStatus === 'processing' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">AI Processing...</span>
                      <span className="text-gray-600">Please wait</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 animate-pulse"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      🤖 Gemini AI is enhancing your video with smart features
                    </div>
                  </div>
                )}

                {/* Status Icons */}
                {uploadStatus === 'complete' && (
                  <div className="mt-2 flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Upload complete</span>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="mt-2 flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{error || 'Upload failed'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Details Form */}
          {uploadStatus === 'idle' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter video title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Describe your video"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetUpload}
                  className="btn btn-secondary btn-md"
                  disabled={uploadMutation.isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!videoTitle.trim() || !projectId || uploadMutation.isLoading}
                  className="btn btn-primary btn-md"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </button>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {uploadStatus === 'uploading' && (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-600 mb-2" />
              <p className="text-sm text-gray-600">Uploading your video...</p>
              <div className="mt-2 text-xs text-gray-500">
                📤 Securely transferring your file
              </div>
            </div>
          )}

          {uploadStatus === 'processing' && (
            <div className="text-center py-6 bg-gradient-to-br from-cyan-50 to-pink-50 rounded-lg">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-transparent mb-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 animate-pulse flex items-center justify-center">
                    <span className="text-white text-xl">🤖</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Gemini AI Processing Your Video
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Google Gemini is enhancing your video with smart features...
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <span>✨</span>
                  <span>Cleaning & enhancing script</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>🎙️</span>
                  <span>Generating professional voiceover</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>🔍</span>
                  <span>Adding smart zooms & focus</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>📝</span>
                  <span>Creating auto-captions</span>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {uploadStatus === 'complete' && (
            <div className="text-center py-6 bg-gradient-to-br from-green-50 to-cyan-50 rounded-lg">
              <div className="relative mb-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Gemini AI Enhancement Complete!
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Your video has been processed with Gemini AI-powered features:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Enhanced Script</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>AI Voiceover</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Smart Zooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Auto-Captions</span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={resetUpload}
                  className="btn btn-outline btn-md w-full"
                >
                  Upload Another Video
                </button>
                <button
                  onClick={() => {
                    // Navigate to video editor - we need the actual video ID from the upload response
                    if (onComplete) {
                      // The onComplete callback should handle navigation
                      resetUpload()
                    }
                  }}
                  className="btn btn-primary btn-md w-full"
                >
                  ✨ Edit & Customize
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <div className="text-center py-6 bg-red-50 rounded-lg">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Upload Failed
              </h3>
              <p className="text-sm text-red-700 mb-4">
                {error || 'There was an error uploading your video. Please try again.'}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={resetUpload}
                  className="btn btn-secondary btn-md"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleUpload}
                  className="btn btn-primary btn-md"
                  disabled={!videoTitle.trim() || !projectId}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoUpload