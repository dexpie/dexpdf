'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  FileStack,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import ToolGrid from '@/components/ToolGrid'
import { TOOLS } from '@/config/tools'
import {
  getFavoriteToolIds,
  getRecentToolIds,
  PREFERENCES_EVENT,
} from '@/utils/toolPreferences'

const QUICK_TOOLS = ['merge', 'compress', 'qr-code', 'qr-reader']

export default function LandingPage() {
  const [recentTools, setRecentTools] = useState<any[]>([])
  const [favoriteTools, setFavoriteTools] = useState<any[]>([])

  useEffect(() => {
    const syncPreferences = () => {
      setRecentTools(
        getRecentToolIds()
          .map((id: string) => TOOLS.find(tool => tool.id === id))
          .filter(Boolean)
          .slice(0, 4)
      )
      setFavoriteTools(
        getFavoriteToolIds()
          .map((id: string) => TOOLS.find(tool => tool.id === id))
          .filter(Boolean)
          .slice(0, 4)
      )
    }

    syncPreferences()
    window.addEventListener(PREFERENCES_EVENT, syncPreferences)
    window.addEventListener('storage', syncPreferences)
    return () => {
      window.removeEventListener(PREFERENCES_EVENT, syncPreferences)
      window.removeEventListener('storage', syncPreferences)
    }
  }, [])

  const quickTools = QUICK_TOOLS
    .map(id => TOOLS.find(tool => tool.id === id))
    .filter(Boolean)

  const openSearch = () => {
    document.getElementById('tool-catalog')?.scrollIntoView({ behavior: 'smooth' })
    window.setTimeout(() => document.getElementById('tool-search')?.focus(), 450)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="hero-grid relative overflow-hidden border-b border-border bg-gradient-to-br from-white via-blue-50/70 to-violet-50 px-4 pb-16 pt-16 text-foreground dark:border-white/10 dark:bg-[#0a1020] dark:from-[#0a1020] dark:via-[#0a1020] dark:to-[#11182d] dark:text-white md:px-6 md:pb-24 md:pt-24">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              Your private PDF workspace
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.05em] text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
              PDF tools that feel
              <span className="hero-gradient-text block">effortlessly fast.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Edit, convert, organize, and protect documents in one fast workspace.
              Most tools run locally, so your files stay yours.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={openSearch}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:shadow-black/20 dark:hover:bg-indigo-50"
              >
                Find a PDF tool
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link
                href="/merge"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white/80 px-6 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/15"
              >
                <FileStack className="h-4 w-4 text-indigo-300" />
                Merge PDFs now
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No sign-up</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Private by design</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> Works in your browser</span>
            </div>
          </div>

          <div className="relative">
            <div className="workspace-card relative rounded-[2rem] border border-border bg-white/85 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.08] dark:shadow-black/30 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Quick start</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">What do you need to do?</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <LockKeyhole className="h-5 w-5" />
                </div>
              </div>

              <button
                onClick={openSearch}
                className="mb-4 flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 text-left text-sm text-slate-500 shadow-sm transition hover:border-primary/30 hover:bg-blue-50/60 dark:border-white/10 dark:bg-black/20 dark:text-slate-400 dark:hover:border-white/25 dark:hover:bg-black/30"
              >
                <Search className="h-4 w-4 text-primary" />
                Search more than {TOOLS.length} PDF tools
                <span className="ml-auto hidden rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[10px] sm:inline">Ctrl K</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                {quickTools.map((tool: any, index) => (
                  <Link
                    key={tool.id}
                    href={tool.href || `/${tool.id}`}
                    className="quick-tool-card group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-blue-50/50 hover:shadow-lg dark:border-white/10 dark:bg-black/20 dark:hover:border-white/25 dark:hover:bg-black/30"
                  >
                    <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${index === 0 ? 'bg-red-500/10 text-red-500' : index === 1 ? 'bg-emerald-500/10 text-emerald-500' : index === 2 ? 'bg-blue-500/10 text-blue-500' : 'bg-violet-500/10 text-violet-500'}`}>
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{tool.title}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>

              {(favoriteTools.length > 0 || recentTools.length > 0) && (
                <div className="mt-4 border-t border-border pt-4 dark:border-white/10">
                  {favoriteTools.length > 0 && (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="mr-1 flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                        <Star className="h-3 w-3 fill-current" />
                        Favorites
                      </span>
                      {favoriteTools.map(tool => (
                        <Link key={tool.id} href={tool.href || `/${tool.id}`} className="rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-400/10 dark:text-amber-100 dark:hover:bg-amber-400/20 dark:hover:text-white">
                          {tool.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  {recentTools.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mr-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Recent</span>
                      {recentTools.map(tool => (
                        <Link key={tool.id} href={tool.href || `/${tool.id}`} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white">
                          {tool.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ToolGrid />
    </main>
  )
}
