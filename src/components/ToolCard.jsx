'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import {
  getFavoriteToolIds,
  PREFERENCES_EVENT,
  toggleFavoriteTool,
} from '@/utils/toolPreferences'
import { getToolProcessing } from '@/config/toolMetadata'

const STATUS_STYLES = {
  local: { label: 'Local', className: 'text-[#1E7A52] border-[#35D68E]' },
  mixed: { label: 'Cloud opt-in', className: 'text-[#8A6210] border-[#E0A339]' },
  server: { label: 'BYOK AI', className: 'text-[#3D5A85] border-[#6B8CBE]' },
}

export default function ToolCard({ tool }) {
  const processing = getToolProcessing(tool)
  const status = STATUS_STYLES[processing] || STATUS_STYLES.local
  const [isFavorite, setIsFavorite] = useState(false)

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
      <Link href={tool.href || `/${tool.id}`} className="block h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <article className="paper-card flex h-full min-h-40 flex-col p-5 group-hover:-translate-y-0.5">
          <div className="mb-5 flex items-start justify-between gap-2">
            <tool.icon strokeWidth={1.75} className="h-5 w-5 text-[#1B2027]/70" />
            <span
              className={`rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <div className="mt-auto">
            <h3 className="text-base font-semibold tracking-tight text-[#1B2027]">{tool.title}</h3>
            <p className="mt-1.5 line-clamp-2 font-serif text-sm leading-5 text-[#1B2027]/65">{tool.description}</p>
          </div>
        </article>
      </Link>
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={isFavorite ? `Remove ${tool.title} from favorites` : `Add ${tool.title} to favorites`}
        aria-pressed={isFavorite}
        className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isFavorite
            ? 'bg-[#1B2027]/10 text-[#8A6210] opacity-100'
            : 'text-[#1B2027]/40 opacity-0 hover:text-[#8A6210] group-hover:opacity-100 focus:opacity-100'
        }`}
      >
        <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}
