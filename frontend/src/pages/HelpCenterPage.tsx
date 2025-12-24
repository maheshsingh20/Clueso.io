import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Search, 
  BookOpen, 
  FileText, 
  HelpCircle,
  ExternalLink,
  Clock,
  Tag,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Mail,
  Phone
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { userProgressService, HelpArticle } from '../services/userProgress'

const HelpCenterPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  // Fetch help articles
  const { data: articles = [] } = useQuery(
    ['helpArticles', selectedCategory, searchTerm],
    () => userProgressService.getHelpArticles({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchTerm || undefined
    })
  )

  const categories = [
    { id: 'all', name: 'All Articles', icon: BookOpen, color: 'bg-gray-100 text-gray-700' },
    { id: 'technical', name: 'Technical', icon: FileText, color: 'bg-blue-100 text-blue-700' },
    { id: 'ai', name: 'AI Features', icon: Sparkles, color: 'bg-pink-100 text-pink-700' },
    { id: 'collaboration', name: 'Collaboration', icon: ExternalLink, color: 'bg-green-100 text-green-700' },
    { id: 'export', name: 'Export & Share', icon: ExternalLink, color: 'bg-purple-100 text-purple-700' },
    { id: 'productivity', name: 'Productivity', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'support', name: 'Support', icon: HelpCircle, color: 'bg-red-100 text-red-700' }
  ]

  const getCategoryColor = (category: string) => {
    const categoryObj = categories.find(cat => cat.id === category)
    return categoryObj?.color || 'bg-gray-100 text-gray-700'
  }

  const getArticleContent = (article: HelpArticle) => {
    // Mock detailed content based on article ID
    const detailedContent: Record<string, string> = {
      video_formats: `
        <h3>Supported Video Formats</h3>
        <p>Clueso supports a wide range of video formats to ensure compatibility with your content:</p>
        
        <h4>Recommended Formats:</h4>
        <ul>
          <li><strong>MP4 (H.264)</strong> - Best overall compatibility and quality</li>
          <li><strong>MOV</strong> - High quality, ideal for professional content</li>
          <li><strong>AVI</strong> - Good for larger files with high quality</li>
        </ul>
        
        <h4>Also Supported:</h4>
        <ul>
          <li>WebM</li>
          <li>MKV</li>
          <li>FLV</li>
          <li>WMV</li>
        </ul>
        
        <h4>Best Practices:</h4>
        <ul>
          <li>Use MP4 format for best compatibility</li>
          <li>Keep file sizes under 2GB for optimal upload speed</li>
          <li>Use 1080p resolution for best quality</li>
          <li>Ensure audio is in AAC format</li>
        </ul>
      `,
      ai_enhancement: `
        <h3>How AI Enhancement Works</h3>
        <p>Our AI-powered tools use advanced machine learning to enhance your video content automatically:</p>
        
        <h4>Script Enhancement:</h4>
        <ul>
          <li>Improves grammar and clarity</li>
          <li>Suggests better word choices</li>
          <li>Optimizes for engagement</li>
        </ul>
        
        <h4>Auto Captions:</h4>
        <ul>
          <li>Accurate speech-to-text conversion</li>
          <li>Automatic timing synchronization</li>
          <li>Multiple language support</li>
        </ul>
        
        <h4>Smart Cuts:</h4>
        <ul>
          <li>Removes filler words and pauses</li>
          <li>Identifies key moments</li>
          <li>Maintains natural flow</li>
        </ul>
      `,
      team_management: `
        <h3>Managing Team Workspaces</h3>
        <p>Collaborate effectively with your team using Clueso's workspace features:</p>
        
        <h4>Creating Workspaces:</h4>
        <ol>
          <li>Go to the Team section</li>
          <li>Click "Create New Workspace"</li>
          <li>Set workspace name and description</li>
          <li>Choose privacy settings</li>
        </ol>
        
        <h4>Inviting Members:</h4>
        <ul>
          <li>Use email invitations</li>
          <li>Set appropriate permissions</li>
          <li>Manage member roles</li>
        </ul>
        
        <h4>Permission Levels:</h4>
        <ul>
          <li><strong>Owner:</strong> Full access and management</li>
          <li><strong>Admin:</strong> Can manage members and projects</li>
          <li><strong>Editor:</strong> Can edit and create content</li>
          <li><strong>Viewer:</strong> Read-only access</li>
        </ul>
      `
    }

    return detailedContent[article.id] || `
      <h3>${article.title}</h3>
      <p>${article.content}</p>
      <p>This is a comprehensive guide covering all aspects of ${article.title.toLowerCase()}. 
      Our team is constantly updating these articles to provide you with the most current information.</p>
      
      <h4>Need More Help?</h4>
      <p>If you can't find what you're looking for, please contact our support team at support@clueso.io</p>
    `
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-gray-200/80 hover:border-red-200/80 p-8 mb-8 transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Link 
                    to="/dashboard"
                    className="p-2 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </Link>
                  <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-red-700 bg-red-50/60 px-3 py-1 rounded-full">Help Center</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
                  Help <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Center</span>
                </h1>
                <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
                  Find answers to your questions and get the most out of Clueso.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-red-200/60 hover:border-red-300/80 transition-all duration-300 mb-2">
                    <span className="text-xl font-black text-gray-900">{articles.length}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Articles</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-red-200/60 hover:border-red-300/80 transition-all duration-300 mb-2">
                    <span className="text-xl font-black text-gray-900">{categories.length - 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Categories</p>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/60 backdrop-blur-sm border-2 border-gray-200/80 hover:border-red-200/80 focus:border-red-300/80 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-red-200/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-gray-200/80 hover:border-red-200/80 p-6 transition-all duration-300 sticky top-6">
              
              {/* Categories */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setSelectedArticle(null)
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                          selectedCategory === category.id
                            ? 'bg-red-50 text-red-700 border-2 border-red-200/80 hover:border-red-300/80'
                            : 'hover:bg-gray-50 text-gray-700 border-2 border-transparent hover:border-gray-200/60'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          selectedCategory === category.id ? 'bg-red-200' : 'bg-gray-100'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border-2 border-red-200/60 hover:border-red-300/80 transition-all duration-300">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-red-600" />
                  <span>Need More Help?</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>support@clueso.io</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>24/7 Live Chat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedArticle ? (
              /* Article View */
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-gray-200/80 hover:border-red-200/80 p-8 transition-all duration-300">
                <div className="mb-6">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to articles</span>
                  </button>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedArticle.category)}`}>
                      {selectedArticle.category}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Updated {new Date(selectedArticle.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedArticle.title}
                  </h1>
                  
                  {/* Tags */}
                  <div className="flex items-center space-x-2 mb-6">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div 
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ 
                    __html: getArticleContent(selectedArticle) 
                  }}
                />

                {/* Feedback */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Was this helpful?</h4>
                  <div className="flex space-x-3">
                    <button className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-semibold">
                      👍 Yes, helpful
                    </button>
                    <button className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-semibold">
                      👎 Needs improvement
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Articles List */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name} 
                    <span className="text-lg font-normal text-gray-500 ml-2">({articles.length})</span>
                  </h2>
                </div>
                
                {articles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-gray-200/80 hover:border-red-200/80 p-6 transition-all duration-300 cursor-pointer hover:scale-105"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(article.category)}`}>
                                {article.category}
                              </span>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(article.lastUpdated).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <h3 className="font-bold text-gray-900 text-lg mb-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {article.content}
                            </p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                                  +{article.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-gray-200/80 hover:border-red-200/80 p-12 text-center transition-all duration-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-gray-300/60">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No articles found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                      Try adjusting your search terms or browse different categories.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                      }}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Browse All Articles
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpCenterPage