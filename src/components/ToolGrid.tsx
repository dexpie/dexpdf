'use client'
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { TOOLS, CATEGORIES } from '../config/tools'
import ToolCard from './ToolCard'

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
        <section className="relative z-20 px-4 pb-16 pt-8">
            <div className="container mx-auto">

                {/* Search & Filter */}
                <div className="sticky top-14 z-30 mb-6 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">

                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto pb-1 -mb-1 gap-2 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${activeCategory === cat.id
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find a tool..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 ring-red-500/20 focus:border-red-500 transition-colors text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Tool Count */}
                <div className="mb-4 text-xs text-slate-400 font-medium">
                    {filteredTools.length} tools available
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredTools.map((tool) => (
                        <div key={tool.id}>
                            <ToolCard tool={tool} />
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredTools.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="text-4xl mb-3 grayscale opacity-50">🔍</div>
                        <h3 className="text-lg font-bold text-slate-800">No tools found</h3>
                        <p className="text-slate-500 mb-4 text-sm">No matches for "{searchQuery}"</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                            className="px-5 py-1.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
