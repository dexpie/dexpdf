'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Share2, Star } from 'lucide-react'
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
    { label: 'Privacy-aware', desc: 'Local tools keep files on your device' },
    { label: 'Fast workflow', desc: 'Clear controls with no unnecessary steps' },
    { label: 'No account needed', desc: 'Start the core workflow immediately' },
  ]

  const toolFeatures = features || defaultFeatures

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
      <header className="glass-subtle border-x-0 border-t-0 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              All tools
            </Link>

            <div className="flex items-center gap-1.5">
              {tool && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? 'Remove from saved tools' : 'Save tool'}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition ${isFavorite ? 'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={shareTool}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{shareStatus || 'Share'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
              {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
            </div>
            {tool && <ToolProcessingBadge tool={tool} />}
          </div>

          {tool && (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{getToolProcessingCopy(tool)}</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>Format: {getToolFormats(tool)}</span>
              <span aria-hidden="true">·</span>
              <span>{getToolMaxFileSize(tool)}</span>
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto -mt-px max-w-5xl px-4 pt-8 md:px-6">
        {children}
      </main>

      <section className="mx-auto mt-12 max-w-5xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-3">
          {toolFeatures.map((feature, index) => (
            <div key={feature.label || index} className="text-left">
              <h2 className="text-sm font-semibold text-foreground">{feature.label}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
