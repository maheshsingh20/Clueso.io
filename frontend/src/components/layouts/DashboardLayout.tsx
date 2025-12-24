import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  Home, 
  FolderOpen, 
  Video, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Users,
  TrendingUp,
  Plus,
  Search,
  Bell,
  HelpCircle,
  Clock,
  ArrowRight,
  Play,
  BookOpen
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/auth'
import { searchService } from '../../services/search'
import { toast } from 'sonner'

interface NavigationItem {
  name: string
  href: string
  icon: any
  gradient: string
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home, gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'All Projects', href: '/projects', icon: FolderOpen, gradient: 'from-green-500 to-emerald-500' },
  { name: 'Video Templates', href: '/templates', icon: Video, gradient: 'from-pink-500 to-rose-500' },
  { name: 'Team', href: '/workspaces', icon: Users, gradient: 'from-purple-500 to-pink-500' },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, gradient: 'from-indigo-500 to-purple-500' },
  { name: 'Tutorials', href: '/tutorials', icon: Play, gradient: 'from-red-500 to-pink-500' },
  { name: 'Help Center', href: '/help', icon: BookOpen, gradient: 'from-orange-500 to-red-500' },
  { name: 'Settings', href: '/settings', icon: Settings, gradient: 'from-gray-500 to-gray-600' },
]

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  // Search functionality
  const { data: searchResults, isLoading: isSearching } = useQuery(
    ['search', searchQuery],
    () => searchService.globalSearch({ 
      query: searchQuery, 
      limit: 15 
    }),
    {
      enabled: searchQuery.length >= 2,
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  )

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowSearchResults(value.length > 0)
  }

  const handleSearchSelect = (query: string, type: 'project' | 'workspace' | 'video', id: string) => {
    // Save to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(newRecentSearches)
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))
    
    // Navigate to the selected item
    if (type === 'project') {
      navigate(`/projects/${id}`)
    } else if (type === 'workspace') {
      navigate(`/workspaces`)
    } else if (type === 'video') {
      navigate(`/videos/${id}`)
    }
    
    setShowSearchResults(false)
    setSearchQuery('')
  }

  const handleRecentSearchSelect = (query: string) => {
    setSearchQuery(query)
    setShowSearchResults(true)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      clearAuth()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transition ease-in-out duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white shadow-lg hover:scale-110 transition-transform duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <SidebarContent navigation={navigation} currentPath={location.pathname} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} currentPath={location.pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
          <button
            className="px-4 border-r border-gray-200/50 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 md:hidden transition-colors hover:bg-red-50/50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1 px-6 flex justify-between items-center">
            {/* Left side - New Video button and Search */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => navigate('/projects')}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Video
              </button>
              
              <div className="relative hidden sm:block" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects, workspaces, videos..."
                  className="pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300 hover:bg-white/80 w-72 lg:w-80 shadow-lg"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0 || recentSearches.length > 0)}
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    {searchQuery.length >= 2 ? (
                      // Search Results
                      <div className="p-3">
                        {isSearching ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-sm text-gray-600 font-medium">Searching...</span>
                          </div>
                        ) : searchResults ? (
                          <div className="space-y-2">
                            {/* Projects */}
                            {searchResults.projects.length > 0 && (
                              <div>
                                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100/50">
                                  Projects ({searchResults.projects.length})
                                </div>
                                {searchResults.projects.map((project) => (
                                  <button
                                    key={project._id}
                                    onClick={() => handleSearchSelect(searchQuery, 'project', project._id)}
                                    className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-red-50/50 rounded-xl transition-all duration-300 hover:scale-105"
                                  >
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-200 to-red-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                      <FolderOpen className="w-5 h-5 text-red-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 truncate">{project.name}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {(project.workspace as any)?.name || 'Personal Workspace'}
                                      </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Workspaces */}
                            {searchResults.workspaces.length > 0 && (
                              <div>
                                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100/50">
                                  Workspaces ({searchResults.workspaces.length})
                                </div>
                                {searchResults.workspaces.map((workspace) => (
                                  <button
                                    key={workspace._id}
                                    onClick={() => handleSearchSelect(searchQuery, 'workspace', workspace._id)}
                                    className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-pink-50/50 rounded-xl transition-all duration-300 hover:scale-105"
                                  >
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-rose-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                      <Users className="w-5 h-5 text-pink-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 truncate">{workspace.name}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {workspace.members?.length || 0} members
                                      </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Videos */}
                            {searchResults.videos.length > 0 && (
                              <div>
                                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100/50">
                                  Videos ({searchResults.videos.length})
                                </div>
                                {searchResults.videos.map((video) => (
                                  <button
                                    key={video._id}
                                    onClick={() => handleSearchSelect(searchQuery, 'video', video._id)}
                                    className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-purple-50/50 rounded-xl transition-all duration-300 hover:scale-105"
                                  >
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                      <Video className="w-5 h-5 text-purple-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 truncate">{video.title}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {(video.project as any)?.name || 'Unknown Project'}
                                      </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* No Results */}
                            {searchResults.total === 0 && (
                              <div className="px-3 py-8 text-center">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <div className="text-sm font-medium text-gray-500">No results found for "{searchQuery}"</div>
                                <div className="text-xs text-gray-400 mt-1">Try different keywords or check spelling</div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      // Recent Searches
                      recentSearches.length > 0 && (
                        <div className="p-3">
                          <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100/50">
                            Recent Searches
                          </div>
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleRecentSearchSelect(search)}
                              className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50/50 rounded-xl transition-all duration-300 hover:scale-105"
                            >
                              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-700 truncate font-medium">{search}</span>
                            </button>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-3">
              {/* Trial notification */}
              <div className="hidden xl:flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/50 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm">
                <span className="text-xs font-medium text-pink-800 whitespace-nowrap">Trial expires in 6 days</span>
                <button 
                  onClick={() => toast.info('Upgrade plans coming soon!')}
                  className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-2.5 py-1 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  Upgrade
                </button>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-1">
                {/* Notifications */}
                <button 
                  onClick={() => toast.info('Notifications feature coming soon!')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 hover:backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
                
                {/* Help */}
                <button 
                  onClick={() => navigate('/help')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 hover:backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  title="Help & Support"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              
              {/* User menu */}
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl px-2.5 py-2 shadow-lg border border-gray-200/50">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {user?.firstName}'s Team
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-red-50/50 rounded-lg transition-all duration-300 hover:scale-110"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ 
  navigation, 
  currentPath 
}: { 
  navigation: NavigationItem[]
  currentPath: string 
}) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 backdrop-blur-xl border-r border-gray-200/50 shadow-xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/20 to-red-200/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
      
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200/50 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl border border-red-300/30 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-pink-600 bg-clip-text text-transparent">Clueso</span>
            <div className="px-2 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs font-bold rounded-full shadow-sm">
              +
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isActive
                    ? 'bg-white/80 backdrop-blur-sm text-red-700 shadow-xl border border-red-200/50'
                    : 'text-gray-700 hover:bg-white/60 hover:backdrop-blur-sm hover:text-gray-900 hover:shadow-lg'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-pink-50/50 rounded-2xl"></div>
                )}
                <div className="relative z-10 flex items-center w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-red-200 to-pink-200 shadow-lg' 
                      : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-red-100 group-hover:to-pink-100'
                  }`}>
                    <item.icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-red-500'
                      }`}
                    />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-gradient-to-br from-red-400 to-pink-400 rounded-full shadow-sm"></div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
        
        {/* Bottom section */}
        <div className="p-3 border-t border-gray-200/50 relative z-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-gray-200/50">
            <div className="flex items-center space-x-3 text-xs">
              <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full shadow-sm animate-pulse"></div>
              <span className="font-medium text-gray-700">All systems operational</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">v2.1.0</span> • Last updated 2 min ago
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout