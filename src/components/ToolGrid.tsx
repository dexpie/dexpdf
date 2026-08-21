'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Clock3, Search, Star, X } from 'lucide-react'
import { TOOLS, CATEGORIES } from '../config/tools'
import ToolCard from './ToolCard'
import {
  getFavoriteToolIds,
  getMostUsedToolIds,
  getRecentToolIds,
  PREFERENCES_EVENT,
} from '@/utils/toolPreferences'
import {
  getIntentToolIds,
  getToolSearchText,
} from '@/utils/toolDiscovery'

const CATEGORY_COPY: Record<string, string> = {
  all: 'Everything you need for daily document work.',
  organize: 'Combine, clean up, and reshape PDF files.',
  convert: 'Move documents between the formats you use.',
  security: 'Sign, protect, and remove sensitive information.',
  create: 'Create polished documents and use AI helpers.',
}

export default function ToolGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showAll, setShowAll] = useState(false)
  const [shortcutIds, setShortcutIds] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  useEffect(() => {
    const syncShortcuts = () => {
      const favorites = getFavoriteToolIds()
      const ordered = [...favorites, ...getMostUsedToolIds(), ...getRecentToolIds()]
      setFavoriteIds(favorites)
      setShortcutIds(Array.from(new Set(ordered)).slice(0, 5))
    }

    syncShortcuts()
    window.addEventListener(PREFERENCES_EVENT, syncShortcuts)
    window.addEventListener('storage', syncShortcuts)
    return () => {
      window.removeEventListener(PREFERENCES_EVENT, syncShortcuts)
      window.removeEventListener('storage', syncShortcuts)
    }
  }, [])

  useEffect(() => {
    const applyExternalSearch = event => {
      setSearchQuery((window as any).__dexpdfHeroSearch || '')
      setActiveCategory('all')
      setShowAll(false)
    }

    window.addEventListener('dexpdf:tool-search', applyExternalSearch)
    return () => window.removeEventListener('dexpdf:tool-search', applyExternalSearch)
  }, [])

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const intentIds = new Set(query ? getIntentToolIds(query) : [])
    const scored = TOOLS
      .filter(tool => activeCategory === 'all' || tool.category === activeCategory)
      .map(tool => {
        const text = getToolSearchText(tool)
        let score = 0
        if (!query) score = 1
        if (query && text.includes(query)) score += 8
        if (query && tool.title.toLowerCase().includes(query)) score += 10
        if (intentIds.has(tool.id)) score += 20
        return { tool, score }
      })
      .filter(item => !query || item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.tool)
    return scored
  }, [activeCategory, searchQuery])

  const shouldLimit = activeCategory === 'all' && !searchQuery && !showAll
  const visibleTools = shouldLimit ? filteredTools.slice(0, 20) : filteredTools
  const shortcuts = shortcutIds
    .map(id => TOOLS.find(tool => tool.id === id))
    .filter(Boolean)

  return (
    <section id="tool-catalog" className="relative px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        {shortcuts.length > 1 && (
          <div className="glass mb-8 rounded-lg p-5 md:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="boundary-label flex items-center gap-2">
                  <Star className="h-3 w-3 fill-current text-primary" />
                  Your shortcuts
                </div>
                <p className="mt-2 font-serif text-sm text-muted-foreground">Favorite and frequently used tools, ready when you return.</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Saved only in this browser
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {shortcuts.map((tool: any) => (
                <Link
                  key={tool.id}
                  href={tool.href || `/${tool.id}`}
                  className="group flex items-center gap-3 rounded-md border border-[rgba(243,239,228,0.12)] bg-background p-3 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <tool.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{tool.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {favoriteIds.includes(tool.id) ? 'Favorite' : 'Recent'}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 text-center">
          <div className="boundary-label mb-3">Tool library</div>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            One workspace. Every PDF task.
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-serif text-base leading-7 text-muted-foreground">
            {CATEGORY_COPY[activeCategory]}
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            <span className="text-primary">{filteredTools.length}</span> tools available
          </p>
        </div>

        <div className="glass-strong sticky top-14 z-30 -mx-2 mb-8 rounded-lg p-2 md:top-16 md:mx-0 md:flex md:items-center md:gap-2">
          <div className="flex gap-1 overflow-x-auto pb-2 md:flex-1 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeCategory === cat.id
                    ? 'bg-[#F3EFE4] text-[#1B2027]'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative md:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="tool-search"
              type="search"
              placeholder="Try: gabung, kecilkan, qr, scan..."
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              className="w-full rounded-md border border-[rgba(243,239,228,0.16)] bg-background py-2.5 pl-10 pr-10 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
        </div>

        {shouldLimit && filteredTools.length > visibleTools.length && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
            >
              Show all {filteredTools.length} tools
              <ChevronDown className="h-4 w-4 text-primary" />
            </button>
          </div>
        )}

        {filteredTools.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No matching tools</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try another keyword or browse all tools.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
              className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Show all tools
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
