'use client'
import React, { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import AiChatWindow from '../components/AiChatWindow'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Sparkles, Loader2, BrainCircuit, ChevronRight, Zap } from 'lucide-react'

import { getStoredApiKey, setStoredApiKey, generateContent } from '../services/gemini'

configurePdfWorker()

const ApiKeyModal = ({ onSave, onClose }) => {
    const [input, setInput] = useState('')
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Enable AI Intelligence</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        To use the real AI features, please enter your free Google Gemini API Key.
                    </p>
                </div>
                <input
                    type="password"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter Gemini API Key"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 mb-4 focus:ring-2 ring-blue-500 outline-none"
                />
                <button
                    onClick={() => { if (input) onSave(input) }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                >
                    Save & Continue
                </button>
                <div className="mt-4 text-center">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                        Get a free API Key here
                    </a>
                </div>
            </div>
        </div>
    )
}

const QUICK_PROMPTS = [
    { label: "Summarize this document", query: "Summarize this document in 3-5 bullet points." },
    { label: "What are the key dates?", query: "List all important dates and deadlines found in the text." },
    { label: "Find contact info", query: "Extract any email addresses and phone numbers." },
    { label: "Explain the main topic", query: "Explain the main topic of this document in simple terms." }
]

export default function ChatPdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [extractedText, setExtractedText] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
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

    // Local Intelligence Logic
    const generateResponse = async (query) => {
        if (!apiKey) {
            setShowKeyModal(true)
            return
        }

        setIsTyping(true)

        try {
            const prompt = `
            You are an intelligent PDF assistant. 
            Here is the content of the document:
            """
            ${extractedText.slice(0, 100000)} 
            """
            
            User Question: ${query}
            
            Answer the user's question based ONLY on the document provided. 
            If the answer is not in the document, say so politely.
            Keep your answer concise and helpful. Use Markdown formatting.
            `
            const responseText = await generateContent(apiKey, prompt)
            setMessages(prev => [...prev, { role: 'ai', content: responseText }])

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'ai', content: "Error: Failed to connect to AI. Please check your API Key." }])
            // If error is 400/401, maybe clear key?
            if (error.message?.includes('400') || error.message?.includes('401')) {
                setStoredApiKey('')
                setApiKey('')
            }
        } finally {
            setIsTyping(false)
        }
    }

    const handleFileChange = async (files) => {
        const f = files[0]
        if (!f) return
        setFile(f)
        setIsProcessing(true)
        setMessages([])
        setExtractedText('')

        try {
            const buffer = await f.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
            let fullText = ''

            const maxPages = Math.min(pdf.numPages, 15) // Increased limit
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items.map(item => item.str).join(' ')
                fullText += pageText + '\n'
            }

            setExtractedText(fullText)

            // Quick Insights for Greeting
            const pageCount = pdf.numPages
            const wordCount = fullText.split(/\s+/).length
            const hasEmails = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(fullText)

            setMessages([{
                role: 'ai',
                content: `Hello! I've read **${f.name}** (${pageCount} pages, ~${wordCount} words). \n\nI can help you summarize it, find specific details, or ${hasEmails ? 'extract contact info' : 'locate key topics'}.`
            }])

        } catch (err) {
            console.error(err)
            setMessages([{ role: 'ai', content: "Error: I couldn't read this PDF. It might be scanned (image-only) or encrypted." }])
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSendMessage = (text) => {
        setMessages(prev => [...prev, { role: 'user', content: text }])
        generateResponse(text)
    }

    return (
        <ToolLayout title="Chat with PDF 2.0" description="Ask questions and get answers from your document using Google Gemini AI">

            <AnimatePresence>
                {showKeyModal && <ApiKeyModal onSave={handleSaveKey} onClose={() => setShowKeyModal(false)} />}
            </AnimatePresence>

            {!file ? (
                <FileDropZone
                    onFiles={handleFileChange}
                    accept="application/pdf"
                    hint="Upload PDF to start chatting"
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[650px]">
                    {/* Visualizer / File Info */}
                    <div className="hidden lg:flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-sm">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>{file.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                                <div className="space-y-2">
                                    {QUICK_PROMPTS.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(prompt.query)}
                                            disabled={isProcessing || isTyping}
                                            className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium flex items-center justify-between group text-slate-700 dark:text-slate-300"
                                        >
                                            {prompt.label}
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700 h-32 overflow-y-auto">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Raw Content</h4>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2 text-indigo-500">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                                        </span>
                                    ) : (
                                        extractedText.slice(0, 300) + "..."
                                    )}
                                </p>
                            </div>

                            <button onClick={() => setFile(null)} className="mt-4 text-sm text-red-500 font-medium hover:underline text-left">
                                Change File
                            </button>
                        </motion.div>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-2">
                        <AiChatWindow
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isTyping={isTyping || isProcessing}
                        />
                    </div>
                </div>
            )}

        </ToolLayout>
    )
}
