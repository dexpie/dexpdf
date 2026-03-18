'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import ToolGrid from '@/components/ToolGrid'
import { TOOLS } from '@/config/tools'

export default function LandingPage() {
    const [recentTools, setRecentTools] = useState([])

    useEffect(() => {
        const recentIds = JSON.parse(localStorage.getItem('dexpdf_recent_tools') || '[]')
        const recentToolObjects = recentIds.map(id => TOOLS.find(f => f.id === id)).filter(Boolean)
        setRecentTools(recentToolObjects.slice(0, 4))
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]">

            {/* Clean Hero */}
            <section className="relative pt-28 pb-16 px-4 text-center bg-white border-b border-slate-200">
                <div className="container mx-auto max-w-3xl">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
                        All PDF tools you need, in one place
                    </h1>

                    <p className="text-base md:text-lg text-slate-500 mb-8 max-w-xl mx-auto leading-relaxed">
                        Merge, split, compress, convert, sign — free and easy.
                    </p>

                    {/* Quick Recents */}
                    {recentTools.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            <span className="text-xs text-slate-400 font-medium self-center mr-1">Recent:</span>
                            {recentTools.map((tool, idx) => (
                                <Link key={idx} href={tool.href}>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-full border border-slate-200 hover:border-red-200 transition-colors text-sm font-semibold cursor-pointer">
                                        <tool.icon className="w-3.5 h-3.5" />
                                        <span>{tool.title}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Trust Signal */}
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
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
