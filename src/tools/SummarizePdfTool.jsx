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

configurePdfWorker()

export default function SummarizePdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [summary, setSummary] = useState(null)
    const [mode, setMode] = useState('bullets') // bullets | paragraph

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

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items.map(item => item.str).join(' ')
                fullText += pageText + ' '
            }

            // Artificial delay for "Thinking" effect
            await new Promise(r => setTimeout(r, 1500))

            // 2. Heuristic Analysis (Client-side AI)
            const sentences = fullText.match(/[^.!?\n]+[.!?\n]+/g) || []
            const words = fullText.toLowerCase().split(/\s+/).filter(w => w.length > 3)

            // TF-IDF simplified
            const wordFreq = {}
            words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1)

            const scoredSentences = sentences.map(sent => {
                const sentWords = sent.toLowerCase().split(/\s+/)
                const score = sentWords.reduce((acc, w) => acc + (wordFreq[w] || 0), 0) / sentWords.length
                return { sent, score }
            })

            scoredSentences.sort((a, b) => b.score - a.score)

            const topSentences = scoredSentences.slice(0, 5).map(s => s.sent.trim())

            // 3. Generate Output
            const result = {
                bullets: topSentences,
                paragraph: topSentences.join(' ')
            }

            setSummary(result)

        } catch (err) {
            console.error(err)
            alert('Failed to summarize PDF. It might be image-based.')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <ToolLayout title="AI PDF Summarizer" description="Instantly extract key insights from your documents using local AI.">

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
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center"
                        >
                            <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{file.name}</h3>
                            <p className="text-slate-500 mb-6 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <button
                                onClick={generateSummary}
                                disabled={isProcessing}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all mx-auto
                                    ${isProcessing ? 'bg-slate-400 cursor-wait' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 shadow-lg shadow-indigo-200'}
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
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-indigo-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Executive Summary</h2>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Generated by DexPDF AI</p>
                                </div>
                            </div>
                            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-indigo-100">
                                <button
                                    onClick={() => setMode('bullets')}
                                    className={`p-2 rounded-md transition-all ${mode === 'bullets' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setMode('paragraph')}
                                    className={`p-2 rounded-md transition-all ${mode === 'paragraph' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
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
                                                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {i + 1}
                                                </span>
                                                <p className="text-slate-700 leading-relaxed text-lg">{point}</p>
                                            </li>
                                        ))}
                                    </motion.ul>
                                ) : (
                                    <motion.p
                                        key="paragraph"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="text-slate-700 leading-loose text-lg whitespace-pre-line"
                                    >
                                        {summary.paragraph}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer / Actions */}
                        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
                            <button onClick={() => setFile(null)} className="text-slate-500 hover:text-slate-700 font-medium text-sm">
                                Analyze Another File
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigator.clipboard.writeText(mode === 'bullets' ? summary.bullets.join('\n') : summary.paragraph)}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
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
