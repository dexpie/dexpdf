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
            if (file.size > maxSizeMB * 1024 * 1024) {
                setValidationError(`File "${file.name}" exceeds ${maxSizeMB}MB limit.`)
                return null
            }

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
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="flex flex-col gap-3">
            <div
                className={`
                    relative rounded-2xl border-2 border-dashed p-12 md:p-16 text-center cursor-pointer
                    transition-all duration-200 group
                    ${isDragOver
                        ? 'border-red-400 bg-red-50 scale-[1.01] shadow-lg shadow-red-500/10'
                        : 'border-slate-300 bg-white hover:border-red-300 hover:bg-red-50/30'
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

                {/* Icon */}
                <div className={`
                    mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200
                    ${isDragOver
                        ? 'bg-red-100 text-red-500 scale-110'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-red-100 group-hover:text-red-500'
                    }
                `}>
                    <Upload className={`w-8 h-8 transition-transform duration-200 ${isDragOver ? '-translate-y-1' : 'group-hover:-translate-y-0.5'}`} />
                </div>

                <h3 className="text-slate-800 text-lg font-bold mb-1">
                    {isDragOver
                        ? t('common.drop_release', 'Release to upload')
                        : t('common.drop_title', 'Select PDF files')
                    }
                </h3>
                <p className="text-slate-400 text-sm">
                    {hint || t('common.drop_hint', 'or drag and drop them here')}
                </p>

                {/* File type badges */}
                {acceptExtensions && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {acceptExtensions.map(ext => (
                            <span key={ext} className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold uppercase">
                                {ext.replace('.', '')}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2">
                    <span>⚠️</span> {validationError}
                </div>
            )}
        </div>
    )
}
