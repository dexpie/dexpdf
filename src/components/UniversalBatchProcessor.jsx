import { useState, useRef } from 'react'
import './UniversalBatchProcessor.css'

/**
 * Universal Batch Processor Component
 * Supports batch processing for ANY PDF tool
 * 
 * Usage:
 * <UniversalBatchProcessor
 *   toolName="Compress PDF"
 *   processFile={async (file, index) => { ... return resultBlob }}
 *   acceptedTypes=".pdf"
 *   outputExtension=".pdf"
 *   maxFiles={100}
 * />
 */

export default function UniversalBatchProcessor({
  toolName = 'Process',
  processFile, // async function(file, index) => Blob
  acceptedTypes = '.pdf',
  outputExtension = '.pdf',
  maxFiles = 100,
  showPreview = false,
  customOptions = null, // Component for tool-specific options
  onComplete = null
}) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState([])
  const [results, setResults] = useState([])
  const [globalProgress, setGlobalProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const pauseRef = useRef(false)

  // Add files
  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles)
    
    if (fileArray.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setFiles(prev => [...prev, ...fileArray])
    setProgress(prev => [...prev, ...fileArray.map(() => ({ 
      status: 'pending', 
      progress: 0,
      error: null 
    }))])
    setError('')
  }

  // Remove file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setProgress(prev => prev.filter((_, i) => i !== index))
    setResults(prev => prev.filter((_, i) => i !== index))
  }

  // Process all files
  const processAll = async () => {
    if (files.length === 0) {
      setError('Please add files first')
      return
    }

    setProcessing(true)
    setIsPaused(false)
    pauseRef.current = false
    const newResults = []

    for (let i = 0; i < files.length; i++) {
      // Check if paused
      while (pauseRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      try {
        // Update status to processing
        setProgress(prev => {
          const updated = [...prev]
          updated[i] = { status: 'processing', progress: 0, error: null }
          return updated
        })

        // Process file with progress callback
        const result = await processFile(files[i], i, (percent) => {
          setProgress(prev => {
            const updated = [...prev]
            updated[i] = { ...updated[i], progress: percent }
            return updated
          })
        })

        // Success
        newResults[i] = result
        setResults(newResults)
        setProgress(prev => {
          const updated = [...prev]
          updated[i] = { status: 'completed', progress: 100, error: null }
          return updated
        })

      } catch (err) {
        console.error(`Error processing file ${i}:`, err)
        setProgress(prev => {
          const updated = [...prev]
          updated[i] = { 
            status: 'error', 
            progress: 0, 
            error: err.message || 'Processing failed' 
          }
          return updated
        })
      }

      // Update global progress
      setGlobalProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setProcessing(false)
    
    if (onComplete) {
      onComplete(newResults.filter(Boolean))
    }
  }

  // Pause/Resume
  const togglePause = () => {
    setIsPaused(prev => !prev)
    pauseRef.current = !pauseRef.current
  }

  // Download single result
  const downloadSingle = (index) => {
    if (!results[index]) return
    
    const blob = results[index]
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = files[index].name.replace(/\.[^/.]+$/, '') + '_processed' + outputExtension
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Download all as ZIP
  const downloadAllAsZip = async () => {
    if (results.length === 0) return

    try {
      const JSZip = (await import('jszip')).default
      const { saveAs } = await import('file-saver')

      const zip = new JSZip()
      
      results.forEach((blob, index) => {
        if (blob) {
          const fileName = files[index].name.replace(/\.[^/.]+$/, '') + '_processed' + outputExtension
          zip.file(fileName, blob)
        }
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${toolName.toLowerCase().replace(/\s/g, '_')}_batch_${Date.now()}.zip`)
    } catch (err) {
      console.error('Error creating ZIP:', err)
      setError('Failed to create ZIP file')
    }
  }

  // Drag & drop handlers
  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const completedCount = progress.filter(p => p.status === 'completed').length
  const errorCount = progress.filter(p => p.status === 'error').length
  const pendingCount = progress.filter(p => p.status === 'pending').length

  return (
    <div className="batch-processor">
      <div className="batch-header">
        <h3>🔄 Batch {toolName}</h3>
        <p>Process up to {maxFiles} files at once</p>
      </div>

      {error && (
        <div className="batch-error">
          ⚠️ {error}
        </div>
      )}

      {/* Upload Zone */}
      <div 
        className="batch-upload-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          Drop files here or click to browse
        </div>
        <div className="upload-hint">
          Supports: {acceptedTypes} • Max {maxFiles} files
        </div>
      </div>

      {/* Custom Options (tool-specific) */}
      {customOptions && (
        <div className="batch-options">
          {customOptions}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="batch-files">
          <div className="batch-files-header">
            <h4>📋 Files ({files.length})</h4>
            {!processing && (
              <button 
                className="btn-clear"
                onClick={() => {
                  setFiles([])
                  setProgress([])
                  setResults([])
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="batch-files-list">
            {files.map((file, index) => (
              <div key={index} className="batch-file-item">
                <div className="file-info">
                  <div className="file-icon">
                    {progress[index]?.status === 'completed' ? '✅' :
                     progress[index]?.status === 'error' ? '❌' :
                     progress[index]?.status === 'processing' ? '⏳' : '📄'}
                  </div>
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {progress[index]?.status === 'processing' && (
                  <div className="file-progress">
                    <div 
                      className="file-progress-bar"
                      style={{ width: `${progress[index].progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {progress[index]?.status === 'error' && (
                  <div className="file-error">
                    {progress[index].error}
                  </div>
                )}

                {/* Actions */}
                <div className="file-actions">
                  {progress[index]?.status === 'completed' && (
                    <button
                      className="btn-download-small"
                      onClick={() => downloadSingle(index)}
                    >
                      💾
                    </button>
                  )}
                  {!processing && (
                    <button
                      className="btn-remove"
                      onClick={() => removeFile(index)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Progress */}
      {processing && (
        <div className="batch-global-progress">
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{completedCount}/{files.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Errors:</span>
              <span className="stat-value error">{errorCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pending:</span>
              <span className="stat-value">{pendingCount}</span>
            </div>
          </div>
          <div className="global-progress-bar">
            <div 
              className="global-progress-fill"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
          <div className="global-progress-text">
            {globalProgress}% complete
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="batch-actions">
        {!processing && files.length > 0 && (
          <button
            className="btn-primary-batch"
            onClick={processAll}
          >
            🚀 Process All ({files.length} files)
          </button>
        )}

        {processing && (
          <button
            className="btn-pause"
            onClick={togglePause}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
        )}

        {completedCount > 0 && !processing && (
          <>
            <button
              className="btn-download-all"
              onClick={downloadAllAsZip}
            >
              📦 Download All as ZIP ({completedCount} files)
            </button>
          </>
        )}
      </div>
    </div>
  )
}
