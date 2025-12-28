'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { TOOLS, CATEGORIES } from '../config/tools'

export default function ToolGrid() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    const filteredTools = TOOLS.filter(tool => {
        const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
        return matchesSearch && matchesCategory
    })

    const handleToolClick = (toolId) => {
        const currentRecents = JSON.parse(localStorage.getItem('dexpdf_recent_tools') || '[]')
        const newRecents = [toolId, ...currentRecents.filter(id => id !== toolId)].slice(0, 4)
        localStorage.setItem('dexpdf_recent_tools', JSON.stringify(newRecents))
    }

    return (
        <section className="relative z-20 px-4 pb-24 -mt-10 pt-10">
            <div className="container mx-auto">

                {/* Search & Filter Header */}
                <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white text-slate-500 hover:bg-slate-50'
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
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-100 text-sm font-semibold outline-none focus:ring-2 ring-blue-500/20"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredTools.map((feature) => (
                            <motion.div
                                key={feature.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link href={feature.href} onClick={() => handleToolClick(feature.id)}>
                                    <div className="glass-card bg-white rounded-2xl p-6 h-full flex flex-col items-start hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400/30 group transition-all duration-300 border border-slate-100">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${feature.iconBg} ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                            <feature.icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredTools.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🤷‍♂️</div>
                        <h3 className="text-xl font-bold text-slate-600">No tools found</h3>
                        <p className="text-slate-400">Try adjusting your search or category.</p>
                        <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-4 text-blue-600 font-bold hover:underline">Clear & Reset</button>
                    </div>
                )}
            </div>
        </section>
    )
}
