import { useState } from 'react'
import { 
  X, 
  Download, 
  Share2, 
  Link, 
  Mail, 
  MessageCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  videoTitle: string
  videoId: string
}

const ExportModal = ({ isOpen, onClose, videoId }: ExportModalProps) => {
  const [activeTab, setActiveTab] = useState('export')
  const [exportFormat, setExportFormat] = useState('mp4')
  const [exportQuality, setExportQuality] = useState('1080p')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [includeVoiceover, setIncludeVoiceover] = useState(true)
  const [includeCaptions, setIncludeCaptions] = useState(true)
  const [includeEffects, setIncludeEffects] = useState(true)
  const [includeWatermark, setIncludeWatermark] = useState(false)
  const [privacySetting, setPrivacySetting] = useState('public')

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)
          toast.success('Video exported successfully!')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement('a')
    link.href = '#' // In real app, this would be the actual video URL
    link.download = `video-${videoId}-${exportQuality}.${exportFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started!')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Check out this AI-enhanced video')
    const body = encodeURIComponent(`I've created an amazing video using Gemini AI. Check it out: ${shareUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
    toast.success('Email client opened!')
  }

  const handleSlackShare = () => {
    // In a real app, this would integrate with Slack API
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied! Paste it in Slack.')
  }

  const handleTeamsShare = () => {
    // In a real app, this would integrate with Microsoft Teams
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied! Paste it in Teams.')
  }

  const handleEmbedCode = () => {
    const embedCode = `<iframe src="${shareUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied to clipboard!')
  }

  const shareUrl = `${window.location.origin}/videos/${videoId}/view`

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Export & Share Video
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'export'
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'share'
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Share
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Export Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Export Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format
                    </label>
                    <select 
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="input"
                    >
                      <option value="mp4">MP4 (Recommended)</option>
                      <option value="webm">WebM</option>
                      <option value="mov">MOV</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <select 
                      value={exportQuality}
                      onChange={(e) => setExportQuality(e.target.value)}
                      className="input"
                    >
                      <option value="4k">4K (3840x2160)</option>
                      <option value="1080p">1080p (1920x1080)</option>
                      <option value="720p">720p (1280x720)</option>
                      <option value="480p">480p (854x480)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Include</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={includeVoiceover}
                      onChange={(e) => setIncludeVoiceover(e.target.checked)}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">AI-Enhanced Voiceover</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={includeCaptions}
                      onChange={(e) => setIncludeCaptions(e.target.checked)}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto-Generated Captions</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={includeEffects}
                      onChange={(e) => setIncludeEffects(e.target.checked)}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Smart Zoom Effects</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={includeWatermark}
                      onChange={(e) => setIncludeWatermark(e.target.checked)}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Watermark</span>
                  </label>
                </div>
              </div>

              {/* Export Progress */}
              {isExporting && (
                <div className="bg-gradient-to-r from-cyan-50 to-pink-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Exporting Video...</span>
                    <span className="text-sm text-gray-600">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    🤖 Gemini AI is rendering your enhanced video
                  </div>
                </div>
              )}

              {/* Export Complete */}
              {exportProgress === 100 && !isExporting && (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h4 className="text-lg font-medium text-green-900 mb-2">Export Complete!</h4>
                  <p className="text-sm text-green-700 mb-4">Your Gemini AI-enhanced video is ready for download.</p>
                  <button 
                    onClick={handleDownload}
                    className="btn btn-success btn-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </button>
                </div>
              )}

              {/* Export Button */}
              {!isExporting && exportProgress === 0 && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="btn btn-outline btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExport}
                    className="btn btn-primary btn-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Video
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Share Link */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Share Link</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="input flex-1"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-outline btn-md"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Anyone with this link can view your video
                </p>
              </div>

              {/* Share Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Share Via</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleEmailShare}
                    className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </button>
                  <button 
                    onClick={handleSlackShare}
                    className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Slack</span>
                  </button>
                  <button 
                    onClick={handleTeamsShare}
                    className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Teams</span>
                  </button>
                  <button 
                    onClick={handleEmbedCode}
                    className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Link className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Embed</span>
                  </button>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Privacy Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="public"
                      checked={privacySetting === 'public'}
                      onChange={(e) => setPrivacySetting(e.target.value)}
                      className="text-cyan-600 focus:ring-cyan-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Public - Anyone can view</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="private"
                      checked={privacySetting === 'private'}
                      onChange={(e) => setPrivacySetting(e.target.value)}
                      className="text-cyan-600 focus:ring-cyan-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Private - Only you can view</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="team"
                      checked={privacySetting === 'team'}
                      onChange={(e) => setPrivacySetting(e.target.value)}
                      className="text-cyan-600 focus:ring-cyan-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Team - Only team members can view</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExportModal