'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Clock3, Search, SlidersHorizontal, Star, X } from 'lucide-react'
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
          <div className="mb-8 rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Your shortcuts
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Favorite and frequently used tools, ready when you return.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Saved only in this browser
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {shortcuts.map((tool: any) => (
                <Link
                  key={tool.id}
                  href={tool.href || `/${tool.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <tool.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{tool.title}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {favoriteIds.includes(tool.id) ? 'Favorite' : 'Used recently'}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <SlidersHorizontal className="h-4 w-4" />
              Tool library
            </div>
            <h2 className="text-3xl font-black tracking-[-0.035em] text-foreground md:text-4xl">
              One workspace. Every PDF task.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {CATEGORY_COPY[activeCategory]}
            </p>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            <span className="text-foreground">{filteredTools.length}</span> tools available
          </p>
        </div>

        <div className="sticky top-14 z-30 -mx-2 mb-8 rounded-2xl border border-border bg-card/90 p-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl md:top-16 md:mx-0 md:flex md:items-center md:gap-2">
          <div className="flex gap-1 overflow-x-auto pb-2 md:flex-1 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  activeCategory === cat.id
                    ? 'bg-foreground text-background shadow-sm'
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
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
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
