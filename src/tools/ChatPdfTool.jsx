'use client'
import React, { useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import AiChatWindow from '../components/AiChatWindow'
import { motion } from 'framer-motion'
import { FileText, Sparkles, Loader2 } from 'lucide-react'

configurePdfWorker()

export default function ChatPdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [extractedText, setExtractedText] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)

    // Local Intelligence Logic
    const generateResponse = async (query) => {
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800)) // Natural delay

        const lowerQuery = query.toLowerCase()
        let response = t('chat.default_response', "I couldn't find information specifically matching that in the document.")

        // 1. Check for basic intents
        const isSummary = /summary|ringkas|rangkum|explain|jelaskan/i.test(lowerQuery)
        const isContact = /email|contact|phone|hubung|telp/i.test(lowerQuery)

        if (extractedText) {
            // Split into sentences (more robust regex)
            const sentences = extractedText.match(/[^.!?\n]+[.!?\n]+/g) || []

            if (isSummary) {
                // Heuristic: First paragraph + Last paragraph usually contains the gist
                const start = sentences.slice(0, 5).join(' ')
                const end = sentences.slice(-5).join(' ')
                response = `**Summary:**\n\n${start}\n\n...\n\n${end}\n\n(This is a generated summary based on the beginning and end of the document.)`
            }
            else if (isContact) {
                const emails = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
                const phones = extractedText.match(/(\+62|08)[0-9-]{8,13}/g) || []

                if (emails.length || phones.length) {
                    response = `**Found Contacts:**\n` +
                        (emails.length ? `\n📧 Emails:\n- ${[...new Set(emails)].join('\n- ')}` : '') +
                        (phones.length ? `\n📱 Phones:\n- ${[...new Set(phones)].join('\n- ')}` : '')
                } else {
                    response = "I searched for contact information (emails/phones) but couldn't find any in the text."
                }
            }
            else {
                // Smart Search: Keyword Scoring
                const stopWords = ['the', 'and', 'is', 'in', 'at', 'of', 'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'adalah', 'untuk']
                const keywords = lowerQuery.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w))

                if (keywords.length === 0) {
                    response = "Please ask a more specific question so I can search the document."
                } else {
                    // Score sentences
                    const scored = sentences.map((sent, idx) => {
                        let score = 0
                        const lowerSent = sent.toLowerCase()
                        keywords.forEach(k => {
                            if (lowerSent.includes(k)) score += 1
                        })
                        return { sent, idx, score }
                    })

                    // Get top 3
                    const topMatches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)

                    if (topMatches.length > 0) {
                        // Build context (add previous/next sentence for flow)
                        const contextBlocks = topMatches.map(match => {
                            const prev = sentences[match.idx - 1] || ''
                            const next = sentences[match.idx + 1] || ''
                            return `> "...${prev} **${match.sent.trim()}** ${next}..."`
                        })

                        response = `Here is what I found regarding "**${keywords.join(' ')}**":\n\n${contextBlocks.join('\n\n')}`
                    }
                }
            }
        }

        setMessages(prev => [...prev, { role: 'ai', content: response }])
        setIsTyping(false)
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
                content: `Hello! I've read **${f.name}** (${pageCount} pages, ~${wordCount} words). \n\nI can help you summarize it, find specific details, or ${hasEmails ? 'extract contact info' : 'locate key topics'}. What would you like to know?`
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
        <ToolLayout title="Chat with PDF" description="Ask questions and get answers from your document using AI">

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
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col"
                        >
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={file.name}>{file.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1 overflow-y-auto">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Extracted Context (Preview)</h4>
                                <p className="text-xs text-slate-600 leading-relaxed font-mono">
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2 text-indigo-500">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Reading document...
                                        </span>
                                    ) : (
                                        extractedText.slice(0, 500) + "..."
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
