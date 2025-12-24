import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Video, 
  Users, 
  MoreVertical,
  Calendar,
  ArrowRight,
  Filter
} from 'lucide-react'
import { projectsService } from '../services/projects'
import { workspacesService } from '../services/workspaces'
import CreateProjectModal from '../components/CreateProjectModal'

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const navigate = useNavigate()

  const { data: projects, isLoading } = useQuery(
    ['projects', searchTerm, selectedWorkspace],
    () => projectsService.getProjects({
      search: searchTerm || undefined,
      workspaceId: selectedWorkspace || undefined,
      limit: 20
    }),
    { keepPreviousData: true }
  )

  const handleCreateSuccess = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const { data: workspaces } = useQuery(
    ['workspaces'],
    () => workspacesService.getWorkspaces()
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                <FolderOpen className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-red-700 bg-red-50/60 px-3 py-1 rounded-full">All Projects</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
              Your Creative <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Projects</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mb-6 leading-relaxed">
              Manage your video projects and collaborate with your team to create amazing content.
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>New Project</span>
            </button>
          </div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-red-200/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent shadow-lg transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <select
                  className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent shadow-lg transition-all duration-300"
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                >
                  <option value="">All Workspaces</option>
                  {workspaces?.data?.map((workspace) => (
                    <option key={workspace._id} value={workspace._id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects?.data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.data?.map((project, index) => {
                // Cycle through different light background colors
                const colorVariants = [
                  'bg-gradient-to-br from-red-50/90 to-red-100/70',
                  'bg-gradient-to-br from-pink-50/90 to-pink-100/70', 
                  'bg-gradient-to-br from-rose-50/90 to-rose-100/70',
                  'bg-gradient-to-br from-orange-50/90 to-orange-100/70',
                  'bg-gradient-to-br from-amber-50/90 to-amber-100/70',
                  'bg-gradient-to-br from-emerald-50/90 to-emerald-100/70'
                ]
                const bgColor = colorVariants[index % colorVariants.length]
                
                const iconColors = [
                  'from-red-500 to-red-600',
                  'from-pink-500 to-pink-600',
                  'from-rose-500 to-rose-600', 
                  'from-orange-500 to-orange-600',
                  'from-amber-500 to-amber-600',
                  'from-emerald-500 to-emerald-600'
                ]
                const iconColor = iconColors[index % iconColors.length]

                const hoverColors = [
                  'hover:shadow-red-200/50',
                  'hover:shadow-pink-200/50',
                  'hover:shadow-rose-200/50',
                  'hover:shadow-orange-200/50',
                  'hover:shadow-amber-200/50',
                  'hover:shadow-emerald-200/50'
                ]
                const hoverColor = hoverColors[index % hoverColors.length]

                return (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className={`group relative overflow-hidden rounded-2xl border border-gray-200/60 ${bgColor} backdrop-blur-sm hover:shadow-2xl ${hoverColor} hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300`}
                  >
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>
                    
                    <div className="relative z-10 p-6">
                      {/* Header with icon and menu */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0`}>
                            <FolderOpen className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 truncate mb-2 group-hover:text-gray-700 transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-600/90 font-medium">
                              {(project.workspace as any)?.name || 'Personal Workspace'}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-white/80 transition-all duration-200 flex-shrink-0">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Description */}
                      {project.description && (
                        <p className="text-gray-700/90 mb-6 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
                            <Video className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">{project.videos?.length || 0}</span>
                            <span className="text-xs text-gray-500">videos</span>
                          </div>
                          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">{project.collaborators?.length || 0}</span>
                            <span className="text-xs text-gray-500">members</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600/90">
                          <Calendar className="w-4 h-4" />
                          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-700 group-hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
                          <span className="text-sm font-bold mr-2">Open</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced decorative elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full translate-y-10 -translate-x-10 group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-700"></div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100/90 to-red-200/70 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <FolderOpen className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No projects found</h3>
              <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed text-lg">
                {searchTerm || selectedWorkspace
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by creating your first project to organize your video content.'}
              </p>
              {!searchTerm && !selectedWorkspace && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Project
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {projects && projects.pagination.pages > 1 && (
            <div className="mt-12 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
              <div className="text-sm text-gray-600">
                Showing {((projects.pagination.page - 1) * projects.pagination.limit) + 1} to{' '}
                {Math.min(projects.pagination.page * projects.pagination.limit, projects.pagination.total)} of{' '}
                {projects.pagination.total} results
              </div>
              <div className="flex space-x-3">
                <button
                  disabled={projects.pagination.page === 1}
                  className="px-4 py-2 border-2 border-gray-300/80 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-cyan-400 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white/60 backdrop-blur-sm"
                >
                  Previous
                </button>
                <button
                  disabled={projects.pagination.page === projects.pagination.pages}
                  className="px-4 py-2 border-2 border-gray-300/80 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-cyan-400 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white/60 backdrop-blur-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  )
}

export default ProjectsPage