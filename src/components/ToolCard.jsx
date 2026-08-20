'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import {
  getFavoriteToolIds,
  PREFERENCES_EVENT,
  toggleFavoriteTool,
} from '@/utils/toolPreferences'
import { getToolBadges } from '@/utils/toolDiscovery'
import ToolProcessingBadge from './ToolProcessingBadge'

const CATEGORY_STYLES = {
  organize: { icon: 'bg-red-500/10 text-red-500', label: 'Organize' },
  convert: { icon: 'bg-blue-500/10 text-blue-500', label: 'Convert' },
  security: { icon: 'bg-emerald-500/10 text-emerald-500', label: 'Secure' },
  create: { icon: 'bg-blue-500/10 text-blue-600', label: 'Create' },
  default: { icon: 'bg-slate-500/10 text-slate-500', label: 'PDF tool' },
}

export default function ToolCard({ tool }) {
  const styles = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.default
  const [isFavorite, setIsFavorite] = useState(false)
  const badges = getToolBadges(tool)

  useEffect(() => {
    const syncFavorite = () => setIsFavorite(getFavoriteToolIds().includes(tool.id))
    syncFavorite()
    window.addEventListener(PREFERENCES_EVENT, syncFavorite)
    window.addEventListener('storage', syncFavorite)

    return () => {
      window.removeEventListener(PREFERENCES_EVENT, syncFavorite)
      window.removeEventListener('storage', syncFavorite)
    }
  }, [tool.id])

  const toggleFavorite = () => {
    setIsFavorite(toggleFavoriteTool(tool.id).includes(tool.id))
  }

  return (
    <div className="group relative h-full">
      <Link href={tool.href || `/${tool.id}`} className="block h-full rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
        <article className="relative flex h-full min-h-44 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-xl group-hover:shadow-slate-900/10">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/0 blur-2xl transition group-hover:bg-primary/10" />
          <div className="relative mb-6 flex items-start justify-between">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}>
              <tool.icon strokeWidth={2} className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <ToolProcessingBadge tool={tool} compact />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </div>
          </div>

          <div className="relative mt-auto">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
              {styles.label}
            </p>
            <h3 className="text-base font-bold tracking-tight text-foreground">{tool.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{tool.description}</p>
            {badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {badges.map(badge => (
                  <span key={badge} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={isFavorite ? `Remove ${tool.title} from favorites` : `Add ${tool.title} to favorites`}
        aria-pressed={isFavorite}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border transition ${
          isFavorite
            ? 'border-amber-300 bg-amber-50 text-amber-500 shadow-sm'
            : 'border-border bg-card/90 text-muted-foreground opacity-0 hover:border-amber-300 hover:text-amber-500 group-hover:opacity-100 focus:opacity-100'
        }`}
      >
        <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}
