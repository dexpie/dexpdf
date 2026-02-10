import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileText, Image, FileSpreadsheet, File } from 'lucide-react'

function getFileIcon(accept) {
    if (!accept) return File
    if (accept.includes('pdf')) return FileText
    if (accept.includes('image')) return Image
    if (accept.includes('spreadsheet') || accept.includes('excel') || accept.includes('.xlsx') || accept.includes('.csv')) return FileSpreadsheet
    return File
}

function getAcceptExtensions(accept) {
    if (!accept) return null
    const map = {
        'application/pdf': ['.pdf'],
        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
        '.pdf': ['.pdf'],
    }
    for (const [key, exts] of Object.entries(map)) {
        if (accept.includes(key)) return exts
    }
    return null
}

export default function FileDropZone({ onFiles, accept = 'application/pdf', multiple = false, disabled = false, hint, maxSizeMB = 50 }) {
    const { t } = useTranslation()
    const [isDragOver, setIsDragOver] = useState(false)
    const [validationError, setValidationError] = useState('')
    const inputRef = useRef(null)

    const FileIcon = getFileIcon(accept)
    const acceptExtensions = getAcceptExtensions(accept)

    const validateFiles = (files) => {
        setValidationError('')
        const validFiles = []

        for (const file of files) {
            // File size check
            if (file.size > maxSizeMB * 1024 * 1024) {
                setValidationError(`File "${file.name}" exceeds ${maxSizeMB}MB limit.`)
                return null
            }

            // Extension check
            if (acceptExtensions) {
                const ext = '.' + file.name.split('.').pop().toLowerCase()
                if (!acceptExtensions.includes(ext)) {
                    setValidationError(`"${file.name}" is not a supported file type. Expected: ${acceptExtensions.join(', ')}`)
                    return null
                }
            }

            validFiles.push(file)
        }
        return validFiles.length > 0 ? validFiles : null
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        if (!disabled) setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (disabled) return

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            const validated = validateFiles(files)
            if (validated) {
                onFiles(validated)
            }
        }
    }

    const handleChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const validated = validateFiles(files)
            if (validated) {
                onFiles(validated)
            }
        }
        // Reset input so same file can be re-selected
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="flex flex-col gap-3">
            <div
                className={`
                    relative rounded-2xl border-2 border-dashed p-12 md:p-16 text-center cursor-pointer
                    transition-all duration-300 ease-out group
                    ${isDragOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01] shadow-lg shadow-blue-500/10'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={inputRef}
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    disabled={disabled}
                    hidden
                />

                {/* Animated Icon */}
                <div className={`
                    mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${isDragOver
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 scale-110'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-105'
                    }
                `}>
                    <Upload className={`w-10 h-10 transition-transform duration-300 ${isDragOver ? '-translate-y-1' : 'group-hover:-translate-y-0.5'}`} />
                </div>

                <h3 className="text-slate-800 dark:text-slate-200 text-xl font-bold mb-2">
                    {isDragOver
                        ? t('common.drop_release', 'Release to upload')
                        : t('common.drop_title', 'Click or drag files here')
                    }
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {hint || t('common.drop_hint', `Supports ${acceptExtensions ? acceptExtensions.join(', ') : 'all files'} up to ${maxSizeMB}MB`)}
                </p>

                {/* File type badges */}
                {acceptExtensions && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {acceptExtensions.map(ext => (
                            <span key={ext} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs font-semibold uppercase">
                                {ext.replace('.', '')}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium flex items-center gap-2">
                    <span>⚠️</span> {validationError}
                </div>
            )}
        </div>
    )
}
