import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
  description: string
}

const ComingSoonPage = ({ title, description }: ComingSoonPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          {title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>
        
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-md p-6 mb-8 border border-red-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon!</h3>
          <p className="text-gray-600 text-sm">
            This feature is currently under development. We're working hard to bring you an amazing experience.
          </p>
        </div>
        
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default ComingSoonPage