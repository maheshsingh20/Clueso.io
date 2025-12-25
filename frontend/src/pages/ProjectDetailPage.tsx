import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  ArrowLeft,
  Video, 
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Settings,
  Users,
  MoreVertical,
  X,
  FolderOpen
} from 'lucide-react'
import { projectsService } from '../services/projects'
import { videosService } from '../services/videos'
import VideoUpload from '../components/VideoUpload'

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [showUploadModal, setShowUploadModal] = useState(false)

  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', id],
    () => projectsService.getProject(id!),
    { enabled: !!id }
  )

  const { data: videos, isLoading: videosLoading } = useQuery(
    ['project-videos', id],
    () => videosService.getVideos({ projectId: id }),
    { enabled: !!id, refetchInterval: 30000 }
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return (
          <div className="relative">
            <Clock className="w-4 h-4 text-red-500 animate-spin" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
          </div>
        )
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Gemini Enhanced ✨'
      case 'processing':
        return 'Gemini Processing 🤖'
      case 'uploading':
        return 'Uploading 📤'
      case 'error':
        return 'Error ❌'
      default:
        return 'Unknown'
    }
  }

  const getProcessingStageText = (stage: string) => {
    switch (stage) {
      case 'extract_audio':
        return 'Extracting audio...'
      case 'transcribe':
        return 'Transcribing speech...'
      case 'enhance_script':
        return 'Enhancing script...'
      case 'generate_voiceover':
        return 'Generating voiceover...'
      case 'detect_scenes':
        return 'Detecting scenes...'
      case 'generate_captions':
        return 'Creating captions...'
      case 'render_video':
        return 'Rendering video...'
      case 'complete':
        return 'Complete!'
      default:
        return 'Processing...'
    }
  }

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-12 bg-white/80 backdrop-blur-sm rounded-3xl w-1/3 mb-8 shadow-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-white/80 backdrop-blur-sm rounded-3xl border border-red-200/50 shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100/90 to-red-200/70 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <FolderOpen className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Project not found</h1>
            <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed text-lg">
              The project you're looking for doesn't exist.
            </p>
            <Link to="/projects" className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                to="/projects"
                className="p-2 bg-white/60 hover:bg-white/80 rounded-md transition-all duration-300 hover:scale-110"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-md">
                  <FolderOpen className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-red-700 bg-red-50/60 px-3 py-1 rounded-full">Project Details</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-xl text-gray-700 mb-6 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                  <Video className="w-4 h-4 text-red-600" />
                  <span className="font-bold">{videos?.pagination.total || 0} videos</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                  <Users className="w-4 h-4 text-pink-600" />
                  <span className="font-bold">{project.collaborators?.length || 0} collaborators</span>
                </div>
                <div className="bg-white/60 px-3 py-1 rounded-full">
                  <span className="font-bold">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </button>
                <button className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-105">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-red-200/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        </div>

        {/* Videos Grid */}
        <div>
          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-lg border border-red-200/50 shadow-lg animate-pulse p-6">
                  <div className="h-32 bg-red-100 rounded-md mb-4"></div>
                  <div className="h-4 bg-red-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-red-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : videos?.data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos?.data?.map((video) => (
                <div key={video._id} className="bg-white/80 backdrop-blur-sm rounded-lg border border-red-200/50 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    {/* Video Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-red-100 to-pink-100 rounded-md mb-4 flex items-center justify-center relative group overflow-hidden">
                      {video.status === 'ready' ? (
                        <Link
                          to={`/videos/${video._id}/edit`}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-12 h-12 text-white" />
                        </Link>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          {getStatusIcon(video.status)}
                          <span className="text-sm text-red-600 font-bold">
                            {getStatusText(video.status)}
                          </span>
                        </div>
                      )}
                      
                      {video.metadata?.keyframes?.[0] && (
                        <img
                          src={video.metadata.keyframes[0].thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-black text-gray-900 truncate flex-1">
                        {video.title}
                      </h3>
                      <button className="text-gray-400 hover:text-red-600 ml-2 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {video.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(video.status)}
                        <span className="font-bold">{getStatusText(video.status)}</span>
                      </div>
                      <span className="font-medium">{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Progress Bar for Processing Videos */}
                    {video.status === 'processing' && video.processing && (
                      <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-md border border-red-200/50">
                        <div className="flex items-center justify-between text-xs text-red-700 mb-2">
                          <span className="flex items-center space-x-1 font-bold">
                            <span>🤖</span>
                            <span>{getProcessingStageText(video.processing.stage)}</span>
                          </span>
                          <span className="font-black">{video.processing.progress}%</span>
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${video.processing.progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-red-600 text-center font-medium">
                          Gemini AI enhancing your video with smart features
                        </div>
                      </div>
                    )}

                    {/* AI Features Badge for Ready Videos */}
                    {video.status === 'ready' && (
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-red-100 text-red-800 font-bold">
                          🎙️ AI Voice
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-pink-100 text-pink-800 font-bold">
                          📝 Captions
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-purple-100 text-purple-800 font-bold">
                          🔍 Smart Zoom
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100/90 to-red-200/70 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Video className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">No videos yet</h3>
              <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed text-lg">
                Get started by uploading your first video to this project.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-md font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </button>
              </div>
            </div>
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-md shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Upload Video
                    </h3>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <VideoUpload 
                    projectId={id}
                    onComplete={(videoId) => {
                      setShowUploadModal(false)
                      // Navigate to video editor after successful upload
                      window.location.href = `/videos/${videoId}/edit`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage