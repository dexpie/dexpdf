'use client'
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { TOOLS, CATEGORIES } from '../config/tools'
import ToolCard from './ToolCard'

/**
 * ToolGrid - Main tool discovery component
 * Displays all available PDF tools with search and category filtering
 */
export default function ToolGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <section className="relative z-20 px-4 pb-16 pt-6">
      <div className="container mx-auto">

        {/* Search & Filter - Softer styling */}
        <div className="sticky top-14 z-30 mb-8 -mx-4 px-4 py-4 bg-white/90 backdrop-blur-md border-b border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">

          {/* Category Tabs - Rounded and softer */}
          <div className="flex overflow-x-auto pb-1 -mb-1 gap-1.5 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input - Better contrast */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl border border-border text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Tool Count - Subtle styling */}
        <div className="mb-5 text-sm text-muted-foreground font-medium">
          {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} available
        </div>

        {/* Grid - Better spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <div key={tool.id}>
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>

        {/* Empty State - Friendly design */}
        {filteredTools.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <div className="text-5xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-6">No matches for "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}