'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

export default function ToolLayout({ title, description, children, onClose }) {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors">
            {/* Tool Header Section - Premium Gradient */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white py-14 px-4 shadow-xl relative overflow-hidden">
                {/* Subtle decorative element */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{title}</h1>
                    {description && <p className="text-slate-300 text-lg max-w-2xl mx-auto">{description}</p>}
                </div>
            </div>

            {/* Breadcrumb / Back Navigation */}
            <div className="container mx-auto max-w-5xl px-4 py-5">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back', 'Back to all tools')}
                </Link>
            </div>

            {/* Main Tool Container */}
            <main className="container mx-auto max-w-5xl px-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20 border border-slate-200 dark:border-slate-700 p-6 md:p-8 min-h-[600px] transition-colors">
                    {children}
                </div>
            </main>
        </div>
    )
}
