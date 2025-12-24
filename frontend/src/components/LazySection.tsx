import { ReactNode } from 'react'
import { useLazyLoad } from '../hooks/useLazyLoad'

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  className?: string
}

const LazySection = ({ 
  children, 
  fallback = <div className="h-96 bg-gray-50 animate-pulse rounded-lg"></div>, 
  threshold = 0.1,
  className = ""
}: LazySectionProps) => {
  const { ref, isVisible } = useLazyLoad(threshold)

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  )
}

export default LazySection