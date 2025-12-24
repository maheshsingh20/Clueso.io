import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import './SocialProof.css'

// Company logo components (replace with real logos later)
const CompanyLogo = ({ name, className = "" }: { name: string, className?: string }) => {
  const logoStyles: Record<string, { bg: string, text: string, shadow: string }> = {
    Microsoft: { bg: "bg-gradient-to-r from-blue-500 to-blue-600", text: "text-white", shadow: "shadow-blue-200" },
    Slack: { bg: "bg-gradient-to-r from-pink-500 to-pink-600", text: "text-white", shadow: "shadow-pink-200" }, 
    Notion: { bg: "bg-gradient-to-r from-blue-600 to-pink-500", text: "text-white", shadow: "shadow-blue-200" },
    Figma: { bg: "bg-gradient-to-r from-pink-400 to-blue-500", text: "text-white", shadow: "shadow-pink-200" },
    Stripe: { bg: "bg-gradient-to-r from-blue-500 to-pink-600", text: "text-white", shadow: "shadow-blue-200" },
    Shopify: { bg: "bg-gradient-to-r from-pink-500 to-blue-600", text: "text-white", shadow: "shadow-pink-200" }
  }
  
  const style = logoStyles[name] || { bg: 'bg-gradient-to-r from-gray-100 to-gray-200', text: 'text-gray-700', shadow: 'shadow-gray-100' }
  
  return (
    <div className={`h-14 flex items-center justify-center transition-all duration-500 transform hover:scale-110 ${className}`}>
      <div className={`${style.bg} ${style.text} rounded-xl px-6 py-3 font-bold text-sm shadow-lg ${style.shadow} hover:shadow-xl transition-all duration-300`}>
        {name}
      </div>
    </div>
  )
}

// Mock data - replace with real data
const socialProofData = {
  backing: {
    text: "Backed by",
    logo: "YC",
    logoUrl: "/yc-logo.svg"
  },
  rating: {
    score: 4.9,
    platform: "G2",
    reviews: 1200
  },
  customers: [
    { name: "Microsoft", logo: "/logos/microsoft.svg", testimonial: null },
    { name: "Slack", logo: "/logos/slack.svg", testimonial: null },
    { name: "Notion", logo: "/logos/notion.svg", testimonial: null },
    { name: "Figma", logo: "/logos/figma.svg", testimonial: null },
    { name: "Stripe", logo: "/logos/stripe.svg", testimonial: null },
    { name: "Shopify", logo: "/logos/shopify.svg", testimonial: null }
  ]
}

// Stats counter animation hook
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return count
}

const SocialProof = () => {
  const [hoveredCustomer, setHoveredCustomer] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  // Animated counter for reviews
  const reviewCount = useCountUp(socialProofData.rating.reviews, 2000)
  
  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    
    const element = document.getElementById('social-proof-section')
    if (element) observer.observe(element)
    
    return () => observer.disconnect()
  }, [])

  return (
    <section id="social-proof-section" className="py-20 bg-gradient-to-b from-pink-50/50 via-white to-blue-50/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-pink-50/30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Row */}
        <div className={`flex flex-col lg:flex-row items-center justify-between mb-16 gap-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Backed by */}
          <div className={`flex items-center space-x-6 bg-white rounded-2xl px-8 py-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${isVisible ? 'animate-slide-in-left animate-delay-200' : 'opacity-0'}`}>
            <span className="text-gray-600 font-semibold text-lg">{socialProofData.backing.text}</span>
            <div className="flex items-center space-x-3">
              {/* YC Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-2xl">YC</span>
              </div>
              <div>
                <span className="text-gray-900 font-bold text-xl block">Y Combinator</span>
                <span className="text-gray-500 text-sm">S24 Batch</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className={`flex items-center space-x-4 bg-white rounded-2xl px-8 py-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${isVisible ? 'animate-slide-in-right animate-delay-400' : 'opacity-0'}`}>
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 transition-all duration-200 ${
                    i < Math.floor(socialProofData.rating.score) 
                      ? 'text-yellow-400 fill-current drop-shadow-sm' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-gray-900 font-bold text-2xl">{socialProofData.rating.score}</span>
                <span className="text-gray-600 font-medium">on</span>
                <span className="text-gray-900 font-bold text-lg">{socialProofData.rating.platform}</span>
              </div>
              <span className="text-gray-500 text-sm">({isVisible ? reviewCount.toLocaleString() : '0'} reviews)</span>
            </div>
          </div>
        </div>

        {/* Customer Logos Grid */}
        <div className={`mb-20 ${isVisible ? 'animate-fade-in-up animate-delay-600' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <p className="text-gray-600 mb-2 font-medium text-lg">
              Trusted by teams at leading companies
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {socialProofData.customers.map((customer, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCustomer(index)}
                onMouseLeave={() => setHoveredCustomer(null)}
              >
                <CompanyLogo 
                  name={customer.name}
                  className={`transition-all duration-500 ${
                    hoveredCustomer === index 
                      ? 'grayscale-0 opacity-100 transform scale-105' 
                      : 'grayscale opacity-70 hover:opacity-90'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SocialProof