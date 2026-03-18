'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Shield, Zap, Lock, CheckCircle } from 'lucide-react'

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
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Tool Header - Clean White */}
            <div className="bg-white border-b border-slate-200 pt-8 pb-12 px-4 relative">
                <div className="container mx-auto max-w-5xl text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 tracking-tight">{title}</h1>
                    {description && <p className="text-slate-500 text-base max-w-xl mx-auto">{description}</p>}

                    {/* Step Indicators */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        {toolSteps.map((step, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                                        {step.num}
                                    </span>
                                    <span className="text-sm text-slate-500 hidden sm:inline">{step.label}</span>
                                </div>
                                {i < toolSteps.length - 1 && (
                                    <div className="w-8 h-px bg-slate-300" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Back Navigation */}
            <div className="container mx-auto max-w-5xl px-4 py-3">
                <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 font-medium transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back', 'Back')}
                </Link>
            </div>

            {/* Main Tool Container */}
            <main className="container mx-auto max-w-5xl px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 min-h-[400px]">
                    {children}
                </div>
            </main>

            {/* Trust Section */}
            <section className="container mx-auto max-w-5xl px-4 mt-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {toolFeatures.map((feat, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100">
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                <feat.icon className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 text-sm">{feat.label}</h4>
                                <p className="text-slate-400 text-xs mt-0.5">{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Free to use</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No registration</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Works offline</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No file limits</span>
                </div>
            </section>
        </div>
    )
}
