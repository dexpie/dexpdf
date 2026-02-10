'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
        <section className="relative z-20 px-4 pb-24 -mt-10 pt-10">
            <div className="container mx-auto">

                {/* Search & Filter Header - Sticky */}
                <div className="sticky top-16 z-30 mb-8 -mx-4 px-4 py-4 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 shadow-sm">

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${activeCategory === cat.id
                                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input (Secondary) */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find a tool..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-300 text-sm font-semibold outline-none focus:ring-2 ring-red-500/20 focus:border-red-500 transition-all text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredTools.map((tool) => (
                            <motion.div
                                key={tool.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ToolCard tool={tool} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredTools.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="text-6xl mb-4 grayscale opacity-50">📂</div>
                        <h3 className="text-xl font-bold text-slate-800">No tools found</h3>
                        <p className="text-slate-500 mb-6">We couldn't find matches for "{searchQuery}"</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                            className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
