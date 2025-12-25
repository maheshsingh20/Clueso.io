import React, { useState } from 'react'
import { 
  Monitor, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Upload,
  X,
  CheckCircle,
  Loader,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { useScreenRecording } from '../contexts/ScreenRecordingContext'
import { toast } from 'sonner'

const ScreenRecordingIndicator: React.FC = () => {
  const {
    recordingState,
    recordedBlob,
    isUploading,
    uploadProgress,
    stopRecording,
    togglePause,
    downloadRecording,
    uploadRecording,
    discardRecording,
    formatDuration
  } = useScreenRecording()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showUploadOptions, setShowUploadOptions] = useState(false)

  // Don't show indicator if not recording and no recorded blob
  if (recordingState.isRecording === false && !recordedBlob) {
    return null
  }

  const handleUpload = async (projectId?: string) => {
    try {
      await uploadRecording(projectId)
      setShowUploadOptions(false)
    } catch (error) {
      // Error is already handled in the context
    }
  }

  return (
    <>
      {/* Fixed indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`bg-white rounded-lg shadow-2xl border-2 transition-all duration-300 ${
          recordingState.isRecording === 'recording' 
            ? recordingState.isPaused 
              ? 'border-yellow-400' 
              : 'border-red-400'
            : recordedBlob 
              ? 'border-green-400'
              : 'border-gray-300'
        }`}>
          
          {/* Compact view */}
          {!isExpanded && (
            <div className="p-3 flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  recordingState.isRecording === 'recording' 
                    ? recordingState.isPaused 
                      ? 'bg-yellow-500 animate-pulse' 
                      : 'bg-red-500 animate-pulse'
                    : recordedBlob
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`} />
                <Monitor className="w-4 h-4 text-gray-600" />
              </div>
              
              <div className="text-sm font-mono font-bold text-gray-900">
                {formatDuration(recordingState.duration)}
              </div>

              {recordingState.isRecording === 'recording' && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={togglePause}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={recordingState.isPaused ? 'Resume' : 'Pause'}
                  >
                    {recordingState.isPaused ? (
                      <Play className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Pause className="w-4 h-4 text-yellow-600" />
                    )}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Stop Recording"
                  >
                    <Square className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsExpanded(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Expand"
              >
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Expanded view */}
          {isExpanded && (
            <div className="p-4 w-80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Screen Recording</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      recordingState.isRecording === 'recording' 
                        ? recordingState.isPaused 
                          ? 'bg-yellow-500 animate-pulse' 
                          : 'bg-red-500 animate-pulse'
                        : recordedBlob
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                    }`} />
                    <span className="text-sm font-semibold text-gray-900">
                      {recordingState.isRecording === 'starting' && 'Starting...'}
                      {recordingState.isRecording === 'recording' && (recordingState.isPaused ? 'Paused' : 'Recording')}
                      {recordingState.isRecording === 'stopping' && 'Stopping...'}
                      {recordingState.isRecording === false && recordedBlob && 'Complete'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-gray-900">
                    {formatDuration(recordingState.duration)}
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              {recordingState.isRecording === 'recording' && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <button
                    onClick={togglePause}
                    className="flex items-center space-x-1 px-3 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                  >
                    {recordingState.isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                </div>
              )}

              {/* Recording Complete Actions */}
              {recordedBlob && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Recording Complete!</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Size: {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-semibold text-blue-800">Uploading...</span>
                        <span className="text-xs text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={downloadRecording}
                      disabled={isUploading}
                      className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={() => setShowUploadOptions(!showUploadOptions)}
                      disabled={isUploading}
                      className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm flex-1"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                  </div>

                  {/* Upload Options */}
                  {showUploadOptions && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <button
                        onClick={() => handleUpload()}
                        disabled={isUploading}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded transition-colors disabled:opacity-50"
                      >
                        Upload without project
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Project selection coming soon! For now, uploading without project.')
                          handleUpload()
                        }}
                        disabled={isUploading}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded transition-colors disabled:opacity-50"
                      >
                        Choose project...
                      </button>
                    </div>
                  )}

                  <button
                    onClick={discardRecording}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-red-600 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Discard Recording</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ScreenRecordingIndicator