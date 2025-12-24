import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Plus, 
  Search, 
  Users, 
  FolderOpen,
  MoreVertical,
  Calendar,
  Settings,
  UserPlus,
  Sparkles,
  X
} from 'lucide-react'
import { workspacesService } from '../services/workspaces'
import { toast } from 'sonner'

const WorkspacesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' })
  
  const queryClient = useQueryClient()

  const { data: workspaces, isLoading } = useQuery(
    ['workspaces', searchTerm],
    () => workspacesService.getWorkspaces({ search: searchTerm || undefined }),
    { keepPreviousData: true }
  )

  const createMutation = useMutation(
    (data: { name: string; description: string }) => 
      workspacesService.createWorkspace(data),
    {
      onSuccess: () => {
        console.log('Workspace created successfully, invalidating queries...')
        queryClient.invalidateQueries(['workspaces'])
        setShowCreateModal(false)
        setNewWorkspace({ name: '', description: '' })
        toast.success('Workspace created successfully!')
      },
      onError: (error) => {
        console.error('Failed to create workspace:', error)
        toast.error('Failed to create workspace')
      }
    }
  )

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    if (newWorkspace.name.trim()) {
      createMutation.mutate(newWorkspace)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-purple-700 bg-purple-50/60 px-3 py-1 rounded-full">Team Workspaces</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
              Team <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Workspaces</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mb-6 leading-relaxed">
              Organize your projects and collaborate with your team in dedicated workspaces.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>New Workspace</span>
            </button>
          </div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-300"
            />
          </div>
        </div>
                placeholder="Search workspaces..."
                className="input pl-12 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Workspaces Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : workspaces?.data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workspaces?.data?.map((workspace: any) => (
                <div 
                  key={workspace._id} 
                  className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Gradient Background Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Card Content */}
                  <div className="relative z-10 p-8">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Workspace Icon */}
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          {/* Status Indicator */}
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Workspace Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-purple-700 transition-colors">
                            {workspace.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{workspace.members?.length || 0} members</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center space-x-1">
                              <FolderOpen className="w-4 h-4" />
                              <span className="font-medium">{workspace.projects?.length || 0} projects</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <div className="flex-shrink-0 ml-4">
                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {workspace.description && (
                      <div className="mb-6">
                        <p className="text-gray-600 leading-relaxed line-clamp-2 text-sm">
                          {workspace.description}
                        </p>
                      </div>
                    )}

                    {/* Stats Section */}
                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                              <FolderOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-700">{workspace.projects?.length || 0}</div>
                              <div className="text-xs text-purple-600 font-medium">Projects</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-pink-700">{workspace.members?.length || 0}</div>
                              <div className="text-xs text-pink-600 font-medium">Members</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Updated {new Date(workspace.updatedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Invite Members"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Invite members feature coming soon!')
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Workspace Settings"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Workspace settings coming soon!')
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 via-pink-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <Users className="w-16 h-16 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchTerm ? 'No workspaces found' : 'Create Your First Workspace'}
              </h3>
              
              <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed text-lg">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for.'
                  : 'Get started by creating your first workspace to organize your projects and collaborate with your team in a dedicated environment.'}
              </p>
              
              {!searchTerm && (
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Workspace
                  </button>
                  
                  <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mt-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Organize Projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Team Collaboration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Secure Sharing</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Workspace Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <form onSubmit={handleCreateWorkspace} className="relative">
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-8 text-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Create New Workspace</h2>
                            <p className="text-purple-100 mt-1">Set up a collaborative environment for your team</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form */}
                  <div className="p-8 space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-4">
                        Workspace Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all text-lg"
                          placeholder="Enter an amazing workspace name..."
                          value={newWorkspace.name}
                          onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                          required
                          maxLength={100}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                          {newWorkspace.name.length}/100
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-4">
                        Description (Optional)
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none"
                          rows={4}
                          placeholder="Describe your workspace purpose and goals..."
                          value={newWorkspace.description}
                          onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                          maxLength={500}
                        />
                        <div className="absolute right-4 bottom-4 text-sm text-gray-400">
                          {newWorkspace.description.length}/500
                        </div>
                      </div>
                    </div>

                    {/* Features Preview */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                        What you'll get with your workspace
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-700">Unlimited projects</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span className="text-gray-700">Team collaboration</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                          <span className="text-gray-700">Shared resources</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">Access controls</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4 p-8 border-t border-gray-100 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                      disabled={createMutation.isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isLoading || !newWorkspace.name.trim()}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {createMutation.isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Workspace...</span>
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 inline" />
                          Create Workspace
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkspacesPage