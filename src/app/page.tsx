'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
    FileText, Download, Shield, Zap, Image, FileOutput, Scissors,
    Layers, Lock, Unlock, PenTool, Type, FileSignature,
    FileImage, RefreshCcw, LayoutTemplate, Search, Settings, Upload, X, ArrowRight,
    CheckCircle, ShieldCheck, Users, Globe
} from 'lucide-react'
import Features from '@/components/Features'
import FAQ from '@/components/FAQ'
import HowItWorks from '@/components/HowItWorks'

// Feature configuration
const features = [
    { id: 'chat-pdf', title: "Chat with PDF", description: "Use AI to analyze and chat with your documents.", icon: Zap, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/chat-pdf" },
    { id: 'merge', title: "Merge PDF", description: "Combine multiple PDFs into one unified document.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/merge" },
    { id: 'split', title: "Split PDF", description: "Separate pages or extract ranges from your PDF.", icon: Scissors, color: "text-red-500", iconBg: "bg-red-50", href: "/split" },
    { id: 'compress', title: "Compress PDF", description: "Reduce file size while maintaining visual quality.", icon: Download, color: "text-green-500", iconBg: "bg-green-50", href: "/compress" },
    { id: 'pdf2word', title: "PDF to Word", description: "Convert PDF documents to editable Word files.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/pdf2word" },
    { id: 'pdf2ppt', title: "PDF to PowerPoint", description: "Convert PDFs to editable PowerPoint slides.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/pdf2ppt" },
    { id: 'pdf2excel', title: "PDF to Excel", description: "Convert PDF data to Excel spreadsheets.", icon: FileText, color: "text-green-500", iconBg: "bg-green-50", href: "/pdf2excel" },
    { id: 'flatten', title: "Flatten PDF", description: "Convert editable content to images.", icon: Layers, color: "text-purple-500", iconBg: "bg-purple-50", href: "/flatten" },
    { id: 'word2pdf', title: "Word to PDF", description: "Convert DOC and DOCX files to PDF.", icon: FileOutput, color: "text-blue-500", iconBg: "bg-blue-50", href: "/word2pdf" },
    { id: 'ppt2pdf', title: "PowerPoint to PDF", description: "Convert PPT and PPTX slideshows to PDF.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/ppt2pdf" },
    { id: 'excel2pdf', title: "Excel to PDF", description: "Convert Excel spreadsheets to PDF documents.", icon: FileText, color: "text-green-500", iconBg: "bg-green-50", href: "/excel2pdf" },
    { id: 'edit', title: "Edit PDF", description: "Add text, shapes, images and comments to PDF.", icon: PenTool, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/edit" },
    { id: 'pdf2imgs', title: "PDF to JPG", description: "Extract images or save each page as JPG.", icon: FileImage, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/pdf2imgs" },
    { id: 'imgs2pdf', title: "JPG to PDF", description: "Convert JPG, PNG, BMP images to PDF.", icon: Image, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/imgs2pdf" },
    { id: 'signature', title: "Sign PDF", description: "Sign yourself or request electronic signatures.", icon: FileSignature, color: "text-red-500", iconBg: "bg-red-50", href: "/signature" },
    { id: 'watermark', title: "Watermark", description: "Stamp an image or text over your PDF files.", icon: FileImage, color: "text-red-500", iconBg: "bg-red-50", href: "/watermark" },
    { id: 'rotate', title: "Rotate PDF", description: "Rotate your PDF pages to the correct orientation.", icon: RefreshCcw, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/organize" },
    { id: 'html2pdf', title: "HTML to PDF", description: "Convert webpages to PDF documents.", icon: FileText, color: "text-gray-500", iconBg: "bg-gray-50", href: "/html2pdf" },
    { id: 'unlock', title: "Unlock PDF", description: "Remove password styling from PDF files.", icon: Unlock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/unlock" },
    { id: 'protect', title: "Protect PDF", description: "Encrypt your PDF with a secure password.", icon: Lock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/protect" },
    { id: 'organize', title: "Organize PDF", description: "Sort, add and delete PDF pages.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/organize" },
    { id: 'pdf2pdfa', title: "PDF to PDF/A", description: "Convert PDF documents to PDF/A for archiving.", icon: FileText, color: "text-red-500", iconBg: "bg-red-50", href: "/pdf2pdfa" },
    { id: 'repair', title: "Repair PDF", description: "Repair damaged or corrupted PDF files.", icon: Zap, color: "text-gray-500", iconBg: "bg-gray-50", href: "/repair" },
    { id: 'pagenums', title: "Page Numbers", description: "Add page numbers to your PDF document.", icon: Type, color: "text-red-500", iconBg: "bg-red-50", href: "/pagenums" },
    { id: 'ocr', title: "Scan to PDF", description: "Capture documents from scanner or mobile.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/ocr" },
    { id: 'ocr_text', title: "OCR PDF", description: "Make scanned documents searchable.", icon: Type, color: "text-blue-500", iconBg: "bg-blue-50", href: "/ocr" },
]

export default function LandingPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [heroBg, setHeroBg] = useState('/assets/hero-bg.png')
    const [recentTools, setRecentTools] = useState([])
    const [smartModalOpen, setSmartModalOpen] = useState(false)
    const [droppedFiles, setDroppedFiles] = useState([])
    const [suggestedActions, setSuggestedActions] = useState([])

    useEffect(() => {
        // Load settings and recents
        const storedBg = localStorage.getItem('hero-bg')
        if (storedBg) setHeroBg(storedBg)

        const recentIds = JSON.parse(localStorage.getItem('dexpdf_recent_tools') || '[]')
        const recentToolObjects = recentIds.map(id => features.find(f => f.id === id)).filter(Boolean)
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
            actions.push({ ...features.find(f => f.id === 'merge'), label: 'Merge PDFs' })
            actions.push({ ...features.find(f => f.id === 'organize'), label: 'Organize Pages' })
        } else if (pdfCount === 1) {
            actions.push({ ...features.find(f => f.id === 'edit'), label: 'Edit PDF' })
            actions.push({ ...features.find(f => f.id === 'compress'), label: 'Compress PDF' })
            actions.push({ ...features.find(f => f.id === 'pdf2word'), label: 'Convert to Word' })
            actions.push({ ...features.find(f => f.id === 'organize'), label: 'Organize/Rotate' })
        }

        if (imgCount > 0) {
            actions.push({ ...features.find(f => f.id === 'imgs2pdf'), label: 'Convert Images to PDF' })
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

    const filteredFeatures = features.filter(feature =>
        feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                className="relative pt-32 pb-36 text-white overflow-hidden outline-none"
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
                            <h2 className="text-4xl font-bold text-white">Drop files here to begin</h2>
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
                            className="text-5xl font-extrabold tracking-tight md:text-7xl mb-6 drop-shadow-sm"
                        >
                            Every tool you need to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">work with PDFs</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-3xl mx-auto mb-12 text-xl text-slate-200 font-light leading-relaxed"
                        >
                            Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
                            <br className="hidden md:block" /> 100% FREE, secure, and easy to use.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-xl mx-auto relative group z-20"
                        >
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for a PDF tool..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/95 backdrop-blur-xl text-slate-900 shadow-2xl focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all placeholder:text-slate-400 text-lg border border-white/20"
                            />
                            <button
                                onClick={handleBgChange}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-50 text-slate-400 p-2"
                                title="Change Background"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </motion.div>

                        {/* Cloud Integrations */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex justify-center gap-4 mt-8"
                        >
                            <button
                                onClick={() => alert("Google Drive integration coming soon to DexPDF Pro!")}
                                className="flex items-center gap-3 px-5 py-2.5 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 group"
                            >
                                <div className="p-1.5 bg-white rounded-lg group-hover:shadow-lg transition-shadow">
                                    <svg viewBox="0 0 87.3 78" className="w-5 h-5">
                                        <path d="M6.6 66.85l25.3-43.8 23.2 40.2H6.6v3.6zm25.3-43.8L53.6 6.3l-24-3.3-23 39.8L6.6 66.85z" fill="none" />
                                        <path d="M29.9 23.05L8.6 60.15h56.3L44.8 23.05H29.9z" fill="#0066da" opacity="0" />
                                        <path d="M87.3 26.35H55.8L44.2 6.3H31.9l20.4 35.5L40 63.25h15.8l31.5-54.5v17.6z" fill="#00AC47" />
                                        <path d="M57.6 71.7H13.8l11.4-19.8H6.5L0 63.25l9.7 14.75h47.9l11.4-19.8-11.4 13.5z" fill="#EA4335" />
                                        <path d="M25.2 6.3L6.6 42.8h17.6L44.2 8.7 54.3 26.35H87.3L54.3 6.3H25.2z" fill="#FFC107" />
                                        <path d="M29.9 23.05h14.9l8.6 14.9L37.1 66.85h-7.2L8.6 23.05H29.9z" fill="#188038" />
                                    </svg>
                                </div>
                                <span className="text-white/90 font-medium text-sm group-hover:text-white">Google Drive</span>
                            </button>

                            <button
                                onClick={() => alert("Dropbox integration coming soon to DexPDF Pro!")}
                                className="flex items-center gap-3 px-5 py-2.5 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 group"
                            >
                                <div className="p-1.5 bg-white rounded-lg group-hover:shadow-lg transition-shadow">
                                    <svg viewBox="0 0 43 40" className="w-5 h-5">
                                        <path d="M12.5 0L0 8.3l8.6 7.4L21.3 7.8 12.5 0zM30.5 0L21.3 7.8l12.7 7.9 8.6-7.4L30.5 0zM0 24.3l12.5 8.3 8.8-7.8-12.7-7.9-8.6 7.4zM42.6 24.3l-8.6-7.4-12.7 7.9 8.8 7.8 12.5-8.3zM21.3 27.2l-8.8 7.8L21.3 40l8.8-4.9-8.8-7.9z" fill="#0061FF" />
                                    </svg>
                                </div>
                                <span className="text-white/90 font-medium text-sm group-hover:text-white">Dropbox</span>
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none"></div>
            </section>

            {/* Recent Tools Section */}
            {recentTools.length > 0 && !searchQuery && (
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

            {/* Tools Grid */}
            <section className="relative z-20 px-4 pb-24 -mt-10 pt-10">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFeatures.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.03 }}
                            >
                                <Link href={feature.href} onClick={() => handleToolClick(feature.id)}>
                                    <div className="glass-card rounded-2xl p-6 h-full flex flex-col items-start hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400/30 group">
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
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <HowItWorks />

            {/* AdSpot Placement 1 */}
            {/* <AdSpot /> can go here if needed */}

            {/* Features Section */}
            <Features />

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
