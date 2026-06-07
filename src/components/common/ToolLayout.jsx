'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Lock, Shield, Zap } from 'lucide-react'

export default function ToolLayout({ title, description, children, features, steps }) {
  const { t } = useTranslation()

  const defaultFeatures = [
    { icon: Shield, label: 'Secure workflow', desc: 'Clear processing status and validation' },
    { icon: Zap, label: 'Fast processing', desc: 'Optimized for modern browsers' },
    { icon: Lock, label: 'Privacy aware', desc: 'Local tools keep files on your device' },
  ]

  const defaultSteps = [
    { num: '1', label: 'Choose your file' },
    { num: '2', label: 'Adjust settings' },
    { num: '3', label: 'Download result' },
  ]

  const toolFeatures = features || defaultFeatures
  const toolSteps = steps || defaultSteps

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="relative border-b border-border bg-card px-4 pb-10 pt-8">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="mb-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">{title}</h1>
          {description && <p className="mx-auto max-w-2xl text-base text-muted-foreground">{description}</p>}

          <div className="mt-6 flex items-center justify-center gap-3">
            {toolSteps.map((step, index) => (
              <React.Fragment key={step.num || index}>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {step.num}
                  </span>
                  <span className="hidden text-sm font-medium text-muted-foreground sm:inline">{step.label}</span>
                </div>
                {index < toolSteps.length - 1 && <div className="h-px w-10 bg-border" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back', 'Back')}
        </Link>
      </div>

      <main className="container mx-auto max-w-5xl px-4">
        <div className="min-h-[400px] rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">{children}</div>
      </main>

      <section className="container mx-auto mt-10 max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {toolFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{feature.label}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
