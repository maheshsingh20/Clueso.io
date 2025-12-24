import { useState, useEffect } from 'react'
import { Sparkles, Mic, ZoomIn, Type, FileText, Palette } from 'lucide-react'

const features = [
  {
    id: 1,
    icon: FileText,
    title: "Perfect Video Scripts",
    description: "AI removes filler words and rewrites your script clearly and concisely, perfectly matching your brand voice.",
    gradient: "from-blue-400 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100"
  },
  {
    id: 2,
    icon: Mic,
    title: "Lifelike AI Voiceovers",
    description: "Your recorded audio is swapped with AI voiceovers that sound impressively professional and realistic.",
    gradient: "from-pink-400 to-pink-600",
    bgGradient: "from-pink-50 to-pink-100"
  },
  {
    id: 3,
    icon: ZoomIn,
    title: "Smart Auto-Zooms",
    description: "AI automatically zooms into key actions, highlighting exactly what viewers need to see.",
    gradient: "from-blue-500 to-pink-500",
    bgGradient: "from-blue-50 to-pink-50"
  },
  {
    id: 4,
    icon: Type,
    title: "Beautiful Captions",
    description: "Instantly engage your viewers with eye-catching, AI-generated captions.",
    gradient: "from-pink-500 to-blue-500",
    bgGradient: "from-pink-50 to-blue-50"
  },
  {
    id: 5,
    icon: FileText,
    title: "Auto-Generated SOPs & How-Tos",
    description: "Clear, step-by-step documentation magically created from your videos.",
    gradient: "from-blue-600 to-pink-400",
    bgGradient: "from-blue-50 to-pink-50"
  },
  {
    id: 6,
    icon: Palette,
    title: "Branded Video Templates",
    description: "Keep your videos consistently on brand with themed intros, outros, and backgrounds.",
    gradient: "from-pink-600 to-blue-400",
    bgGradient: "from-pink-50 to-blue-50"
  }
]

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 100)

    return () => clearTimeout(timer)
  }, [index])

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className={`relative bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 ${
        isHovered ? 'shadow-2xl scale-105 border-gray-200' : 'shadow-lg hover:shadow-xl'
      }`}>
        
        {/* Animation Frame */}
        <div className="relative h-64 overflow-hidden">
          {/* Gradient Overlays */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-20`}></div>
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.gradient} opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8`}></div>
          <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${feature.gradient} opacity-15 rounded-full blur-xl transform -translate-x-4 translate-y-4`}></div>
          
          {/* Animated Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`relative transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              <div className={`w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 ${
                isHovered ? 'rotate-6 shadow-2xl' : 'rotate-0'
              }`}>
                <feature.icon className="w-12 h-12 text-white" />
              </div>
              
              {/* Floating particles effect */}
              {isHovered && (
                <>
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
                  <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-500"></div>
                </>
              )}
            </div>
          </div>
          
          {/* Animated background pattern */}
          <div className={`absolute inset-0 opacity-5 transition-opacity duration-500 ${isHovered ? 'opacity-10' : ''}`}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${
                feature.gradient.includes('blue') ? '#3B82F6' : 
                feature.gradient.includes('pink') ? '#EC4899' :
                '#6366F1'
              } 2px, transparent 2px)`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>
        </div>
        
        {/* Text Content */}
        <div className="p-8">
          <h5 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors duration-200">
            {feature.title}
          </h5>
          <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
            {feature.description}
          </p>
        </div>
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-5' : ''
        }`}></div>
      </div>
    </div>
  )
}

const AIFeaturesSection = () => {
  const [sectionVisible, setSectionVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    
    const element = document.getElementById('ai-features-section')
    if (element) observer.observe(element)
    
    return () => observer.disconnect()
  }, [])

  return (
    <section id="ai-features-section" className="py-24 bg-gradient-to-b from-blue-50/30 via-white to-pink-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-pink-50/30"></div>
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-blue-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Capability Tag */}
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-pink-50 to-blue-50 border border-pink-200 rounded-full px-6 py-3 mb-8">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-5 h-5 text-pink-400 opacity-30" />
              </div>
            </div>
            <span className="text-pink-600 font-semibold text-sm uppercase tracking-wider">
              Crafted with AI
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Major video edits,
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              automated.
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            AI does the heavy-lifting. The final touches are all yours – everything is customizable.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default AIFeaturesSection