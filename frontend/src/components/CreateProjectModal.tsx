import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { X, FolderPlus, Users, Globe, Lock, Sparkles } from 'lucide-react'
import { projectsService } from '../services/projects'
import { workspacesService } from '../services/workspaces'
import { ProjectVisibility } from '@clueso/shared'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (projectId: string) => void
}

const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workspaceId: '',
    visibility: ProjectVisibility.WORKSPACE as ProjectVisibility
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const queryClient = useQueryClient()

  // Fetch workspaces for dropdown
  const { data: workspaces, isLoading: workspacesLoading, refetch: refetchWorkspaces } = useQuery(
    ['workspaces'],
    () => workspacesService.getWorkspaces(),
    { 
      enabled: isOpen,
      refetchOnMount: true,
      refetchOnWindowFocus: false
    }
  )

  // Refetch workspaces when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('CreateProjectModal opened, refetching workspaces...')
      refetchWorkspaces()
    }
  }, [isOpen, refetchWorkspaces])

  // Log workspaces data when it changes
  React.useEffect(() => {
    console.log('Workspaces data updated:', workspaces)
  }, [workspaces])

  // Create project mutation
  const createProjectMutation = useMutation(
    (data: typeof formData) => projectsService.createProject(data),
    {
      onSuccess: (project) => {
        queryClient.invalidateQueries(['projects'])
        onSuccess?.(project._id)
        handleClose()
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Failed to create project'
        setErrors({ general: errorMessage })
      }
    }
  )

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      workspaceId: '',
      visibility: ProjectVisibility.PRIVATE
    })
    setErrors({})
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    
    if (!formData.workspaceId) {
      newErrors.workspaceId = 'Please select a workspace'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    createProjectMutation.mutate(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 relative my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-lg flex items-center justify-between p-6 border-b border-gray-100 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 via-pink-400 to-sky-600 rounded-md flex items-center justify-center shadow-lg">
              <FolderPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
              <p className="text-sm text-gray-600">Start your next amazing video project</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
              <p className="text-sm font-medium">{errors.general}</p>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter an amazing project name..."
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : ''
              }`}
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project goals and vision..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Workspace */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Workspace *
            </label>
            <select
              value={formData.workspaceId}
              onChange={(e) => handleInputChange('workspaceId', e.target.value)}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all ${
                errors.workspaceId ? 'border-red-300 bg-red-50' : ''
              }`}
              disabled={workspacesLoading}
            >
              <option value="">Select a workspace...</option>
              {workspaces?.data?.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            {errors.workspaceId && (
              <p className="mt-1 text-sm text-red-600">{errors.workspaceId}</p>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Project Visibility
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-md border-2 border-gray-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all duration-200">
                <input
                  type="radio"
                  name="visibility"
                  value={ProjectVisibility.PRIVATE}
                  checked={formData.visibility === ProjectVisibility.PRIVATE}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="mt-1 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-md flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Private</div>
                    <div className="text-xs text-gray-600">Only you and invited collaborators can access</div>
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-md border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                <input
                  type="radio"
                  name="visibility"
                  value={ProjectVisibility.WORKSPACE}
                  checked={formData.visibility === ProjectVisibility.WORKSPACE}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="mt-1 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Workspace</div>
                    <div className="text-xs text-gray-600">All workspace members can access</div>
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-md border-2 border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                <input
                  type="radio"
                  name="visibility"
                  value={ProjectVisibility.PUBLIC}
                  checked={formData.visibility === ProjectVisibility.PUBLIC}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="mt-1 text-green-600 focus:ring-green-500"
                />
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Public</div>
                    <div className="text-xs text-gray-600">Anyone with the link can view</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white rounded-b-lg flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 bg-white text-gray-700 rounded-md font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
              disabled={createProjectMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProjectMutation.isLoading || !formData.name.trim() || !formData.workspaceId}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 via-pink-400 to-sky-600 text-white rounded-md font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {createProjectMutation.isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 inline" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal