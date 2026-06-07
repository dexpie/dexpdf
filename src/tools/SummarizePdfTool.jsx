'use client'
import React, { useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { FileText, Sparkles, BrainCircuit, AlignLeft, List, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStoredApiKey, setStoredApiKey, generateJSON } from '../services/gemini'

configurePdfWorker()

const ApiKeyModal = ({ onSave, onClose }) => {
    const [input, setInput] = useState('')
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border dark:border-slate-700">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground dark:text-slate-200">Enable AI Summarizer</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">
                        To summarize documents, please enter your free Google Gemini API Key.
                    </p>
                </div>
                <input
                    type="password"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter Gemini API Key"
                    className="w-full p-3 rounded-xl border border-border dark:border-slate-600 bg-secondary dark:bg-slate-900 text-foreground dark:text-slate-200 mb-4 focus:ring-2 ring-indigo-500 outline-none"
                />
                <button
                    onClick={() => { if (input) onSave(input) }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
                >
                    Save & Continue
                </button>
                <div className="mt-4 text-center">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">
                        Get a free API Key here
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function SummarizePdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [summary, setSummary] = useState(null)
    const [mode, setMode] = useState('bullets') // bullets | paragraph
    const [apiKey, setApiKey] = useState('')
    const [showKeyModal, setShowKeyModal] = useState(false)

    useEffect(() => {
        const key = getStoredApiKey()
        if (key) setApiKey(key)
    }, [])

    const handleSaveKey = (key) => {
        setStoredApiKey(key)
        setApiKey(key)
        setShowKeyModal(false)
    }

    const handleFileChange = (files) => {
        if (files[0]) {
            setFile(files[0])
            setSummary(null)
        }
    }

    const generateSummary = async () => {
        if (!file) return
        setIsProcessing(true)

        try {
            // 1. Extract Text
            const buffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
            let fullText = ''
            const maxPages = Math.min(pdf.numPages, 10) // Limit to 10 pages for performance

            const pagePromises = [];
            for (let i = 1; i <= maxPages; i++) {
                pagePromises.push(pdf.getPage(i).then(async page => {
                    const textContent = await page.getTextContent()
                    return { i, text: textContent.items.map(item => item.str).join(' ') }
                }));
            }
            const pagesData = await Promise.all(pagePromises);
            pagesData.sort((a, b) => a.i - b.i);
            fullText = pagesData.map(p => p.text).join(' ');
            if (!fullText.trim()) throw new Error('No extractable text found. Run OCR first for scanned PDFs.')

            // 2. Generate Summary with Gemini
            const prompt = `
            You are an expert analyst. Summarize the following document.
            
            Text:
            """
            ${fullText.slice(0, 30000)}
            """
            
            Output a JSON object with this exact structure:
            {
                "bullets": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
                "paragraph": "A concise executive summary paragraph of the entire document."
            }
            Make the summary professional and capture the most important insights.
            `

            try {
                const result = await generateJSON(apiKey, prompt) // apiKey handles server/client priority
                setSummary(result)
            } catch (error) {
                if (error.message === 'SERVER_KEY_UNAVAILABLE' || error.message?.includes('API Key')) {
                    setShowKeyModal(true)
                    return
                }
                throw error
            }

        } catch (err) {
            console.error(err)
            alert('Failed to summarize PDF. Please check your API usage or try a different file.')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <ToolLayout title="AI PDF Summarizer" description="Summarize extracted text from the first ten pages using Gemini.">
            <AnimatePresence>
                {showKeyModal && <ApiKeyModal onSave={handleSaveKey} onClose={() => setShowKeyModal(false)} />}
            </AnimatePresence>

            {!summary ? (
                <div className="max-w-4xl mx-auto space-y-8">
                    <FileDropZone
                        onFiles={handleFileChange}
                        accept="application/pdf"
                        hint="Upload PDF to analyze"
                    />

                    {file && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-border dark:border-slate-700 text-center"
                        >
                            <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-foreground dark:text-slate-200 mb-1">{file.name}</h3>
                            <p className="text-muted-foreground dark:text-muted-foreground mb-6 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <button
                                onClick={generateSummary}
                                disabled={isProcessing}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all mx-auto
                                    ${isProcessing ? 'bg-slate-400 dark:bg-slate-600 cursor-wait' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'}
                                `}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Generate Summary</>
                                )}
                            </button>
                        </motion.div>
                    )}
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-indigo-100 dark:border-slate-700"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 border-b border-indigo-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-card dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground dark:text-slate-200">Executive Summary</h2>
                                    <p className="text-xs text-muted-foreground dark:text-muted-foreground font-medium uppercase tracking-wider">Generated by DexPDF AI</p>
                                </div>
                            </div>
                            <div className="flex bg-card dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-indigo-100 dark:border-slate-700">
                                <button
                                    onClick={() => setMode('bullets')}
                                    className={`p-2 rounded-md transition-all ${mode === 'bullets' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground hover:text-slate-600 dark:hover:text-muted-foreground'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setMode('paragraph')}
                                    className={`p-2 rounded-md transition-all ${mode === 'paragraph' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground hover:text-slate-600 dark:hover:text-muted-foreground'}`}
                                >
                                    <AlignLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 min-h-[300px]">
                            <AnimatePresence mode="wait">
                                {mode === 'bullets' ? (
                                    <motion.ul
                                        key="bullets"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-4"
                                    >
                                        {summary.bullets.map((point, i) => (
                                            <li key={i} className="flex gap-4 items-start group">
                                                <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {i + 1}
                                                </span>
                                                <p className="text-foreground dark:text-muted-foreground leading-relaxed text-lg">{point}</p>
                                            </li>
                                        ))}
                                    </motion.ul>
                                ) : (
                                    <motion.p
                                        key="paragraph"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="text-foreground dark:text-muted-foreground leading-loose text-lg whitespace-pre-line"
                                    >
                                        {summary.paragraph}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer / Actions */}
                        <div className="bg-secondary dark:bg-slate-900/50 p-6 border-t border-border dark:border-slate-700 flex justify-between items-center">
                            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-slate-200 font-medium text-sm">
                                Analyze Another File
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigator.clipboard.writeText(mode === 'bullets' ? summary.bullets.join('\n') : summary.paragraph)}
                                    className="px-4 py-2 bg-card dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg text-foreground dark:text-muted-foreground font-bold text-sm hover:bg-secondary dark:hover:bg-slate-700 transition-colors"
                                >
                                    Copy Text
                                </button>
                                {/* Share buttons could go here */}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

        </ToolLayout>
    )
}
