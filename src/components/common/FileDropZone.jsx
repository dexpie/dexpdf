import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FileDropZone({ onFiles, accept = 'application/pdf', multiple = false, disabled = false, hint }) {
    const { t } = useTranslation()
    const [isDragOver, setIsDragOver] = useState(false)
    const inputRef = useRef(null)

    const handleDragOver = (e) => {
        e.preventDefault()
        if (!disabled) setIsDragOver(true)
    }

    const handleDragLeave = () => setIsDragOver(false)

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (disabled) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            if (accept) {
                // Validate accept type roughly (optional, input handles it mostly)
            }
            onFiles(files)
        }
    }

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFiles(e.target.files)
        }
    }

    return (
        <div
            className={`file-drop-zone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
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
            <div className="drop-content">
                <div className="drop-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 24l10-10 10 10M24 14v20" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M40 34v4a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h3>{t('common.drop_title', 'Click or Drag files here')}</h3>
                <p>{hint || t('common.drop_hint', 'PDF files up to 50MB')}</p>
            </div>
        </div>
    )
}
