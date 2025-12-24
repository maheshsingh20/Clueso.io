import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  TrendingUp,
  Video,
  FolderOpen,
  Clock,
  HardDrive,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Play,
  ArrowUp,
  ArrowDown,
  Calendar,
  FileVideo,
  Zap,
  Sparkles
} from 'lucide-react'
import { analyticsService } from '../services/analytics'

const AnalyticsPage = () => {
  const { data: analytics, isLoading, error } = useQuery(
    'analytics-overview',
    () => analyticsService.getOverview(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-2xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100/90 to-red-200/70 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <BarChart3 className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Analytics Unavailable</h3>
            <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed text-lg">
              Unable to load analytics data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const data = analytics

  // Calculate growth percentages
  const videoGrowth = data?.growthMetrics ? 
    ((data.growthMetrics.videosThisMonth - data.growthMetrics.videosLastMonth) / Math.max(1, data.growthMetrics.videosLastMonth) * 100) : 0
  
  const projectGrowth = data?.growthMetrics ? 
    ((data.growthMetrics.projectsThisMonth - data.growthMetrics.projectsLastMonth) / Math.max(1, data.growthMetrics.projectsLastMonth) * 100) : 0

  const stats = [
    {
      name: 'Total Videos',
      value: data?.totalVideos || 0,
      icon: Video,
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
      change: `${videoGrowth > 0 ? '+' : ''}${videoGrowth.toFixed(0)}%`,
      changeType: videoGrowth >= 0 ? 'increase' : 'decrease',
      subtitle: `${data?.growthMetrics?.videosThisMonth || 0} this month`
    },
    {
      name: 'Projects',
      value: data?.totalProjects || 0,
      icon: FolderOpen,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      change: `${projectGrowth > 0 ? '+' : ''}${projectGrowth.toFixed(0)}%`,
      changeType: projectGrowth >= 0 ? 'increase' : 'decrease',
      subtitle: `${data?.growthMetrics?.projectsThisMonth || 0} this month`
    },
    {
      name: 'Processing',
      value: data?.processingVideos || 0,
      icon: Clock,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      change: data?.processingVideos === 0 ? 'All done!' : 'In progress',
      changeType: 'neutral',
      subtitle: 'Videos in queue'
    },
    {
      name: 'Storage Used',
      value: data?.storageUsed || '0 MB',
      icon: HardDrive,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      change: `${data?.storagePercentage?.toFixed(1) || 0}%`,
      changeType: 'neutral',
      subtitle: `of ${data?.storageLimit || '10 GB'} limit`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border border-red-100/50 rounded-3xl p-8 mb-8 text-gray-800 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-red-200 to-pink-200 rounded-xl">
                <BarChart3 className="w-6 h-6 text-red-700" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-red-700 bg-white/60 px-3 py-1 rounded-full">Analytics Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
              Performance <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Insights</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
              Track your video creation progress and performance metrics with detailed analytics.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/30 to-red-200/30 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    stat.changeType === 'increase' ? 'text-emerald-700 bg-emerald-100' : 
                    stat.changeType === 'decrease' ? 'text-red-700 bg-red-100' : 'text-gray-700 bg-gray-100'
                  }`}>
                    {stat.changeType === 'increase' && <ArrowUp className="w-3 h-3 inline mr-1" />}
                    {stat.changeType === 'decrease' && <ArrowDown className="w-3 h-3 inline mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    {stat.name}
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {stat.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Video Creation Trend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Creation Trend</h3>
                <p className="text-gray-600">Last 6 months performance</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {data?.monthlyStats?.map((monthData: any) => (
                <div key={monthData.name} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col space-y-1">
                    <div 
                      className="bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg shadow-lg"
                      style={{ height: `${Math.max(4, (monthData.videos / Math.max(1, Math.max(...(data?.monthlyStats?.map((m: any) => m.videos) || [1])))) * 200)}px` }}
                      title={`${monthData.videos} videos`}
                    ></div>
                    <div 
                      className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg shadow-lg"
                      style={{ height: `${Math.max(4, (monthData.projects / Math.max(1, Math.max(...(data?.monthlyStats?.map((m: any) => m.projects) || [1])))) * 100)}px` }}
                      title={`${monthData.projects} projects`}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-3">{monthData.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-8 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-400 rounded-full mr-3 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Videos</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full mr-3 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Projects</span>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Storage Usage</h3>
                <p className="text-gray-600">Current storage utilization</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center justify-center h-48 mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#f3f4f6"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(data?.storagePercentage || 0) * 2.2} ${100 * 2.2}`}
                    strokeLinecap="round"
                    className="drop-shadow-lg"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900">
                      {data?.storagePercentage?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm font-medium text-gray-600">Used</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                <span className="text-sm font-medium text-gray-700">Used</span>
                <span className="font-bold text-gray-900">{data?.storageUsed || '0 MB'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <span className="text-sm font-medium text-gray-700">Available</span>
                <span className="font-bold text-gray-900">
                  {data?.storageLimit ? 
                    `${(parseFloat(data.storageLimit.replace(' GB', '')) * 1024 - (data.storageUsedBytes / (1024 * 1024))).toFixed(0)} MB` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="font-bold text-gray-900">{data?.storageLimit || '10 GB'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Video Status Distribution</h3>
                <p className="text-gray-600">Current video processing status</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                <PieChart className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(data?.videosByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 shadow-sm ${
                      status === 'ready' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                      status === 'processing' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
                      status === 'uploading' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}></div>
                    <span className="text-sm font-semibold text-gray-700 capitalize">{status}</span>
                  </div>
                  <span className="text-lg font-black text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Projects */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Top Projects by Videos</h3>
                <p className="text-gray-600">Most active projects</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-pink-100 to-red-100 rounded-xl">
                <FolderOpen className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="space-y-3">
              {data?.projectStats?.slice(0, 5).map((project: any) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-red-50 hover:to-pink-50 rounded-xl border border-gray-100 hover:border-red-200 transition-all duration-300 group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <FolderOpen className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 truncate max-w-48 group-hover:text-red-700 transition-colors">
                        {project.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.collaborators} collaborators
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors">{project.videoCount}</div>
                    <div className="text-xs text-gray-500">videos</div>
                  </div>
                </Link>
              )) || (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-500">No projects yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <p className="text-gray-600">Latest project updates</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          {data?.recentActivity?.length ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg">
                      {activity.type === 'video_created' ? (
                        <Video className="w-6 h-6 text-red-600" />
                      ) : (
                        <FolderOpen className="w-6 h-6 text-pink-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      {activity.projectName && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{activity.projectName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-500 leading-relaxed">
                Start creating videos to see activity here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage