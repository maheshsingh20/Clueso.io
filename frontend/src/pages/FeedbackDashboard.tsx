import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Heart, 
  Clock, 
  CheckCircle, 
  Eye, 
  Filter,
  Search,
  Calendar,
  User,
  AlertCircle,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { feedbackService, FeedbackData } from '../services/feedback'
import { useWebSocket } from '../hooks/useWebSocket'

const FeedbackDashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null)
  
  const queryClient = useQueryClient()
  
  // WebSocket for real-time updates
  const { isConnected, newFeedback, clearNewFeedback } = useWebSocket()

  // Fetch feedback with filters
  const { data: feedbackData, isLoading, refetch } = useQuery(
    ['feedback', selectedStatus, selectedType],
    () => feedbackService.getFeedback({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      type: selectedType === 'all' ? undefined : selectedType,
      limit: 100
    }),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  // Update feedback status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: 'new' | 'reviewing' | 'resolved' }) =>
      feedbackService.updateFeedbackStatus(id, status),
    {
      onSuccess: () => {
        toast.success('Feedback status updated successfully')
        queryClient.invalidateQueries(['feedback'])
        setSelectedFeedback(null)
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update feedback status')
      }
    }
  )

  // Handle new feedback from WebSocket
  useEffect(() => {
    if (newFeedback) {
      queryClient.invalidateQueries(['feedback'])
      toast.success(`New ${newFeedback.type} feedback received from ${newFeedback.userName}`)
      clearNewFeedback()
    }
  }, [newFeedback, queryClient, clearNewFeedback])

  const feedbackTypes = [
    { value: 'all', label: 'All Types', icon: MessageSquare, color: 'text-gray-600', count: feedbackData?.total || 0 },
    { value: 'bug', label: 'Bug Reports', icon: Bug, color: 'text-red-600', count: 0 },
    { value: 'feature', label: 'Feature Requests', icon: Lightbulb, color: 'text-yellow-600', count: 0 },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-600', count: 0 },
    { value: 'compliment', label: 'Compliments', icon: Heart, color: 'text-pink-600', count: 0 }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' }
  ]

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = feedbackTypes.find(t => t.value === type)
    if (!typeConfig) return MessageSquare
    return typeConfig.icon
  }

  const getTypeColor = (type: string) => {
    const typeConfig = feedbackTypes.find(t => t.value === type)
    return typeConfig?.color || 'text-gray-600'
  }

  // Filter feedback based on search query
  const filteredFeedback = feedbackData?.feedback.filter(feedback =>
    feedback.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.userName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Calculate type counts
  const typeCounts = feedbackData?.feedback.reduce((acc, feedback) => {
    acc[feedback.type] = (acc[feedback.type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Update counts in feedbackTypes
  feedbackTypes.forEach(type => {
    if (type.value !== 'all') {
      type.count = typeCounts[type.value] || 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Feedback Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage and respond to user feedback</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* WebSocket Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">
                  {isConnected ? 'Live Updates' : 'Disconnected'}
                </span>
              </div>
              
              <button
                onClick={() => refetch()}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {feedbackTypes.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.value}
                className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedType === type.value ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{type.label}</p>
                    <p className="text-2xl font-black text-gray-900">{type.count}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${type.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search feedback..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex space-x-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedStatus === status.value
                        ? status.color + ' ring-2 ring-offset-2 ring-blue-500'
                        : status.color + ' opacity-60 hover:opacity-100'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Feedback ({filteredFeedback.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading feedback...</span>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500">No feedback matches your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFeedback.map((feedback) => {
                const TypeIcon = getTypeIcon(feedback.type)
                return (
                  <div
                    key={feedback.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className={`w-5 h-5 ${getTypeColor(feedback.type)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-semibold text-gray-900">{feedback.userName}</h3>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityColors[feedback.priority]}`}>
                              {feedback.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              feedback.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              feedback.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {feedback.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(feedback.timestamp).toLocaleDateString()}</span>
                            <Clock className="w-3 h-3" />
                            <span>{new Date(feedback.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm line-clamp-2">{feedback.message}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 capitalize">{feedback.type} feedback</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {feedback.status !== 'resolved' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateStatusMutation.mutate({
                                    id: feedback.id,
                                    status: feedback.status === 'new' ? 'reviewing' : 'resolved'
                                  })
                                }}
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                {feedback.status === 'new' ? 'Start Review' : 'Mark Resolved'}
                              </button>
                            )}
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {selectedFeedback.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedFeedback.userName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedFeedback.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.message}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <span className="capitalize text-sm text-gray-900">{selectedFeedback.type}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[selectedFeedback.priority]}`}>
                      {selectedFeedback.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedFeedback.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      selectedFeedback.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedFeedback.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                {selectedFeedback.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: selectedFeedback.id,
                        status: selectedFeedback.status === 'new' ? 'reviewing' : 'resolved'
                      })
                    }}
                    className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {selectedFeedback.status === 'new' ? 'Start Review' : 'Mark Resolved'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedbackDashboard