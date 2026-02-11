'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Shield, Zap, Download, Lock, CheckCircle } from 'lucide-react'

export default function ToolLayout({ title, description, children, features, steps, onClose }) {
    const { t } = useTranslation()

    // Default features if none provided
    const defaultFeatures = [
        { icon: Shield, label: '100% Secure', desc: 'Files processed locally in your browser' },
        { icon: Zap, label: 'Lightning Fast', desc: 'No upload — instant processing' },
        { icon: Lock, label: 'Private', desc: 'Your files never leave your device' },
    ]

    const toolFeatures = features || defaultFeatures

    // Default steps if none provided
    const defaultSteps = [
        { num: '1', label: 'Upload your file' },
        { num: '2', label: 'Adjust settings' },
        { num: '3', label: 'Download result' },
    ]

    const toolSteps = steps || defaultSteps

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors">
            {/* Tool Header Section - Premium Gradient */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white pt-10 pb-16 px-4 shadow-xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -bottom-8 left-0 right-0 h-16 bg-slate-50 dark:bg-slate-900 rounded-t-[2rem]" />

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{title}</h1>
                    {description && <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">{description}</p>}

                    {/* Step Indicators - Like iLovePDF */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        {toolSteps.map((step, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold flex items-center justify-center border border-white/30">
                                        {step.num}
                                    </span>
                                    <span className="text-sm text-slate-300 hidden sm:inline">{step.label}</span>
                                </div>
                                {i < toolSteps.length - 1 && (
                                    <div className="w-8 h-px bg-white/20" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breadcrumb / Back Navigation */}
            <div className="container mx-auto max-w-5xl px-4 py-4 -mt-2">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back', 'Back')}
                </Link>
            </div>

            {/* Main Tool Container */}
            <main className="container mx-auto max-w-5xl px-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20 border border-slate-200 dark:border-slate-700 p-6 md:p-10 min-h-[500px] transition-colors">
                    {children}
                </div>
            </main>

            {/* Trust & Feature Section Below Tool */}
            <section className="container mx-auto max-w-5xl px-4 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {toolFeatures.map((feat, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <feat.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{feat.label}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional trust bar */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Free to use</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No registration required</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Works offline</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No file size limits</span>
                </div>
            </section>
        </div>
    )
}
