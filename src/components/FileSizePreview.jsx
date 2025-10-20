import { useState, useEffect } from 'react'
import './FileSizePreview.css'

export default function FileSizePreview({
    originalSize,
    processedSize,
    isProcessing = false,
    fileName = 'output.pdf',
    onConfirm,
    onCancel
}) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (processedSize !== null && processedSize !== undefined) {
            setShow(true)
        }
    }, [processedSize])

    const formatSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
    }

    const calculateSavings = () => {
        if (!originalSize || !processedSize) return null
        const diff = originalSize - processedSize
        const percent = ((diff / originalSize) * 100).toFixed(1)
        return { diff, percent, isReduced: diff > 0 }
    }

    const savings = calculateSavings()

    if (!show || isProcessing) return null

    return (
        <div className="file-size-overlay" onClick={onCancel}>
            <div className="file-size-modal" onClick={e => e.stopPropagation()}>
                <div className="file-size-header">
                    <h3>📊 File Size Preview</h3>
                    <button
                        className="file-size-close"
                        onClick={onCancel}
                        aria-label="Close"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="file-size-body">
                    <div className="file-info">
                        <div className="file-icon">
                            📄
                        </div>
                        <div className="file-details">
                            <div className="file-name">{fileName}</div>
                            <div className="file-meta">Ready to download</div>
                        </div>
                    </div>

                    <div className="size-comparison">
                        <div className="size-row">
                            <div className="size-label">Original Size</div>
                            <div className="size-value original">{formatSize(originalSize)}</div>
                        </div>

                        <div className="size-arrow">
                            {savings?.isReduced ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 19V5M12 5l-7 7M12 5l7 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5v14M12 19l-7-7M12 19l7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>

                        <div className="size-row">
                            <div className="size-label">Output Size</div>
                            <div className={`size-value output ${savings?.isReduced ? 'reduced' : 'increased'}`}>
                                {formatSize(processedSize)}
                            </div>
                        </div>
                    </div>

                    {savings && (
                        <div className={`savings-banner ${savings.isReduced ? 'positive' : 'negative'}`}>
                            {savings.isReduced ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M16.667 5L7.5 14.167l-4.167-4.167" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>
                                        <strong>{Math.abs(savings.percent)}% smaller</strong> — Saved {formatSize(Math.abs(savings.diff))}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                                        <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <span>
                                        <strong>{Math.abs(savings.percent)}% larger</strong> — Added {formatSize(Math.abs(savings.diff))}
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="size-breakdown">
                        <div className="breakdown-item">
                            <div className="breakdown-icon">📦</div>
                            <div className="breakdown-text">
                                <div className="breakdown-label">Compression</div>
                                <div className="breakdown-value">
                                    {savings?.isReduced ? 'Optimized' : 'Enhanced Quality'}
                                </div>
                            </div>
                        </div>
                        <div className="breakdown-item">
                            <div className="breakdown-icon">⚡</div>
                            <div className="breakdown-text">
                                <div className="breakdown-label">Processing</div>
                                <div className="breakdown-value">Complete</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="file-size-footer">
                    <button
                        className="btn-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={onConfirm}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 11V3M8 11l3-3M8 11L5 8M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Download File
                    </button>
                </div>
            </div>
        </div>
    )
}
