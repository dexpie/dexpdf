'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
    FileText, Upload, X, ArrowRight,
    CheckCircle, ShieldCheck, Users, Globe, Settings, Search
} from 'lucide-react'
import Features from '@/components/Features'
import FAQ from '@/components/FAQ'
import HowItWorks from '@/components/HowItWorks'
import ToolGrid from '@/components/ToolGrid'
import { TOOLS } from '@/config/tools'

export default function LandingPage() {
    const router = useRouter()
    const [heroBg, setHeroBg] = useState('/assets/hero-bg.png')
    const [recentTools, setRecentTools] = useState([])
    const [smartModalOpen, setSmartModalOpen] = useState(false)
    const [droppedFiles, setDroppedFiles] = useState([])
    const [suggestedActions, setSuggestedActions] = useState([])
    const [heroSearch, setHeroSearch] = useState('')

    useEffect(() => {
        // Load settings and recents
        const storedBg = localStorage.getItem('hero-bg')
        if (storedBg) setHeroBg(storedBg)

        const recentIds = JSON.parse(localStorage.getItem('dexpdf_recent_tools') || '[]')
        const recentToolObjects = recentIds.map(id => TOOLS.find(f => f.id === id)).filter(Boolean)
        setRecentTools(recentToolObjects.slice(0, 4))
    }, [])

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length === 0) return
        setDroppedFiles(acceptedFiles)

        // Smart Logic
        const pdfCount = acceptedFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')).length
        const imgCount = acceptedFiles.filter(f => f.type.startsWith('image/')).length

        const actions = []

        if (pdfCount > 1) {
            actions.push({ ...TOOLS.find(f => f.id === 'merge'), label: 'Merge PDFs' })
            actions.push({ ...TOOLS.find(f => f.id === 'organize'), label: 'Organize Pages' })
        } else if (pdfCount === 1) {
            actions.push({ ...TOOLS.find(f => f.id === 'edit'), label: 'Edit PDF' })
            actions.push({ ...TOOLS.find(f => f.id === 'compress'), label: 'Compress PDF' })
            actions.push({ ...TOOLS.find(f => f.id === 'pdf2word'), label: 'Convert to Word' })
            actions.push({ ...TOOLS.find(f => f.id === 'organize'), label: 'Organize/Rotate' })
        }

        if (imgCount > 0) {
            actions.push({ ...TOOLS.find(f => f.id === 'imgs2pdf'), label: 'Convert Images to PDF' })
        }

        if (actions.length > 0) {
            setSuggestedActions(actions)
            setSmartModalOpen(true)
        } else {
            alert("File type not supported yet or no obvious action found.")
        }

    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true, // Allow clicking buttons inside without triggering drop
        noKeyboard: true
    })

    const handleToolClick = (toolId) => {
        const currentRecents = JSON.parse(localStorage.getItem('dexpdf_recent_tools') || '[]')
        const newRecents = [toolId, ...currentRecents.filter(id => id !== toolId)].slice(0, 4)
        localStorage.setItem('dexpdf_recent_tools', JSON.stringify(newRecents))
    }

    const handleBgChange = () => {
        const url = prompt("Enter new background image URL:")
        if (url) {
            setHeroBg(url)
            localStorage.setItem('hero-bg', url)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]">

            {/* Smart Action Modal */}
            <AnimatePresence>
                {smartModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSmartModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800">What would you like to do?</h3>
                                <button onClick={() => setSmartModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-2">
                                {suggestedActions.map((action, idx) => (
                                    <Link
                                        key={idx}
                                        href={action.href}
                                        onClick={() => handleToolClick(action.id)}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors group"
                                    >
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.iconBg} ${action.color}`}>
                                            <action.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{action.label}</h4>
                                            <p className="text-sm text-slate-500">{action.description}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                                    </Link>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 text-center text-xs text-slate-500">
                                {droppedFiles.length} file(s) ready to process
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section
                {...getRootProps()}
                className="relative pt-24 pb-24 md:pt-32 md:pb-36 text-white overflow-hidden outline-none"
                style={{
                    backgroundImage: `url(${heroBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <input {...getInputProps()} />

                {/* Drop Overlay */}
                <AnimatePresence>
                    {isDragActive && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-40 bg-blue-600/90 flex flex-col items-center justify-center backdrop-blur-sm border-4 border-white/30 border-dashed m-4 rounded-3xl"
                        >
                            <Upload className="w-20 h-20 mb-6 text-white animate-bounce" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white text-center px-4">Drop files here to begin</h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dark Overlay */}
                <div className="absolute inset-0 hero-overlay transition-colors duration-500 pointer-events-none"></div>

                <div className="container relative z-10 px-4 mx-auto text-center pointer-events-none">
                    <div className="pointer-events-auto"> {/* Re-enable events for content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block mb-4"
                        >
                            <span className="py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium backdrop-blur-sm">
                                World's #1 PDF Solution
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-sm leading-tight"
                        >
                            Every tool you need to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">work with PDFs</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-3xl mx-auto mb-10 md:mb-12 text-lg md:text-xl text-slate-200 font-light leading-relaxed px-4"
                        >
                            Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
                            <br className="hidden md:block" /> 100% FREE, secure, and easy to use.
                        </motion.p>

                        {/* Search Bar (Hero) - Scrolls to Grid */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-xl mx-auto relative group z-20 w-full"
                        >
                            <button
                                onClick={() => {
                                    (document.querySelector('input[placeholder="Find a tool..."]') as HTMLInputElement)?.focus()
                                    // Smooth scroll to tool grid
                                    document.querySelector('section.relative.z-20')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className="w-full pl-6 pr-6 py-4 md:py-5 rounded-2xl bg-white/95 backdrop-blur-xl text-slate-500 text-left shadow-2xl hover:bg-white transition-all text-base md:text-lg border border-white/20 flex items-center justify-between"
                            >
                                <span>I want to...</span>
                                <Search className="w-6 h-6 text-slate-400" />
                            </button>

                            <button
                                onClick={handleBgChange}
                                className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 text-white p-2 transition-all"
                                title="Change Background"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </motion.div>

                        {/* Cloud Integrations */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8"
                        >
                            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                                <CheckCircle className="w-4 h-4 text-green-400" /> Free
                                <CheckCircle className="w-4 h-4 text-green-400 ml-2" /> Private
                                <CheckCircle className="w-4 h-4 text-green-400 ml-2" /> No Limits
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none"></div>
            </section>

            {/* Recent Tools Section */}
            {recentTools.length > 0 && (
                <section className="relative z-20 -mt-10 px-4 pb-8 pointer-events-none">
                    <div className="container mx-auto pointer-events-auto">
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2 inline-flex gap-2"
                            >
                                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                                    Recent
                                </div>
                                {recentTools.map((tool, idx) => (
                                    <Link key={idx} href={tool.href} onClick={() => handleToolClick(tool.id)}>
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">{tool.title}</span>
                                        </div>
                                    </Link>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tools Grid (Replaced) */}
            <ToolGrid />

            {/* How It Works Section */}
            <HowItWorks />

            {/* AdSpot Placement 1 */}
            {/* <AdSpot /> can go here if needed */}

            {/* Features Section - Keep as legacy or marketing content */}
            {/* <Features /> */}

            {/* FAQ Section */}
            <FAQ />

            {/* Footer Trust */}
            <section className="bg-white py-16 border-t border-slate-200">
                <div className="container mx-auto text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h4 className="text-slate-900 font-bold mb-4 text-2xl">Trusted by over 10,000+ users worldwide</h4>
                        <p className="text-slate-500">From students to professionals, DexPDF is the go-to choice for simple PDF tasks.</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
                        {[
                            { label: 'Files Processed', value: '1M+', icon: FileText },
                            { label: 'Happy Users', value: '10k+', icon: Users },
                            { label: 'Secure Handling', value: '100%', icon: ShieldCheck },
                            { label: 'Countries', value: '150+', icon: Globe },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.05 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                            >
                                <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-black text-slate-800 mb-1">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 items-center">
                        {/* Simple Text Logos styled to look like SVGs */}
                        <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><div className="w-6 h-6 bg-slate-800 rounded-full"></div> GOOGLE</span>
                        <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 rounded-md"></div> DROPBOX</span>
                        <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><div className="w-6 h-6 bg-green-600 rounded-tr-xl rounded-bl-xl"></div> DRIVE</span>
                        <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><div className="w-6 h-6 bg-orange-600 rounded-sm"></div> MICROSOFT</span>
                    </div>
                </div>
            </section>
        </div>
    )
}
