'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Shield, Zap, Lock, CheckCircle } from 'lucide-react'

/**
 * ToolLayout - Standard layout wrapper for all tool pages
 * Provides consistent header, steps indicator, and trust sections
 * @param {Object} props
 * @param {string} props.title - Tool title
 * @param {string} props.description - Tool description
 * @param {React.ReactNode} props.children - Main content
 * @param {Array} props.features - Custom features array
 * @param {Array} props.steps - Custom steps array
 * @param {Function} props.onClose - Optional close handler
 */
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
    <div className="min-h-screen bg-background pb-20">

      {/* Tool Header */}
      <div className="bg-card border-b border-border pt-8 pb-10 px-4 relative">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              {description}
            </p>
          )}

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {toolSteps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                    {step.num}
                  </span>
                  <span className="text-sm text-muted-foreground hidden sm:inline font-medium">
                    {step.label}
                  </span>
                </div>
                {i < toolSteps.length - 1 && (
                  <div className="w-10 h-px bg-border" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Back Navigation */}
      <div className="container mx-auto max-w-5xl px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary font-medium transition-colors text-sm hover:bg-secondary px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back', 'Back')}
        </Link>
      </div>

      {/* Main Tool Container */}
      <main className="container mx-auto max-w-5xl px-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-10 min-h-[400px]">
          {children}
        </div>
      </main>

      {/* Trust Section */}
      <section className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toolFeatures.map((feat, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">{feat.label}</h4>
                <p className="text-muted-foreground text-xs mt-0.5">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}