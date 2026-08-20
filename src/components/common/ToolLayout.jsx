'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Lock, Share2, Shield, Star, Zap } from 'lucide-react'
import { TOOLS } from '@/config/tools'
import ToolProcessingBadge from '@/components/ToolProcessingBadge'
import { getToolFormats, getToolMaxFileSize, getToolProcessingCopy } from '@/config/toolMetadata'
import {
  getFavoriteToolIds,
  PREFERENCES_EVENT,
  toggleFavoriteTool,
} from '@/utils/toolPreferences'

export default function ToolLayout({ title, description, children, features, steps }) {
  const pathname = usePathname()
  const [isFavorite, setIsFavorite] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

  const toolId = useMemo(() => pathname?.split('/').filter(Boolean)[0] || '', [pathname])
  const tool = useMemo(() => TOOLS.find(item => item.id === toolId), [toolId])

  useEffect(() => {
    if (!toolId) return undefined
    const syncFavorite = () => setIsFavorite(getFavoriteToolIds().includes(toolId))
    syncFavorite()
    window.addEventListener(PREFERENCES_EVENT, syncFavorite)
    window.addEventListener('storage', syncFavorite)
    return () => {
      window.removeEventListener(PREFERENCES_EVENT, syncFavorite)
      window.removeEventListener('storage', syncFavorite)
    }
  }, [toolId])

  const defaultFeatures = [
    { icon: Shield, label: 'Privacy-aware', desc: 'Local tools keep files on your device' },
    { icon: Zap, label: 'Fast workflow', desc: 'Clear controls with no unnecessary steps' },
    { icon: Lock, label: 'No account needed', desc: 'Start the core workflow immediately' },
  ]

  const defaultSteps = [
    { num: '1', label: 'Choose input' },
    { num: '2', label: 'Adjust settings' },
    { num: '3', label: 'Download result' },
  ]

  const toolFeatures = features || defaultFeatures
  const toolSteps = steps || defaultSteps

  const toggleFavorite = () => {
    if (!toolId) return
    setIsFavorite(toggleFavoriteTool(toolId).includes(toolId))
  }

  const shareTool = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} - DexPDF`, text: description, url })
        setShareStatus('Shared')
      } else {
        await navigator.clipboard.writeText(url)
        setShareStatus('Link copied')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareStatus('Could not share')
    }
    window.setTimeout(() => setShareStatus(''), 1800)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-16">
      <header className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-b from-blue-50/90 via-background to-background px-4 pb-16 pt-5 dark:border-blue-500/15 dark:from-blue-950/25 md:px-6 md:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_52%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground transition hover:bg-card hover:text-foreground hover:shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              All tools
            </Link>

            <div className="flex items-center gap-2">
              {tool && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-pressed={isFavorite}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-bold transition ${isFavorite ? 'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'border-border bg-card text-muted-foreground hover:border-amber-300 hover:text-amber-600'}`}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save tool'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={shareTool}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-bold text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{shareStatus || 'Share'}</span>
              </button>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-card/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 shadow-sm backdrop-blur dark:border-blue-500/20 dark:text-blue-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              DexPDF workspace
            </div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground md:text-5xl">{title}</h1>
            {description && <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>}

            {tool && (
              <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-border bg-card/80 p-4 text-left shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <ToolProcessingBadge tool={tool} />
                  <span className="text-xs font-bold text-muted-foreground">{getToolMaxFileSize(tool)}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{getToolProcessingCopy(tool)}</p>
                <p className="mt-2 text-xs font-semibold text-foreground">Format: {getToolFormats(tool)}</p>
              </div>
            )}

            <ol className="mx-auto mt-7 grid max-w-2xl grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm backdrop-blur">
              {toolSteps.map((step, index) => (
                <li key={step.num || index} className={`flex min-h-16 items-center justify-center gap-2 px-2 py-3 text-center ${index > 0 ? 'border-l border-border' : ''}`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">{step.num}</span>
                  <span className="hidden text-xs font-bold text-muted-foreground sm:inline">{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 md:-mt-10 md:px-6">
        <div className="min-h-[420px] rounded-[1.75rem] border border-border bg-card p-4 shadow-xl shadow-slate-900/[0.06] md:p-8">
          {children}
        </div>
      </main>

      <section className="mx-auto mt-8 max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {toolFeatures.map((feature, index) => (
            <div key={feature.label || index} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-foreground">{feature.label}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
