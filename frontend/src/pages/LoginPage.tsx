import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, CheckCircle, Users, Video, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { LoginRequest } from '@clueso/shared'
import { authService } from '../services/auth'
import { useAuthStore } from '../store/authStore'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true)
    
    try {
      const response = await authService.login(data)
      setAuth(response.user, response.tokens)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Video,
      title: 'Quick Access',
      description: 'Jump right back into your projects'
    },
    {
      icon: Bot,
      title: 'AI Enhanced',
      description: 'Continue with AI-powered editing tools'
    },
    {
      icon: Users,
      title: 'Team Ready',
      description: 'Collaborate with your team instantly'
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
            Welcome Back to
            <span className="block bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Video Creation
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-sm">
            Continue your creative journey with AI-powered video tools.
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
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200/50">
            <div className="flex items-center justify-center space-x-4 text-blue-700 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Secure login</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Fast access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Modern Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200/50 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500"></div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    {...register('password', { required: 'Password is required' })}
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500/30 focus:ring-offset-0" />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-red-600 hover:text-red-700 font-semibold transition-colors underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-red-600 hover:text-red-700 font-bold transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage