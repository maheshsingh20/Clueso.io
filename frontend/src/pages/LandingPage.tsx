import { Link } from 'react-router-dom'
import { useState, Suspense, lazy, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { 
  Play, 
  Mic, 
  FileText, 
  Users, 
  Download,
  ArrowRight,
  CheckCircle,
  Video,
  Bot,
  Sparkles,
  Clock,
  Star,
  Globe,
  Shield,
  Headphones,
  ChevronDown,
  Presentation
} from 'lucide-react'
import LazySection from '../components/LazySection'

// Lazy load components
const SocialProof = lazy(() => import('../components/SocialProof'))
const AIFeaturesSection = lazy(() => import('../components/AIFeaturesSection'))
const UseCasesSection = lazy(() => import('../components/UseCasesSection'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-24 bg-gradient-to-r from-red-50 to-pink-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
)

// Section loading placeholder
const SectionPlaceholder = () => (
  <div className="py-24 bg-gradient-to-r from-red-50/30 to-pink-50/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const features = [
  {
    icon: Video,
    title: 'Smart Screen Recording',
    description: 'Record your screen in HD quality with automatic scene detection and smart cropping.',
    color: 'bg-red-500'
  },
  {
    icon: Bot,
    title: 'AI Voiceovers',
    description: 'Generate natural-sounding voiceovers in multiple languages and voices.',
    color: 'bg-purple-500'
  },
  {
    icon: FileText,
    title: 'Auto Documentation',
    description: 'Transform videos into step-by-step guides, tutorials, and knowledge bases.',
    color: 'bg-green-500'
  },
  {
    icon: Sparkles,
    title: 'AI Enhancement',
    description: 'Automatic captions, highlights, zoom effects, and content optimization.',
    color: 'bg-yellow-500'
  },
  {
    icon: Users,
    title: 'Team Workspaces',
    description: 'Collaborate with your team, share projects, and manage permissions.',
    color: 'bg-indigo-500'
  },
  {
    icon: Download,
    title: 'Multi-Format Export',
    description: 'Export to video, HTML, PDF, or embed directly into your applications.',
    color: 'bg-pink-500'
  }
]

const stats = [
  { number: '50K+', label: 'Videos Created' },
  { number: '10K+', label: 'Happy Users' },
  { number: '99.9%', label: 'Uptime' },
  { number: '24/7', label: 'Support' }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Product at TechFlow',
    content: 'Clueso has revolutionized how we create product demos. The AI voiceovers are incredibly natural, and we\'ve reduced our video production time by 80% while improving quality.',
    avatar: '👩‍💼'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Learning & Development Lead at DataCorp',
    content: 'Our training materials went from amateur to professional overnight. The automatic documentation feature alone has saved us hundreds of hours of manual work.',
    avatar: '👨‍🏫'
  },
  {
    name: 'Emily Watson',
    role: 'Content Strategy Director at CreativeHub',
    content: 'The smart auto-zooms and beautiful captions make our tutorials incredibly engaging. Our viewer retention has increased by 65% since switching to Clueso.',
    avatar: '👩‍🎨'
  }
]

const benefits = [
  'Save 80% of time on video editing and documentation',
  'Professional quality output with zero learning curve',
  'Real-time collaboration with unlimited team members',
  'AI-powered transcription with 99% accuracy',
  'Export to 10+ formats including interactive HTML',
  'Enterprise-grade security and compliance'
]

const LandingPage = () => {
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false)
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false)
        setIsResourcesDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleWatchDemo = () => {
    toast.info('Demo video coming soon! Sign up to be notified when it\'s ready.')
  }

  const handleFeatureClick = (featureName: string) => {
    toast.info(`${featureName} feature coming soon! Sign up to get early access.`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Matching Real Clueso Design */}
      <header ref={headerRef} className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <svg width="126" height="24" viewBox="0 0 126 24" className="h-6">
                  <defs>
                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                  <text x="0" y="18" fontSize="20" fontWeight="bold" fill="url(#logo-gradient)" fontFamily="system-ui">
                    Clueso
                  </text>
                </svg>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Product Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsProductDropdownOpen(true)}
                onMouseLeave={() => setIsProductDropdownOpen(false)}
              >
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50">
                  Product
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 mt-2 w-[480px] bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden transition-all duration-200 ${
                  isProductDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                } z-50`}>
                  <div className="p-5">
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Product Features</div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            handleFeatureClick('Screen Recording')
                            setIsProductDropdownOpen(false)
                          }}
                          className="flex items-start p-3 rounded-xl hover:bg-red-50 transition-colors group text-left w-full"
                        >
                          <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors flex-shrink-0">
                            <Video className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 text-sm">Screen Recording</div>
                            <div className="text-xs text-gray-600 leading-relaxed">HD recording with smart cropping</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleFeatureClick('AI Voiceovers')
                            setIsProductDropdownOpen(false)
                          }}
                          className="flex items-start p-3 rounded-xl hover:bg-red-50 transition-colors group text-left w-full"
                        >
                          <div className="p-2 bg-pink-100 rounded-lg mr-3 group-hover:bg-pink-200 transition-colors flex-shrink-0">
                            <Mic className="w-5 h-5 text-pink-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 text-sm">AI Voiceovers</div>
                            <div className="text-xs text-gray-600 leading-relaxed">Natural voices in 40+ languages</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleFeatureClick('Smart Editing')
                            setIsProductDropdownOpen(false)
                          }}
                          className="flex items-start p-3 rounded-xl hover:bg-red-50 transition-colors group text-left w-full"
                        >
                          <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 text-sm">Smart Editing</div>
                            <div className="text-xs text-gray-600 leading-relaxed">AI-powered cuts and transitions</div>
                          </div>
                        </button>
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            handleFeatureClick('Auto Documentation')
                            setIsProductDropdownOpen(false)
                          }}
                          className="flex items-start p-3 rounded-xl hover:bg-red-50 transition-colors group text-left w-full"
                        >
                          <div className="p-2 bg-emerald-100 rounded-lg mr-3 group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                            <FileText className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 text-sm">Auto Documentation</div>
                            <div className="text-xs text-gray-600 leading-relaxed">Generate guides automatically</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleFeatureClick('Team Collaboration')
                            setIsProductDropdownOpen(false)
                          }}
                          className="flex items-start p-3 rounded-xl hover:bg-red-50 transition-colors group text-left w-full"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 text-sm">Team Collaboration</div>
                            <div className="text-xs text-gray-600 leading-relaxed">Real-time editing and sharing</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleFeatureClick('Multi-Format Export')
                            setIsProductDropdownOpen(false)
                          }}
                          className="flex items-start p-3 rounded-xl hover:bg-red-50 transition-colors group text-left w-full"
                        >
                          <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors flex-shrink-0">
                            <Download className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 text-sm">Multi-Format Export</div>
                            <div className="text-xs text-gray-600 leading-relaxed">Export to video, HTML, PDF</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-red-100 p-4 bg-gradient-to-r from-red-50 to-pink-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Ready to get started?</div>
                        <div className="text-xs text-gray-600">Try all features free for 14 days</div>
                      </div>
                      <button
                        onClick={() => {
                          handleFeatureClick('Start Free Trial')
                          setIsProductDropdownOpen(false)
                        }}
                        className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm"
                      >
                        Start Free Trial →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                onMouseLeave={() => setIsResourcesDropdownOpen(false)}
              >
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50">
                  Resources
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isResourcesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden transition-all duration-200 ${
                  isResourcesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                } z-50`}>
                  <div className="p-3">
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">Learn & Support</div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          handleFeatureClick('Documentation')
                          setIsResourcesDropdownOpen(false)
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <div className="p-1.5 bg-red-100 rounded-md mr-3 group-hover:bg-red-200 transition-colors flex-shrink-0">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">Documentation</div>
                          <div className="text-xs text-gray-500">Complete guides and API docs</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleFeatureClick('Video Tutorials')
                          setIsResourcesDropdownOpen(false)
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <div className="p-1.5 bg-pink-100 rounded-md mr-3 group-hover:bg-pink-200 transition-colors flex-shrink-0">
                          <Play className="w-4 h-4 text-pink-600" />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">Video Tutorials</div>
                          <div className="text-xs text-gray-500">Step-by-step video guides</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleFeatureClick('Templates')
                          setIsResourcesDropdownOpen(false)
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <div className="p-1.5 bg-emerald-100 rounded-md mr-3 group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                          <Presentation className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">Templates</div>
                          <div className="text-xs text-gray-500">Ready-to-use video templates</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleFeatureClick('Community')
                          setIsResourcesDropdownOpen(false)
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <div className="p-1.5 bg-blue-100 rounded-md mr-3 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">Community</div>
                          <div className="text-xs text-gray-500">Join our Discord community</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleFeatureClick('Help Center')
                          setIsResourcesDropdownOpen(false)
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <div className="p-1.5 bg-purple-100 rounded-md mr-3 group-hover:bg-purple-200 transition-colors flex-shrink-0">
                          <Headphones className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">Help Center</div>
                          <div className="text-xs text-gray-500">Get support and answers</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleFeatureClick('Pricing')}
                className="px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50"
              >
                Pricing
              </button>
              
              <button
                onClick={() => handleFeatureClick('Enterprise')}
                className="px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50"
              >
                Enterprise
              </button>
            </nav>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Clueso Style */}
      <section className="pt-16 pb-24 bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-transparent to-pink-100/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-red-200/50 rounded-full text-red-700 text-sm font-bold mb-8 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Screen Recording Platform
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Create professional videos
              <span className="block bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                in minutes, not hours
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform screen recordings into polished tutorials with AI-powered voiceovers, 
              smart editing, and automatic documentation generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button 
                onClick={handleWatchDemo}
                className="bg-white/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-red-50 hover:border-red-300 transition-all duration-300 inline-flex items-center justify-center shadow-lg"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Video Preview */}
            <div className="relative max-w-4xl mx-auto">
              <div 
                onClick={handleWatchDemo}
                className="aspect-video bg-white/80 backdrop-blur-sm rounded-3xl border border-red-200/50 shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl hover:scale-[1.02] transition-all duration-500"
              >
                <div className="w-full h-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl mb-4 mx-auto hover:scale-110 transition-transform duration-300">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-red-700 font-bold text-lg">Product Demo Video</p>
                    <p className="text-red-500 text-sm">See Clueso in action</p>
                  </div>
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-3 border border-red-200/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-pink-200/50">
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-pink-600" />
                  <div className="text-sm">
                    <div className="font-bold text-gray-900">AI Voiceover</div>
                    <div className="text-pink-600">Generated in 30s</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mt-20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-bold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <LazySection fallback={<SectionPlaceholder />}>
        <Suspense fallback={<LoadingSpinner />}>
          <SocialProof />
        </Suspense>
      </LazySection>

      {/* AI Features Section */}
      <LazySection fallback={<SectionPlaceholder />}>
        <Suspense fallback={<LoadingSpinner />}>
          <AIFeaturesSection />
        </Suspense>
      </LazySection>

      {/* Use Cases Section */}
      <LazySection fallback={<SectionPlaceholder />}>
        <Suspense fallback={<LoadingSpinner />}>
          <UseCasesSection />
        </Suspense>
      </LazySection>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white via-red-50/30 to-pink-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Powerful Features for
              <span className="block bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Every Creator
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to create, edit, and share professional video content with the power of AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-3xl border border-red-100/50 hover:border-red-200 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-100/10 via-transparent to-pink-100/10"></div>
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                Why Thousands Choose
                <span className="block bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Clueso
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Join the revolution in video creation. Our AI-powered platform eliminates the complexity 
                of traditional video editing while delivering professional results every time.
              </p>
              
              <ul className="space-y-6">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0 shadow-lg">
                      <CheckCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700 text-lg font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative z-10 border border-red-200/50">
                <div className="aspect-video bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl mb-4 mx-auto">
                      <Play className="w-10 h-10 text-red-600" />
                    </div>
                    <p className="text-red-700 font-bold">Click to see Clueso in action</p>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">
                  See the Magic Happen
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Watch how Clueso transforms a simple screen recording into a professional 
                  video with voiceover, captions, and documentation in under 5 minutes.
                </p>
                <button 
                  onClick={handleWatchDemo}
                  className="w-full bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white py-3 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300"
                >
                  Watch 3-Minute Demo
                </button>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-pink-400 to-red-400 rounded-3xl opacity-20 rotate-12"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-400 rounded-3xl opacity-20 -rotate-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-white via-red-50/20 to-pink-50/20 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-full px-6 py-3 mb-8">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">
                Customer Stories
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by Creators
              <span className="block bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who've transformed their video creation process with Clueso
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Quote icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                  </div>
                  
                  {/* Testimonial content */}
                  <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Rating */}
                  <div className="flex text-yellow-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  
                  {/* Author info */}
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Trusted by Industry Leaders
              </h3>
              <p className="text-gray-600 text-lg">
                See why teams at top companies choose Clueso for their video needs
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  50K+
                </div>
                <div className="text-gray-600 font-medium">Videos Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <div className="text-gray-600 font-medium">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-gray-600 font-medium">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  4.9★
                </div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden border-t border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-transparent to-pink-100/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Video Creation?
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators, educators, and businesses who are already using Clueso 
            to create amazing video content in minutes, not hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              to="/register"
              className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              Start Your Free Trial
              <ArrowRight className="ml-3 w-6 h-6" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-gray-300 text-gray-700 bg-white px-8 py-4 rounded-xl font-bold text-lg hover:border-red-400 hover:text-red-600 hover:shadow-lg transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-pink-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <Headphones className="w-5 h-5 mr-2 text-red-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-red-50 border-t border-gray-200 py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-pink-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Clueso</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                The AI-powered video creation platform that transforms screen recordings 
                into professional content in minutes.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-all duration-200 cursor-pointer shadow-sm">
                  <Globe className="w-5 h-5 text-gray-600 hover:text-red-600 transition-colors" />
                </div>
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 cursor-pointer shadow-sm">
                  <Users className="w-5 h-5 text-gray-600 hover:text-pink-600 transition-colors" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-900">Product</h4>
              <ul className="space-y-3 text-gray-600">
                <li><button onClick={() => handleFeatureClick('Features')} className="hover:text-red-600 transition-colors text-left">Features</button></li>
                <li><button onClick={() => handleFeatureClick('Pricing')} className="hover:text-red-600 transition-colors text-left">Pricing</button></li>
                <li><Link to="/templates" className="hover:text-red-600 transition-colors">Templates</Link></li>
                <li><button onClick={() => handleFeatureClick('API')} className="hover:text-red-600 transition-colors text-left">API</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-900">Support</h4>
              <ul className="space-y-3 text-gray-600">
                <li><button onClick={() => handleFeatureClick('Help Center')} className="hover:text-pink-600 transition-colors text-left">Help Center</button></li>
                <li><button onClick={() => handleFeatureClick('Contact Us')} className="hover:text-pink-600 transition-colors text-left">Contact Us</button></li>
                <li><button onClick={() => handleFeatureClick('Status')} className="hover:text-pink-600 transition-colors text-left">Status</button></li>
                <li><button onClick={() => handleFeatureClick('Community')} className="hover:text-pink-600 transition-colors text-left">Community</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 Clueso. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-500 text-sm">
              <button onClick={() => handleFeatureClick('Privacy Policy')} className="hover:text-red-600 transition-colors">Privacy Policy</button>
              <button onClick={() => handleFeatureClick('Terms of Service')} className="hover:text-pink-600 transition-colors">Terms of Service</button>
              <button onClick={() => handleFeatureClick('Cookie Policy')} className="hover:text-red-600 transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage