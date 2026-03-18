'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Mic, Sparkles } from 'lucide-react'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'

export default function DexAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I am Dex. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)
    const { isListening, transcript, startListening } = useVoiceCommands()

    useEffect(() => {
        if (transcript) setInput(transcript)
    }, [transcript])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(scrollToBottom, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setInput('')

        setMessages(prev => [...prev, { role: 'assistant', text: '...', thinking: true }])

        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000))

        let response = "I'm not sure how to do that yet."
        const lower = userMsg.toLowerCase()

        if (lower.includes('merge')) response = "I can help you merge files! Go to the Merge Tool."
        else if (lower.includes('compress') || lower.includes('shrink')) response = "Opening Compress Tool..."
        else if (lower.includes('hello') || lower.includes('hi')) response = "Hello! Ready to work on some PDFs?"
        else if (lower.includes('joke')) response = "Why did the PDF go to therapy? It had too much attachment issues."

        setMessages(prev => {
            const newHist = prev.filter(m => !m.thinking)
            return [...newHist, { role: 'assistant', text: response }]
        })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend()
    }

    return (
        <>
            {/* Floating Button - simple, no scale effects */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:bg-blue-700 transition-colors"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-8 h-8" />}
            </button>

            {/* Chat Window - CSS transition */}
            <div className={`chat-window fixed bottom-40 md:bottom-24 right-6 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 flex flex-col max-h-[500px] ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold">Dex AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                            <span className="text-xs text-slate-300">Online</span>
                        </div>
                    </div>
                    <Sparkles className="w-5 h-5 ml-auto text-yellow-300 opacity-50" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium
                                ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-sm'}
                            `}>
                                {m.thinking ? (
                                    <div className="flex gap-1 h-5 items-center">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                ) : m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Dex..."
                            className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                            onClick={startListening}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-100' : 'text-slate-400 hover:bg-slate-200'}`}
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    )
}
