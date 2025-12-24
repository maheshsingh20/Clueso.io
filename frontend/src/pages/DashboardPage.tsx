import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { toast } from 'sonner'
import { 
  Plus, 
  Video, 
  FolderOpen, 
  Users, 
  Monitor,
  Upload,
  FileText,
  Scissors,
  RefreshCw,
  Languages,
  Play,
  UserPlus,
  HelpCircle,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Trophy,
  Target
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { projectsService } from '../services/projects'
import { userProgressService } from '../services/userProgress'

const DashboardPage = () => {
  const { user } = useAuthStore()

  // Fetch recent projects
  const { data: recentProjects } = useQuery(
    ['projects', 'recent'],
    () => projectsService.getProjects({ limit: 6 })
  )

  // Fetch user progress
  const { data: userProgress } = useQuery(
    'userProgress',
    userProgressService.getUserProgress
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border border-red-100/50 rounded-3xl p-8 mb-8 text-gray-800 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-red-200 to-pink-200 rounded-xl">
                <Sparkles className="w-6 h-6 text-red-700" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-red-700 bg-white/60 px-3 py-1 rounded-full">Make something awesome</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{user?.firstName}</span>!
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
              Create engaging videos with AI-powered tools and collaborate with your team seamlessly.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/30 to-red-200/30 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Create New Video */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Create a new video */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                  <Plus className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Create a new video</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <Link
                  to="/projects"
                  className="group relative p-6 border border-red-100/50 rounded-2xl hover:border-red-200 hover:bg-red-50/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Monitor className="w-6 h-6 text-red-700" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Record screen</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Capture your screen with audio narration</p>
                  </div>
                </Link>

                <Link
                  to="/projects"
                  className="group relative p-6 border border-pink-100/50 rounded-2xl hover:border-pink-200 hover:bg-pink-50/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-300 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Upload className="w-6 h-6 text-pink-700" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Upload video</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Upload existing video files to edit</p>
                  </div>
                </Link>

                <Link
                  to="/projects"
                  className="group relative p-6 border border-emerald-100/50 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <FileText className="w-6 h-6 text-emerald-700" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Upload slides</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Turn presentations into videos</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* AI Tools */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">AI tools</h2>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold rounded-full">POWERED BY GEMINI</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div 
                  onClick={() => toast.info('AI Cuts feature coming soon!')}
                  className="group relative p-6 border border-purple-100/50 rounded-2xl hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Scissors className="w-6 h-6 text-purple-700" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Cuts</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">AI-powered video editing and trimming</p>
                  </div>
                </div>

                <div 
                  onClick={() => toast.info('Auto-update feature coming soon!')}
                  className="group relative p-6 border border-red-100/50 rounded-2xl hover:border-red-200 hover:bg-red-50/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <RefreshCw className="w-6 h-6 text-red-700" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Auto-update</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Automatically update video content</p>
                  </div>
                </div>

                <div 
                  onClick={() => toast.info('Translator feature coming soon!')}
                  className="group relative p-6 border border-orange-100/50 rounded-2xl hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Languages className="w-6 h-6 text-orange-700" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Translator</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Translate videos to multiple languages</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                    <FolderOpen className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent projects</h2>
                </div>
                <Link
                  to="/projects"
                  className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {recentProjects?.data?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.data.slice(0, 4).map((project) => (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="group relative p-4 border border-gray-100/50 rounded-2xl hover:border-red-200 hover:bg-red-50/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <FolderOpen className="w-5 h-5 text-red-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-red-700 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {project.videos?.length || 0} videos • {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FolderOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No projects yet</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">Get started by creating your first project and bring your ideas to life</p>
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Getting Started */}
          <div className="space-y-8">
            
            {/* Getting Started */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Getting started</h2>
                </div>
                {userProgress && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-200 to-pink-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-gray-800 text-sm font-bold">
                        {Math.round((userProgress.completedTutorials.length / 5) * 100)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Progress</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-pink-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((userProgress.completedTutorials.length / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Link
                  to="/tutorials"
                  className="group relative p-4 border border-red-100/50 rounded-2xl hover:border-red-200 hover:bg-red-50/30 transition-all duration-300 block hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-5 h-5 text-red-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                          Watch tutorial videos
                        </h3>
                        {(userProgress?.completedTutorials?.length || 0) > 0 && (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                        <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs font-bold rounded-full">
                          FULL PAGE
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {userProgress?.completedTutorials?.length || 0} of 5 completed
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>

                <Link
                  to="/help"
                  className="group relative p-4 border border-pink-100/50 rounded-2xl hover:border-pink-200 hover:bg-pink-50/30 transition-all duration-300 block hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-rose-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <HelpCircle className="w-5 h-5 text-pink-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-pink-700 transition-colors">
                          Browse help center
                        </h3>
                        <span className="px-2 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-xs font-bold rounded-full">
                          FULL PAGE
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Find answers to common questions</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>

                <Link
                  to="/workspaces"
                  className="group relative p-4 border border-emerald-100/50 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300 block hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-green-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <UserPlus className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">
                        Invite team members
                      </h3>
                      <p className="text-sm text-gray-500">Collaborate with your team</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              </div>

              {/* Achievements Section */}
              {userProgress?.achievements && userProgress.achievements.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>Recent Achievements</span>
                  </h4>
                  <div className="space-y-3">
                    {userProgress.achievements.slice(-2).map((achievement) => (
                      <div key={achievement} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-xl flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {achievement === 'first_tutorial' && 'Completed first tutorial!'}
                          {achievement === 'tutorial_master' && 'Tutorial Master!'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <span>Next Steps</span>
                </h4>
                <div className="space-y-3">
                  {(!userProgress?.completedTutorials?.length || userProgress.completedTutorials.length === 0) && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                      <Target className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Complete your first tutorial</span>
                    </div>
                  )}
                  {recentProjects?.pagination?.total === 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                      <Target className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-medium text-gray-700">Create your first project</span>
                    </div>
                  )}
                  {(userProgress?.onboardingStep || 0) < 5 && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-gray-700">Complete onboarding process</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your workspace</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-semibold text-gray-800">Projects</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 bg-white/60 px-3 py-1 rounded-xl">
                    {recentProjects?.pagination?.total || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center">
                      <Video className="w-5 h-5 text-pink-600" />
                    </div>
                    <span className="font-semibold text-gray-800">Videos</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 bg-white/60 px-3 py-1 rounded-xl">
                    {recentProjects?.data?.reduce((acc, project) => acc + (project.videos?.length || 0), 0) || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-gray-800">Team members</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 bg-white/60 px-3 py-1 rounded-xl">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage