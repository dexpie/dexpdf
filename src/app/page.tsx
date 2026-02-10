'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    FileText, ShieldCheck, Users, Globe, Search
} from 'lucide-react'
import FAQ from '@/components/FAQ'
import HowItWorks from '@/components/HowItWorks'
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

            {/* Simple Utility Hero */}
            <section className="relative pt-32 pb-20 px-4 text-center bg-white border-b border-slate-200">
                <div className="container mx-auto max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-6"
                    >
                        Every tool you need to work with PDFs in one place
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
                    </motion.p>

                    {/* Quick Recents */}
                    {recentTools.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap justify-center gap-3"
                        >
                            {recentTools.map((tool, idx) => (
                                <Link key={idx} href={tool.href}>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-full border border-slate-200 hover:border-red-200 transition-all text-sm font-bold cursor-pointer">
                                        <tool.icon className="w-4 h-4" />
                                        <span>{tool.title}</span>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Tools Grid Section */}
            <ToolGrid />

            {/* How It Works Section */}
            <HowItWorks />

            {/* FAQ Section */}
            <FAQ />

            {/* Trust Footer */}
            <section className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
                <div className="container mx-auto text-center px-4">
                    <h4 className="text-white font-bold mb-8 text-2xl">Trusted by 10,000+ happy users</h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
                        {[
                            { label: 'Files Processed', value: '1M+', icon: FileText },
                            { label: 'Happy Users', value: '10k+', icon: Users },
                            { label: 'Secure Handling', value: '100%', icon: ShieldCheck },
                            { label: 'Countries', value: '150+', icon: Globe },
                        ].map((stat, idx) => (
                            <div key={idx} className="p-4">
                                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} DexPDF. All rights reserved.</p>
                </div>
            </section>
        </div>
    )
}
