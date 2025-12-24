import { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter,
  Play,
  Star,
  Download,
  Eye,
  Clock,
  Monitor,
  Smartphone,
  Square,
  Crown,
  TrendingUp,
  Award,
  Grid3X3,
  List,
  X
} from 'lucide-react'
import { templatesService, Template, TemplateQuery } from '../services/templates'
import { toast } from 'sonner'

const TemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('')
  const [sortBy, setSortBy] = useState<TemplateQuery['sortBy']>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const navigate = useNavigate()

  const { data: templatesData, isLoading } = useQuery(
    ['templates', searchTerm, selectedCategory, selectedAspectRatio, sortBy],
    () => templatesService.getTemplates({
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      aspectRatio: selectedAspectRatio || undefined,
      sortBy,
      limit: 20
    }),
    { keepPreviousData: true }
  )

  const { data: featuredTemplates } = useQuery(
    'featured-templates',
    () => templatesService.getFeaturedTemplates()
  )

  // Fetch popular templates
  useQuery(
    'popular-templates', 
    () => templatesService.getPopularTemplates()
  )

  const useTemplateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => templatesService.useTemplate(id, data),
    {
      onSuccess: (result) => {
        toast.success('Template applied successfully!')
        toast.info(`Project "${result.projectName}" created`)
        // In a real app, navigate to the new project
        navigate('/projects')
      },
      onError: () => {
        toast.error('Failed to use template')
      }
    }
  )

  const handleUseTemplate = (template: Template) => {
    useTemplateMutation.mutate({
      id: template._id,
      data: {
        projectName: `${template.name} Project`,
        projectDescription: `Created from ${template.name} template`
      }
    })
  }

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                <Award className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-pink-700 bg-pink-50/60 px-3 py-1 rounded-full">Video Templates</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
              Professional <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Templates</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mb-6 leading-relaxed">
              Choose from our collection of professionally designed templates to create stunning videos in minutes.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-700">
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <Award className="w-4 h-4 text-pink-600" />
                <span>{templatesData?.pagination.total || 0} Templates</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-rose-200/20 to-pink-200/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        </div>
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Premium & Free</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Updated Weekly</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/30 to-red-200/30 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        {/* Featured Templates */}
        {featuredTemplates && featuredTemplates.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Templates</h2>
                <p className="text-gray-600">Hand-picked templates with the highest ratings</p>
              </div>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTemplates.slice(0, 3).map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onUse={handleUseTemplate}
                  onPreview={handlePreview}
                  featured
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates by name, category, or tags..."
                  className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent shadow-lg transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-3 border border-gray-200/50 rounded-2xl font-semibold transition-all duration-300 ${showFilters ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white/80 text-gray-700 hover:bg-red-50 hover:border-red-200'}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <div className="flex items-center space-x-2 bg-gray-100/80 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="input text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {templatesData?.categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                <select
                  className="input text-sm"
                  value={selectedAspectRatio}
                  onChange={(e) => setSelectedAspectRatio(e.target.value)}
                >
                  <option value="">All Ratios</option>
                  {templatesData?.filters.aspectRatios.map((ratio) => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  className="input text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as TemplateQuery['sortBy'])}
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Templates Grid/List */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : templatesData?.data.length ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {templatesData.data.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onUse={handleUseTemplate}
                onPreview={handlePreview}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100/90 to-pink-100/70 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Search className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No templates found</h3>
            <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed text-lg">
              Try adjusting your search terms or filters to find the perfect template.
            </p>
          </div>
        )}

        {/* Pagination */}
        {templatesData && templatesData.pagination.pages > 1 && (
          <div className="mt-12 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
            <div className="text-sm text-gray-600">
              Showing {((templatesData.pagination.page - 1) * templatesData.pagination.limit) + 1} to{' '}
              {Math.min(templatesData.pagination.page * templatesData.pagination.limit, templatesData.pagination.total)} of{' '}
              {templatesData.pagination.total} templates
            </div>
            <div className="flex space-x-3">
              <button
                disabled={templatesData.pagination.page === 1}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={templatesData.pagination.page === templatesData.pagination.pages}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setShowPreview(false)}
          onUse={handleUseTemplate}
        />
      )}
    </div>
  )
}

// Template Card Component
const TemplateCard = ({ 
  template, 
  onUse, 
  onPreview, 
  featured = false,
  viewMode = 'grid'
}: {
  template: Template
  onUse: (template: Template) => void
  onPreview: (template: Template) => void
  featured?: boolean
  viewMode?: 'grid' | 'list'
}) => {

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAspectRatioIcon = (ratio: string) => {
    switch (ratio) {
      case '16:9': return <Monitor className="w-4 h-4" />
      case '9:16': return <Smartphone className="w-4 h-4" />
      case '1:1': return <Square className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-6">
        <div className="relative w-32 h-24 flex-shrink-0">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover rounded-xl"
          />
          {template.isPremium && (
            <div className="absolute top-2 right-2">
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{template.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{template.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>{template.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(template.duration)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onPreview(template)}
                className="btn btn-outline btn-sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Preview
              </button>
              <button
                onClick={() => onUse(template)}
                className="btn btn-primary btn-sm"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ${featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}>
      {featured && (
        <div className="absolute top-3 left-3 z-10 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <Star className="w-3 h-3" />
          <span>Featured</span>
        </div>
      )}
      
      {/* Template Preview */}
      <div className="relative overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onPreview(template)}
            className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-primary btn-md"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </button>
        </div>
        
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {template.isPremium && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Crown className="w-3 h-3" />
              <span>Pro</span>
            </div>
          )}
          <span className="bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs">
            {template.category}
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <div className="bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            {getAspectRatioIcon(template.aspectRatio)}
            <span>{template.aspectRatio}</span>
          </div>
          <div className="bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(template.duration)}</span>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-4">
          {template.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
          {template.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{template.features.length - 3} more
            </span>
          )}
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{template.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{template.views > 1000 ? `${(template.views / 1000).toFixed(1)}k` : template.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{template.downloads > 1000 ? `${(template.downloads / 1000).toFixed(1)}k` : template.downloads}</span>
            </div>
          </div>
          <button
            onClick={() => onUse(template)}
            className="btn btn-primary btn-sm"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  )
}

// Template Preview Modal Component
const TemplatePreviewModal = ({ 
  template, 
  onClose, 
  onUse 
}: {
  template: Template
  onClose: () => void
  onUse: (template: Template) => void
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-gray-600">{template.category} • {template.aspectRatio}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div>
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full rounded-xl shadow-lg"
              />
              {template.previewVideo && (
                <div className="mt-4">
                  <video
                    src={template.previewVideo}
                    controls
                    className="w-full rounded-xl"
                  />
                </div>
              )}
            </div>
            
            {/* Details */}
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{template.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-medium">{Math.floor(template.duration / 60)}:{(template.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Resolution:</span>
                      <span className="ml-2 font-medium">{template.resolution}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Aspect Ratio:</span>
                      <span className="ml-2 font-medium">{template.aspectRatio}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <span className="ml-2 font-medium flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {template.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{template.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{template.downloads.toLocaleString()} downloads</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="btn btn-outline btn-md"
            >
              Close
            </button>
            <button
              onClick={() => {
                onUse(template)
                onClose()
              }}
              className="btn btn-primary btn-md"
            >
              {template.isPremium ? `Use Template - $${template.price}` : 'Use Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage