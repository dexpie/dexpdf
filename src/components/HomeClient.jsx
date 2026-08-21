'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CloudOff,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import ToolGrid from '@/components/ToolGrid'
import { TOOLS } from '@/config/tools'

const QUICK_TOOLS = ['merge', 'compress', 'pdf2word', 'signature', 'qr-code']

export default function HomeClient() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [heroQuery, setHeroQuery] = useState('')

  useEffect(() => setMounted(true), [])

  const copy = (key, fallback) => {
    if (!mounted) return fallback
    return t(key)
  }

  const quickTools = QUICK_TOOLS
    .map(id => TOOLS.find(tool => tool.id === id))
    .filter(Boolean)

  const openSearch = () => {
    document.getElementById('tool-catalog')?.scrollIntoView({ behavior: 'smooth' })
    window.setTimeout(() => document.getElementById('tool-search')?.focus(), 450)
  }

  const submitSearch = event => {
    event.preventDefault()
    const query = heroQuery.trim()
    window.__dexpdfHeroSearch = query
    window.dispatchEvent(new Event('dexpdf:tool-search'))
    document.getElementById('tool-catalog')?.scrollIntoView({ behavior: 'smooth' })
    window.setTimeout(() => document.getElementById('tool-search')?.focus(), 450)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="relative px-4 pb-20 pt-20 text-center md:pb-28 md:pt-28">
        <div className="mx-auto max-w-3xl">
          <div className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {copy('home.eyebrow', '100% private — files never leave your device')}
          </div>

          <h1 className="text-balance text-5xl font-black leading-[1.02] tracking-[-0.045em] text-foreground sm:text-6xl md:text-7xl">
            {copy('home.title', 'PDF tools that feel')}
            <span className="hero-gradient-text block">{copy('home.titleAccent', 'effortlessly fast.')}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
            {copy('home.subtitle', 'Edit, convert, organize, and protect documents in one fast workspace — no sign-up, no uploads for local tools.')}
          </p>

          <form onSubmit={submitSearch} className="mx-auto mt-10 max-w-xl">
            <label htmlFor="hero-tool-search" className="sr-only">{copy('home.searchLabel', 'Search tools')}</label>
            <div className="glass-strong flex min-h-16 items-center gap-2 rounded-2xl p-2 shadow-xl shadow-slate-900/10 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                id="hero-tool-search"
                value={heroQuery}
                onChange={event => setHeroQuery(event.target.value)}
                placeholder={copy('home.searchPlaceholder', 'Search: merge, compress, QR, sign...')}
                className="min-w-0 flex-1 bg-transparent px-1 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90">
                {copy('home.searchCta', 'Search')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {quickTools.map(tool => (
              <Link
                key={tool.id}
                href={tool.href || `/${tool.id}`}
                className="glass-subtle group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <tool.icon className="h-4 w-4 text-primary" />
                {tool.title}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {copy('home.noSignup', 'No sign-up')}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> {copy('home.privacyByDesign', 'Privacy by design')}</span>
            <span className="flex items-center gap-1.5"><CloudOff className="h-4 w-4 text-emerald-500" /> {copy('home.browserFirst', 'Runs in your browser')}</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> {TOOLS.length} tools free</span>
          </div>
        </div>
      </section>

      <ToolGrid />
    </main>
  )
}
