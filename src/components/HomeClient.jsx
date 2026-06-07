'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Zap, Clock, Star, FileText, ArrowRight,
    Activity, Sun, Moon, Cloud, Search
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'

import Features from './Features'
import RecentFiles from './RecentFiles'
import ToolCard from './ToolCard'

export default function HomeClient({ tools }) {
    const { t } = useTranslation()
    const router = useRouter()
    const [greeting, setGreeting] = useState('Welcome back')
    const [stats, setStats] = useState({ converted: 0, saved: '0 MB' })

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good Morning')
        else if (hour < 18) setGreeting('Good Afternoon')
        else setGreeting('Good Evening')

        // Pull real stats from localStorage history
        try {
            const history = JSON.parse(localStorage.getItem('dexpdf_history') || '[]')
            const totalFiles = history.length
            const totalSaved = history.reduce((acc, item) => acc + (item.size || 0), 0)
            const savedMB = (totalSaved / (1024 * 1024)).toFixed(1)
            setStats({ converted: totalFiles, saved: `${savedMB} MB` })
        } catch (e) {
            setStats({ converted: 0, saved: '0 MB' })
        }
    }, [])

    // Featured Tools (God Mode Favorites)
    const favorites = ['merge', 'invoice-generator', 'compress', 'edit']
    const favTools = tools.filter(t => favorites.includes(t.id))

    // Group rest by filters if needed, but for now we show categories as before or cleaner list
    // Reusing existing categories logic if we want, or simplifying for "Cockpit" view

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section - Dashboard Style */}
            <section className="relative pt-32 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-2 text-blue-500 font-bold mb-2 uppercase tracking-wide text-sm">
                            <Activity className="w-4 h-4" /> System Online
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
                            {greeting}, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Captain.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            DexPDF AI Core is active. You have processed {stats.converted} documents today
                            and saved {stats.saved} of space.
                        </p>
                    </motion.div>

                    {/* Quick Stats / Status */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-muted-foreground text-xs font-bold uppercase mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> System Time</div>
                            <div className="text-2xl font-mono font-bold text-foreground">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-muted-foreground text-xs font-bold uppercase mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Files Processed</div>
                            <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">{stats.converted}</div>
                        </div>
                        {/* Add more widgets here */}
                    </div>

                    {/* Favorites / Quick Access */}
                    <div className="mb-16">
                        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Mission Critical Tools
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {favTools.map((tool, i) => (
                                <ToolCard key={tool.id} tool={tool} index={i} />
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-16">
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Clock className="w-5 h-5 text-muted-foreground" /> Recent Transmissions
                            </h3>
                            <button onClick={() => router.push('/my-documents')} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <RecentFiles limit={3} />
                    </div>

                </div>
            </section>

            {/* Full Tool Grid (Collapsed/Expandable or just visible below) */}
            <section className="bg-secondary/50 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground">All Modules</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search modules..."
                                className="pl-10 pr-4 py-2 rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                // Input logic to filter tools below or trigger command palette
                                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                            />
                        </div>
                    </div>
                    <Features tools={tools} />
                </div>
            </section>

        </div>
    )
}
