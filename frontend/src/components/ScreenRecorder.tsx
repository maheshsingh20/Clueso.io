import React from 'react'
import { 
  Monitor, 
  X,
  Mic,
  MicOff,
  Settings,
  AlertCircle,
  Play
} from 'lucide-react'
import { useScreenRecording } from '../contexts/ScreenRecordingContext'

interface ScreenRecorderProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string
  onSuccess?: (videoId: string) => void
}

const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  isOpen,
  onClose
}) => {
  const {
    recordingState,
    recordingSettings,
    startRecording,
    updateSettings
  } = useScreenRecording()

  // Check browser support
  const isSupported = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
  // Check for HTTPS (required for screen recording)
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost'

  const handleStartRecording = async () => {
    try {
      await startRecording()
      onClose() // Close modal after starting recording
    } catch (error) {
      // Error handling is done in the context
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-md flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Screen Recorder</h2>
              <p className="text-sm text-gray-600">Record your screen with audio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!isSupported ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Supported</h3>
              <p className="text-gray-600">
                Screen recording is not supported in this browser. Please use Chrome, Firefox, or Edge.
              </p>
            </div>
          ) : !isSecure ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">HTTPS Required</h3>
              <p className="text-gray-600">
                Screen recording requires a secure connection (HTTPS). Please access the site via HTTPS.
              </p>
            </div>
          ) : (
            <>
              {/* Recording Settings */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Recording Settings</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={recordingSettings.includeAudio}
                        onChange={(e) => updateSettings({ includeAudio: e.target.checked })}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Include audio</span>
                    </label>
                    {recordingSettings.includeAudio ? (
                      <Mic className="w-4 h-4 text-green-500" />
                    ) : (
                      <MicOff className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {recordingSettings.includeAudio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audio Source
                      </label>
                      <select
                        value={recordingSettings.audioSource}
                        onChange={(e) => updateSettings({ 
                          audioSource: e.target.value as 'system' | 'microphone' | 'both' 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="system">System audio only</option>
                        <option value="microphone">Microphone only</option>
                        <option value="both">System + Microphone</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recording Quality
                    </label>
                    <select
                      value={recordingSettings.quality}
                      onChange={(e) => updateSettings({ 
                        quality: e.target.value as 'low' | 'medium' | 'high' 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="low">Low (15 FPS)</option>
                      <option value="medium">Medium (24 FPS)</option>
                      <option value="high">High (30 FPS)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Start Recording Button */}
              <div className="flex items-center justify-center mb-6">
                <button
                  onClick={handleStartRecording}
                  disabled={recordingState.isRecording !== false}
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  <span>
                    {recordingState.isRecording === 'starting' ? 'Starting...' : 'Start Recording'}
                  </span>
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click "Start Recording" and choose what to share</li>
                  <li>• Recording continues even if you navigate to other pages</li>
                  <li>• Use the floating indicator to control recording</li>
                  <li>• Download or upload your recording when finished</li>
                </ul>
              </div>

              {/* Tips */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Pro Tips:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Choose specific windows for focused recordings</li>
                  <li>• Enable system audio to capture application sounds</li>
                  <li>• Use microphone for narration and explanations</li>
                  <li>• Higher quality settings create larger file sizes</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScreenRecorder