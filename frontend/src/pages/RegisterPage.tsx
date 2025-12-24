import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, CheckCircle, Users, Video, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { RegisterRequest } from '@clueso/shared'
import { authService } from '../services/auth'
import { useAuthStore } from '../store/authStore'

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterRequest & { confirmPassword: string }>()

  const password = watch('password')

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    setIsLoading(true)
    
    try {
      const { confirmPassword, ...registerData } = data
      const response = await authService.register(registerData)
      setAuth(response.user, response.tokens)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Video,
      title: 'Smart Recording',
      description: 'HD screen recording with automatic scene detection'
    },
    {
      icon: Bot,
      title: 'AI Voiceovers',
      description: 'Natural-sounding voices in 40+ languages'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time editing and sharing with your team'
    }
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex relative overflow-hidden">
      {/* Geometric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-400 rounded-3xl rotate-12 opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl -rotate-12 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-br from-red-300 to-pink-300 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-gradient-to-br from-pink-300 to-red-300 rounded-xl rotate-45 opacity-25 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Left Side - Feature Cards */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="relative z-10 flex flex-col justify-center px-8 text-gray-900">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl border border-red-300/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-black text-lg">C</span>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-pink-600 bg-clip-text text-transparent">Clueso</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-black mb-4 leading-tight">
            Start Creating
            <span className="block bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Amazing Videos
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-sm">
            Join creators using AI to make professional videos in minutes.
          </p>
          
          {/* Compact Feature Cards */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                style={{ transform: `rotate(${index % 2 === 0 ? '1deg' : '-1deg'})` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Compact Trust Badge */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200/50">
            <div className="flex items-center justify-center space-x-4 text-green-700 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold">Free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold">No card</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Modern Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200/50 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500"></div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    type="text"
                    placeholder="First name"
                    className="w-full px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300 hover:border-gray-300 text-sm"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    type="text"
                    placeholder="Last name"
                    className="w-full px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300 hover:border-gray-300 text-sm"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300 hover:border-gray-300"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300 hover:border-gray-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300 hover:border-gray-300"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500/30 focus:ring-offset-0 flex-shrink-0"
                />
                <p className="text-gray-700 text-xs leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-red-600 hover:text-red-700 font-semibold transition-colors underline">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-red-600 hover:text-red-700 font-semibold transition-colors underline">
                    Privacy Policy
                  </a>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage