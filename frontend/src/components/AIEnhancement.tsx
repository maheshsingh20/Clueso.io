import { useState } from 'react'
import { useMutation } from 'react-query'
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Tag,
  Loader2,
  CheckCircle,
  Copy
} from 'lucide-react'
import { apiService } from '../services/api'
import { toast } from 'sonner'

interface AIEnhancementProps {
  text: string
  onEnhanced?: (enhancedText: string) => void
}

const AIEnhancement = ({ text, onEnhanced }: AIEnhancementProps) => {
  const [activeTab, setActiveTab] = useState<'enhance' | 'summarize' | 'tags'>('enhance')
  const [results, setResults] = useState<any>({})

  const enhanceMutation = useMutation(
    (text: string) => apiService.post('/ai/enhance-script', { text }),
    {
      onSuccess: (data) => {
        setResults({ ...results, enhance: (data as any).data })
        toast.success('Script enhanced successfully!')
      },
      onError: () => {
        toast.error('Failed to enhance script')
      }
    }
  )

  const summarizeMutation = useMutation(
    (text: string) => apiService.post('/ai/generate-summary', { text }),
    {
      onSuccess: (data) => {
        setResults({ ...results, summarize: (data as any).data })
        toast.success('Summary generated successfully!')
      },
      onError: () => {
        toast.error('Failed to generate summary')
      }
    }
  )

  const tagsMutation = useMutation(
    (data: { text: string; title?: string }) => apiService.post('/ai/generate-tags', data),
    {
      onSuccess: (data) => {
        setResults({ ...results, tags: (data as any).data })
        toast.success('Tags generated successfully!')
      },
      onError: () => {
        toast.error('Failed to generate tags')
      }
    }
  )

  const handleEnhance = () => {
    if (text.trim()) {
      enhanceMutation.mutate(text)
    }
  }

  const handleSummarize = () => {
    if (text.trim()) {
      summarizeMutation.mutate(text)
    }
  }

  const handleGenerateTags = () => {
    if (text.trim()) {
      tagsMutation.mutate({ text, title: 'Video Content' })
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const useEnhancement = () => {
    if (results.enhance?.enhancedText && onEnhanced) {
      onEnhanced(results.enhance.enhancedText)
      toast.success('Enhancement applied!')
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="card-title">AI Enhancement</h3>
        </div>
      </div>
      
      <div className="card-content">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('enhance')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'enhance'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wand2 className="w-4 h-4 inline mr-2" />
            Enhance Script
          </button>
          <button
            onClick={() => setActiveTab('summarize')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'summarize'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Summarize
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'tags'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Generate Tags
          </button>
        </div>

        {/* Content */}
        {activeTab === 'enhance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Improve grammar, remove filler words, and enhance clarity
              </p>
              <button
                onClick={handleEnhance}
                disabled={enhanceMutation.isLoading || !text.trim()}
                className="btn btn-primary btn-sm"
              >
                {enhanceMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Enhance
              </button>
            </div>

            {results.enhance && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-800">Enhanced Script</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(results.enhance.enhancedText)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {onEnhanced && (
                        <button
                          onClick={useEnhancement}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-green-700">{results.enhance.enhancedText}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Improvements Made:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.enhance.improvements?.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'summarize' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Generate a concise summary of your content
              </p>
              <button
                onClick={handleSummarize}
                disabled={summarizeMutation.isLoading || !text.trim()}
                className="btn btn-primary btn-sm"
              >
                {summarizeMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Summarize
              </button>
            </div>

            {results.summarize && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-800">Summary</h4>
                    <button
                      onClick={() => copyToClipboard(results.summarize.summary)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-blue-700">{results.summarize.summary}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Points:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.summarize.keyPoints?.map((point: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Generate relevant tags and categories for your content
              </p>
              <button
                onClick={handleGenerateTags}
                disabled={tagsMutation.isLoading || !text.trim()}
                className="btn btn-primary btn-sm"
              >
                {tagsMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Tag className="w-4 h-4 mr-2" />
                )}
                Generate
              </button>
            </div>

            {results.tags && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.tags?.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Categories:</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.categories?.map((category: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!text.trim() && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm">Add some text to enable AI enhancements</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIEnhancement