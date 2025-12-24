import { useQuery, useMutation, useQueryClient } from 'react-query'
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import { userProgressService } from '../services/userProgress'

interface OnboardingTooltipProps {
  step: number
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  onNext?: () => void
  onPrev?: () => void
  onSkip?: () => void
  isLastStep?: boolean
}

const OnboardingTooltip = ({
  step,
  title,
  description,
  onNext,
  onPrev,
  onSkip,
  isLastStep = false
}: OnboardingTooltipProps) => {
  const queryClient = useQueryClient()

  const { data: userProgress } = useQuery(
    'userProgress',
    userProgressService.getUserProgress
  )

  const updateStepMutation = useMutation(
    userProgressService.updateOnboardingStep,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userProgress')
      }
    }
  )

  const handleNext = () => {
    if (isLastStep) {
      updateStepMutation.mutate(10) // Mark onboarding as complete
    } else {
      updateStepMutation.mutate(step + 1)
      onNext?.()
    }
  }

  const handleSkip = () => {
    updateStepMutation.mutate(10) // Skip to end
    onSkip?.()
  }

  // Don't show if user has already completed onboarding
  if (!userProgress || userProgress.onboardingStep >= 10) {
    return null
  }

  // Only show if this is the current step
  if (userProgress.onboardingStep !== step) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${
                  stepNum <= step
                    ? 'bg-gradient-to-r from-cyan-500 to-pink-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">Step {step} of 5</span>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {step > 1 && (
              <button
                onClick={onPrev}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tour
            </button>
            
            <button
              onClick={handleNext}
              disabled={updateStepMutation.isLoading}
              className="btn btn-primary flex items-center space-x-1"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Finish</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingTooltip