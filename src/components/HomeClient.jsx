'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  CloudOff,
  FileText,
  Layers,
  Lock,
  Scissors,
  FileSignature,
} from 'lucide-react'
import ToolGrid from '@/components/ToolGrid'
import { TOOLS } from '@/config/tools'

const QUICK_TOOLS = ['merge', 'compress', 'pdf2word', 'signature', 'qr-code']

function BoundaryVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      {/* Device boundary */}
      <div className="boundary-box p-6">
        <span className="boundary-label absolute -top-2.5 left-4 bg-[#10151C] px-2">your device</span>

        {/* Mini tool icons the document travels between */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(243,239,228,0.12)] bg-[#171E27]">
            <Layers className="h-5 w-5 text-[#8E97A3]" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(243,239,228,0.12)] bg-[#171E27]">
            <Scissors className="h-5 w-5 text-[#8E97A3]" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(243,239,228,0.12)] bg-[#171E27]">
            <FileSignature className="h-5 w-5 text-[#8E97A3]" />
          </div>
        </div>

        {/* The document, moving between tools, never leaving the box */}
        <div className="doc-move mt-5 flex w-fit items-center gap-2 rounded-md bg-[#F3EFE4] px-3 py-2 shadow-sm">
          <FileText className="h-4 w-4 text-[#1B2027]" />
          <span className="font-mono text-[10px] font-bold tracking-wide text-[#1B2027]">contract.pdf</span>
        </div>

        <p className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#35D68E]">
          <Lock className="h-3 w-3" />
          processed here
        </p>
      </div>

      {/* The cloud — outside the boundary, connection never completes */}
      <div className="absolute -top-10 right-0 flex items-center gap-2">
        <svg className="h-6 w-14 text-[#8E97A3]" viewBox="0 0 56 24" fill="none" aria-hidden="true">
          <line x1="54" y1="12" x2="34" y2="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.5" />
          <line x1="28" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.25" />
        </svg>
        <CloudOff className="h-5 w-5 shrink-0 text-[#8E97A3]" />
        <span className="boundary-label">cloud</span>
      </div>
    </div>
  )
}

export default function HomeClient() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

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

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="border-b border-[rgba(243,239,228,0.12)] px-4 pb-16 pt-16 md:px-6 md:pb-24 md:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="max-w-xl font-mono text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Your files never leave{' '}
              <span className="text-primary">the building.</span>
            </h1>

            <p className="mt-6 max-w-lg font-serif text-lg leading-8 text-muted-foreground md:text-xl">
              {TOOLS.length} PDF and QR tools that run entirely in your browser.
              No uploads, no accounts, no waiting rooms. Your documents are
              processed on this device and nowhere else.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={openSearch}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse tools
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/privacy"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[rgba(243,239,228,0.2)] px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                See how local works
              </Link>
            </div>

            <div className="terminal-strip mt-10 max-w-sm px-4 py-3">
              <p><span className="prompt">$</span> upload_required: <span className="value">false</span></p>
              <p><span className="prompt">$</span> files_transmitted: <span className="value">0</span></p>
              <p><span className="prompt">$</span> processed_on: <span className="value">this_device</span></p>
            </div>
          </div>

          <BoundaryVisual />
        </div>

        <div className="mx-auto mt-14 flex max-w-6xl flex-wrap items-center gap-2">
          <span className="boundary-label mr-2">Start here:</span>
          {quickTools.map(tool => (
            <Link
              key={tool.id}
              href={tool.href || `/${tool.id}`}
              className="group inline-flex items-center gap-1.5 rounded-full border border-[rgba(243,239,228,0.14)] px-4 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <tool.icon className="h-3.5 w-3.5" />
              {tool.title}
            </Link>
          ))}
        </div>
      </section>

      <ToolGrid />
    </main>
  )
}
