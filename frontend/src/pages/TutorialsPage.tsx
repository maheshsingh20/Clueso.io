import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'sonner'
import { 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen,
  ChevronRight,
  Trophy,
  Target,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { userProgressService, Tutorial } from '../services/userProgress'

const TutorialsPage = () => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const queryClient = useQueryClient()

  // Fetch tutorials and user progress
  const { data: tutorials = [] } = useQuery(
    'tutorials',
    userProgressService.getTutorials
  )

  const { data: userProgress } = useQuery(
    'userProgress',
    userProgressService.getUserProgress
  )

  // Complete tutorial mutation
  const completeTutorialMutation = useMutation(
    userProgressService.completeTutorial,
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries('userProgress')
        toast.success('Tutorial completed! 🎉')
        
        // Show achievement notifications
        if (result.newAchievements.length > 0) {
          result.newAchievements.forEach(achievement => {
            if (achievement === 'first_tutorial') {
              toast.success('Achievement unlocked: First Tutorial! 🏆')
            } else if (achievement === 'tutorial_master') {
              toast.success('Achievement unlocked: Tutorial Master! 🌟')
            }
          })
        }
      },
      onError: () => {
        toast.error('Failed to complete tutorial')
      }
    }
  )

  const handleCompleteTutorial = (tutorialId: string) => {
    completeTutorialMutation.mutate(tutorialId)
  }

  const isTutorialCompleted = (tutorialId: string) => {
    return userProgress?.completedTutorials.includes(tutorialId) || false
  }

  const getCompletionPercentage = () => {
    if (!tutorials.length || !userProgress) return 0
    return Math.round((userProgress.completedTutorials.length / tutorials.length) * 100)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'bg-red-50 text-red-600 border-red-100'
      case 'ai': return 'bg-pink-50 text-pink-600 border-pink-100'
      case 'collaboration': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'advanced': return 'bg-purple-50 text-purple-600 border-purple-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-100/50 p-8 mb-8 shadow-lg hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Link 
                    to="/dashboard"
                    className="p-2 bg-white/80 hover:bg-white/90 rounded-md transition-all duration-300 hover:scale-110 border border-gray-100/50 hover:border-green-200/60"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </Link>
                  <div className="p-2 bg-gradient-to-br from-red-50 to-pink-50 rounded-md border border-red-100/50 hover:border-red-200/60 transition-all duration-300">
                    <Play className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-red-700 bg-red-50/60 px-3 py-1 rounded-md border border-red-100/50 hover:border-red-200/60 transition-all duration-300">Tutorial Center</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
                  Tutorial <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Center</span>
                </h1>
                <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
                  Master Clueso with our comprehensive video tutorials and interactive guides.
                </p>
              </div>
              
              {/* Progress Circle */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-red-100/50 hover:border-purple-200/60 transition-all duration-300 mb-3">
                    <span className="text-2xl font-black text-gray-900">
                      {getCompletionPercentage()}%
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Complete</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-semibold text-gray-700">Your Progress</span>
                <span className="font-bold text-gray-800 bg-white/80 px-3 py-1 rounded-md border border-red-100/50 hover:border-orange-200/60 transition-all duration-300">
                  {userProgress?.completedTutorials.length || 0} of {tutorials.length} completed
                </span>
              </div>
              <div className="w-full bg-red-50/80 rounded-md h-3 shadow-inner border border-red-100/50 hover:border-red-200/60 transition-all duration-300">
                <div 
                  className="bg-gradient-to-r from-red-400 to-pink-400 rounded-md h-3 transition-all duration-700 shadow-sm"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100/20 to-pink-100/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-100/20 to-red-100/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tutorial List */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-red-100/50 p-6 mb-8 hover:border-cyan-200/60 transition-all duration-300 sticky top-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                <span>Available Tutorials</span>
              </h2>
              
              <div className="space-y-3">
                {tutorials.map((tutorial) => {
                  const isCompleted = isTutorialCompleted(tutorial.id)
                  const isSelected = selectedTutorial?.id === tutorial.id
                  
                  return (
                    <div
                      key={tutorial.id}
                      onClick={() => setSelectedTutorial(tutorial)}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        isSelected
                          ? 'border-red-200 bg-red-50/50 hover:border-red-300/60'
                          : 'border-red-100/50 hover:border-yellow-200/60 hover:bg-red-50/30'
                      }`}
                    >
                      {isCompleted && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 text-sm">
                            {tutorial.title}
                          </h3>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border hover:border-opacity-80 transition-all duration-300 ${getCategoryColor(tutorial.category)}`}>
                              {tutorial.category}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-md border border-red-100/50 hover:border-indigo-200/60 transition-all duration-300">
                              <Clock className="w-3 h-3" />
                              <span>{tutorial.duration}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {tutorial.description}
                          </p>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tutorial Content */}
          <div className="lg:col-span-2">
            {selectedTutorial ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-red-100/50 p-8 hover:border-teal-200/60 transition-all duration-300 shadow-sm">
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 rounded-md text-sm font-medium border hover:border-opacity-80 transition-all duration-300 ${getCategoryColor(selectedTutorial.category)}`}>
                      {selectedTutorial.category}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTutorial.duration}</span>
                    </div>
                    {isTutorialCompleted(selectedTutorial.id) && (
                      <div className="flex items-center space-x-1 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedTutorial.title}
                  </h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {selectedTutorial.description}
                  </p>
                </div>

                {/* Video Player */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg aspect-video mb-8 flex items-center justify-center relative overflow-hidden border border-red-100/50 hover:border-violet-200/60 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 to-pink-100/30" />
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="relative z-10 w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/95 transition-all duration-300 hover:scale-110 border border-red-200/50 hover:border-rose-300/60 shadow-lg"
                  >
                    <Play className="w-10 h-10 text-red-600 ml-1" />
                  </button>
                  <div className="absolute bottom-6 left-6 text-gray-700">
                    <div className="bg-white/90 backdrop-blur-sm rounded-md px-4 py-2 border border-red-200/50 hover:border-amber-200/60 transition-all duration-300 shadow-sm">
                      <p className="font-semibold">{selectedTutorial.title}</p>
                      <p className="text-sm text-gray-500">{selectedTutorial.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Tutorial Steps */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-red-600" />
                    <span>What you'll learn</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTutorial.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50/80 to-pink-50/80 rounded-lg border border-red-100/50 hover:border-lime-200/60 transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 text-red-700 rounded-md flex items-center justify-center text-sm font-bold border border-red-200/50 hover:border-red-300/60 transition-all duration-300">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  {isTutorialCompleted(selectedTutorial.id) ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50/80 px-4 py-2 rounded-md border border-emerald-200/50 hover:border-emerald-300/60 transition-all duration-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Completed</span>
                      </div>
                      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50/80 px-4 py-2 rounded-md border border-amber-200/50 hover:border-amber-300/60 transition-all duration-300">
                        <Trophy className="w-5 h-5" />
                        <span className="font-semibold">Well done!</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteTutorial(selectedTutorial.id)}
                      disabled={completeTutorialMutation.isLoading}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-md border border-red-400/50 hover:border-red-500/60 transition-all duration-300 hover:scale-105 disabled:opacity-50 shadow-sm"
                    >
                      {completeTutorialMutation.isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </button>
                  )}
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="text-lg font-bold text-gray-900">
                      {userProgress?.completedTutorials.length || 0} / {tutorials.length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-red-100/50 p-12 hover:border-sky-200/60 transition-all duration-300 text-center shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex items-center justify-center mx-auto mb-6 border border-red-100/50 hover:border-red-200/60 transition-all duration-300">
                  <BookOpen className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Select a Tutorial
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  Choose a tutorial from the list to start learning. Each tutorial includes step-by-step instructions and practical examples.
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Interactive content</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>Achievement system</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorialsPage