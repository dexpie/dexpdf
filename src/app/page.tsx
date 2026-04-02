'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import ToolGrid from '@/components/ToolGrid'
import { TOOLS } from '@/config/tools'

/**
 * LandingPage - Main homepage
 * Displays hero section with quick access to recent tools
 */
export default function LandingPage() {
  const [recentTools, setRecentTools] = useState([])

  useEffect(() => {
    const recentIds = JSON.parse(localStorage.getItem('dexpdf_recent_tools') || '[]')
    const recentToolObjects = recentIds.map(id => TOOLS.find(f => f.id === id)).filter(Boolean)
    setRecentTools(recentToolObjects.slice(0, 4))
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Hero Section - Clean and inviting */}
      <section className="relative pt-28 pb-14 px-4 text-center bg-card border-b border-border">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            All PDF tools you need, in one place
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Merge, split, compress, convert, sign — free and easy.
          </p>

          {/* Quick Recents */}
          {recentTools.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground font-medium self-center mr-1">Recent:</span>
              {recentTools.map((tool, idx) => (
                <Link key={idx} href={tool.href}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg border border-border hover:border-primary/30 transition-colors text-sm font-medium cursor-pointer">
                    <tool.icon className="w-3.5 h-3.5" />
                    <span>{tool.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Trust Signal */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% free · No sign-up required · Files stay on your device</span>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <ToolGrid />

    </div>
  )
}