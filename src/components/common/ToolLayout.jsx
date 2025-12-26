'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function ToolLayout({ title, description, children, onClose }) {
    const { t } = useTranslation()

    return (
        <div className="tool-layout fade-in">
            <div className="tool-header-wrapper">
                <div className="tool-header-content">
                    {/* Updated Link prop for Next.js: href instead of to */}
                    <Link href="/" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 10H5M10 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t('common.back', 'Back')}
                    </Link>
                    <div className="tool-title-group">
                        <h1 className="text-xl font-bold">{title}</h1>
                        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
                    </div>

                    {/* Optional close button, but back link is usually enough. keeping for compatibility */}
                    {onClose && (
                        <button onClick={onClose} className="close-btn" aria-label="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="tool-body">
                {/* Wrap children in a premium card-like container if not already */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
