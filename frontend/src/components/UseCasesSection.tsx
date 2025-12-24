import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Megaphone, 
  Lightbulb, 
  DollarSign, 
  Clipboard, 
  Monitor, 
  Headphones, 
  Code,
  Play
} from 'lucide-react'

const useCases = [
  {
    id: 1,
    icon: BookOpen,
    title: "Customer Education",
    isActive: false
  },
  {
    id: 2,
    icon: Megaphone,
    title: "Product Marketing",
    isActive: false
  },
  {
    id: 3,
    icon: Lightbulb,
    title: "Learning & Development",
    isActive: false
  },
  {
    id: 4,
    icon: DollarSign,
    title: "Sales Enablement",
    isActive: false
  },
  {
    id: 5,
    icon: Clipboard,
    title: "Product Management",
    isActive: false
  },
  {
    id: 6,
    icon: Monitor,
    title: "IT Change Management",
    isActive: false
  },
  {
    id: 7,
    icon: Headphones,
    title: "Customer Success/Support",
    isActive: false
  },
  {
    id: 8,
    icon: Code,
    title: "Engineering",
    isActive: true
  }
]

const UseCaseCard = ({ useCase, isActive, onClick }: { 
  useCase: typeof useCases[0], 
  isActive: boolean, 
  onClick: () => void 
}) => {
  return (
    <div 
      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'bg-white border border-gray-200 shadow-lg' 
          : 'bg-transparent hover:bg-white/50 hover:shadow-md'
      }`}
      onClick={onClick}
      tabIndex={0}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${
          isActive ? 'text-pink-500' : 'text-gray-600'
        }`}>
          <useCase.icon className="w-full h-full stroke-current" strokeWidth={1.5} />
        </div>
        <span className={`font-medium text-sm transition-colors duration-200 ${
          isActive ? 'text-gray-900' : 'text-gray-600'
        }`}>
          {useCase.title}
        </span>
      </div>
      
      {/* Gradient accent for active state */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-r-full"></div>
      )}
    </div>
  )
}

const UseCasesSection = () => {
  const [activeUseCase, setActiveUseCase] = useState(8) // Engineering is active by default
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    
    const element = document.getElementById('use-cases-section')
    if (element) observer.observe(element)
    
    return () => observer.disconnect()
  }, [])

  return (
    <section id="use-cases-section" className="py-24 bg-gradient-to-b from-blue-50/30 via-white to-pink-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-pink-50/20"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Clueso is built for
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              you
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            Explaining software is hard. Clueso makes it easy.
          </p>
        </div>

        {/* Content Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Use Cases List */}
          <div className="space-y-1">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.id}
                className={`transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{ transitionDelay: `${index * 100 + 500}ms` }}
              >
                <UseCaseCard
                  useCase={useCase}
                  isActive={activeUseCase === useCase.id}
                  onClick={() => setActiveUseCase(useCase.id)}
                />
              </div>
            ))}
          </div>

          {/* Video Demo */}
          <div className={`relative transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* YouTube Video Embed with lazy loading */}
              {isVisible && (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/8qcCkifuq0E?si=KlPI4ssGIdzo6Uxw&iv_load_policy=3&rel=0&modestbranding=1&playsinline=1"
                  title="Clueso Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              )}
              {!isVisible && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
                  <div className="animate-pulse">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                      <Play className="w-10 h-10 text-gray-500" />
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UseCasesSection