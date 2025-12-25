import React, { useState } from 'react'
import { X, MessageSquare, Bug, Lightbulb, Heart, Send, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation } from 'react-query'
import { feedbackService, SubmitFeedbackRequest } from '../services/feedback'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<SubmitFeedbackRequest>({
    message: '',
    type: 'general',
    priority: 'medium'
  })

  const submitFeedbackMutation = useMutation(
    (data: SubmitFeedbackRequest) => feedbackService.submitFeedback(data),
    {
      onSuccess: () => {
        toast.success('Thank you for your feedback! We appreciate your input.')
        setFormData({ message: '', type: 'general', priority: 'medium' })
        onClose()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to submit feedback')
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.message.trim()) {
      toast.error('Please enter your feedback message')
      return
    }

    if (formData.message.length < 10) {
      toast.error('Please provide more detailed feedback (at least 10 characters)')
      return
    }

    submitFeedbackMutation.mutate(formData)
  }

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-600' },
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-600' },
    { value: 'compliment', label: 'Compliment', icon: Heart, color: 'text-pink-600' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Share Your Feedback</h2>
            <p className="text-gray-600 mt-1">Help us improve your experience</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              What type of feedback is this?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.type === type.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${type.color}`} />
                      <span className="font-semibold text-gray-900">{type.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Priority Level
            </label>
            <div className="flex space-x-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    formData.priority === priority.value
                      ? priority.color + ' ring-2 ring-offset-2 ring-red-500'
                      : priority.color + ' opacity-60 hover:opacity-100'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Your Feedback
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us what's on your mind... Be as detailed as possible to help us understand your feedback better."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Minimum 10 characters required
              </p>
              <p className="text-xs text-gray-500">
                {formData.message.length}/1000
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitFeedbackMutation.isLoading || formData.message.length < 10}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
            >
              {submitFeedbackMutation.isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackModal