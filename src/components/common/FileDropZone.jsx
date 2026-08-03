import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileText, Image, FileSpreadsheet, File } from 'lucide-react'

/**
 * Get appropriate icon based on file type accept attribute
 * @param {string} accept - MIME type accept string
 * @returns {React.Component} Icon component
 */
function getFileIcon(accept) {
  if (!accept) return File
  if (accept.includes('pdf')) return FileText
  if (accept.includes('image')) return Image
  if (accept.includes('spreadsheet') || accept.includes('excel') || accept.includes('.xlsx') || accept.includes('.csv')) return FileSpreadsheet
  return File
}

/**
 * Extract file extensions from accept attribute
 * @param {string} accept - MIME type accept string
 * @returns {string[]|null} Array of extensions or null
 */
function getAcceptExtensions(accept) {
  if (!accept) return null

  const parts = accept.split(',').map(s => s.trim().toLowerCase())
  let exts = []
  const mimeExtensions = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/csv': ['.csv'],
    'text/html': ['.html', '.htm'],
    'application/json': ['.json'],
    'text/markdown': ['.md'],
    'text/plain': ['.txt'],
    'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
    'video/*': ['.mp4', '.webm', '.mov'],
  }

  parts.forEach(part => {
    if (part === 'application/pdf') exts.push('.pdf')
    else if (part === 'image/*') exts.push('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg')
    else if (part.startsWith('.')) exts.push(part)
    else if (mimeExtensions[part]) exts.push(...mimeExtensions[part])
  })

  return exts.length > 0 ? [...new Set(exts)] : null
}

/**
 * FileDropZone - Drag and drop file upload component
 * Provides visual feedback for file drag/drop and validates file types/sizes
 * @param {Object} props
 * @param {Function} props.onFiles - Callback when files are selected
 * @param {string} props.accept - Accepted MIME types (default: application/pdf)
 * @param {boolean} props.multiple - Allow multiple files (default: false)
 * @param {boolean} props.disabled - Disable the dropzone
 * @param {string} props.hint - Helper text to display
 * @param {number} props.maxSizeMB - Max file size in MB (default: 50)
 */
export default function FileDropZone({
  onFiles,
  onChange,
  accept = 'application/pdf',
  multiple = false,
  disabled = false,
  hint,
  maxSizeMB = 50,
  title,
  subtitle,
  icon
}) {
  const { t } = useTranslation()
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState('')
  const inputRef = useRef(null)

  const FileIcon = getFileIcon(accept)
  const acceptExtensions = getAcceptExtensions(accept)
  const notifyFiles = (validFiles) => {
    const callback = onFiles || onChange
    if (typeof callback === 'function') callback(validFiles)
  }

  /**
   * Validate files against size and type requirements
   * @param {FileList} files - Files to validate
   * @returns {File[]|null} Valid files or null if invalid
   */
  const validateFiles = (files) => {
    setValidationError('')
    const validFiles = []
    const seen = new Set()

    for (const file of Array.from(files || [])) {
      const identity = `${file.name}:${file.size}:${file.lastModified}`
      if (seen.has(identity)) continue
      seen.add(identity)

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setValidationError(`File "${file.name}" exceeds ${maxSizeMB}MB limit.`)
        return null
      }

      // Check file extension
      if (acceptExtensions) {
        const ext = '.' + file.name.split('.').pop().toLowerCase()
        if (!acceptExtensions.includes(ext)) {
          setValidationError(`"${file.name}" is not a supported file type. Expected: ${acceptExtensions.join(', ')}`)
          return null
        }
      }

      validFiles.push(file)
    }
    if (validFiles.length === 0) {
      setValidationError('Please choose at least one supported file.')
      return null
    }
    return multiple ? validFiles : [validFiles[0]]
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    const validFiles = validateFiles(files)
    if (validFiles) {
      notifyFiles(validFiles)
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    const validFiles = validateFiles(files)
    if (validFiles) {
      notifyFiles(validFiles)
    }
    e.target.value = ''
  }

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={title || 'Choose a file'}
        onClick={handleClick}
        onKeyDown={event => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            handleClick()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer
          border-2 border-dashed rounded-xl p-8
          transition-all duration-200
          flex flex-col items-center justify-center
          gap-4 text-center
          ${disabled
            ? 'border-border bg-muted/30 cursor-not-allowed opacity-60'
            : isDragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center
          transition-colors duration-200
          ${isDragOver ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}
        `}>
          {icon || <Upload className="w-7 h-7" />}
        </div>

        <div>
          <p className="text-foreground font-medium mb-1">
            {isDragOver ? 'Drop files here' : title || 'Drag & drop your file here'}
          </p>
          <p className="text-muted-foreground text-sm">
            {subtitle || <>or <span className="text-primary font-medium hover:underline">browse</span> to choose</>}
          </p>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <FileIcon className="w-4 h-4" />
          <span className="text-xs">
            {acceptExtensions ? acceptExtensions.join(', ').toUpperCase() : 'All files'}
            {maxSizeMB && ` (max ${maxSizeMB}MB)`}
          </span>
        </div>
      </div>

      {hint && !validationError && (
        <p className="text-xs text-muted-foreground mt-2 text-center">{hint}</p>
      )}

      {validationError && (
        <p className="text-xs text-destructive mt-2 text-center bg-destructive/10 p-2 rounded-lg">
          {validationError}
        </p>
      )}
    </div>
  )
}
