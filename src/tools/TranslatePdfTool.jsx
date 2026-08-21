import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { Languages, Globe, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerConfetti } from '../utils/confetti'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import { getStoredApiKey, setStoredApiKey, generateContent } from '../services/gemini'

configurePdfWorker()

const ApiKeyModal = ({ onSave, onClose }) => {
    const [input, setInput] = useState('')
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border dark:border-slate-700">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground dark:text-slate-200">Enable AI Translation</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">
                        To translate documents, please enter your free Google Gemini API Key.
                        It stays in this browser tab and requests go straight to Google — never through our servers.
                    </p>
                </div>
                <input
                    type="password"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter Gemini API Key"
                    className="w-full p-3 rounded-xl border border-border dark:border-slate-600 bg-secondary dark:bg-slate-900 text-foreground dark:text-slate-200 mb-4 focus:ring-2 ring-blue-500 outline-none"
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

export default function TranslatePdfTool() {
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [targetLang, setTargetLang] = useState('es')
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('')
    const [completed, setCompleted] = useState(false)
    const [translatedText, setTranslatedText] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [showKeyModal, setShowKeyModal] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const key = getStoredApiKey()
        if (key) setApiKey(key)
    }, [])

    const handleSaveKey = (key) => {
        setStoredApiKey(key)
        setApiKey(key)
        setShowKeyModal(false)
    }

    const languages = [
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    ]

    const handleFileChange = (files) => {
        if (files[0]) setFile(files[0])
        setCompleted(false)
        setProgress(0)
        setError('')
    }

    const startTranslation = async () => {
        if (!apiKey) {
            setShowKeyModal(true)
            return
        }
        setBusy(true)
        setCompleted(false)
        setTranslatedText('')
        setError('')

        try {
            // 1. Extract Text
            setStatus("Extracting text from PDF...")
            setProgress(10)

            const buffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
            let fullText = ''
            const maxPages = Math.min(pdf.numPages, 5) // Limit to 5 pages for translation to avoid huge context

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items.map(item => item.str).join(' ')
                fullText += pageText + '\n\n'
                setProgress(10 + (i / maxPages) * 30) // up to 40%
            }
            if (!fullText.trim()) throw new Error('No extractable text found. Run OCR first for scanned PDFs.')

            // 2. Translate with Gemini
            setStatus("AI Translating (this may take a moment)...")
            setProgress(50)

            const targetLangName = languages.find(l => l.code === targetLang)?.name || targetLang
            const prompt = `
            Translate the following text to ${targetLangName}. 
            Maintain the original tone and structure as much as possible.
            Output ONLY the translated text.

            Text:
            """
            ${fullText.slice(0, 30000)}
            """
            `

            try {
                const result = await generateContent(apiKey, prompt)
                setTranslatedText(result)
                setStatus("Finalizing...")
                setProgress(100)
                setCompleted(true)
                triggerConfetti()
            } catch (error) {
                if (error.message?.includes('API Key')) {
                    setShowKeyModal(true)
                    setBusy(false)
                    return
                }
                throw error
            }

        } catch (error) {
            console.error("Translation Error:", error)
            setError(error.message || 'Translation failed. Check the API key or try another file.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Translate PDF Text" description="Extract and translate text from the first five PDF pages using Gemini.">
            <AnimatePresence>
                {showKeyModal && <ApiKeyModal onSave={handleSaveKey} onClose={() => setShowKeyModal(false)} />}
            </AnimatePresence>
            <div className="max-w-4xl mx-auto">
                <div className="bg-card dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-border dark:border-slate-700 transition-colors">
                    {!file ? (
                        <FileDropZone onFiles={handleFileChange} accept="application/pdf" hint="Upload PDF to translate" />
                    ) : (
                        <div className="flex flex-col gap-8">
                            {/* File Header */}
                            <div className="flex items-center gap-4 bg-secondary dark:bg-slate-900 p-4 rounded-2xl border border-border dark:border-slate-700">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-slate-200">{file.name}</h3>
                                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button onClick={() => setFile(null)} className="ml-auto text-muted-foreground hover:text-red-500 font-bold text-sm transition-colors">Change</button>
                            </div>

                            {!completed ? (
                                <>
                                    {/* Language Selector */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div className="p-4 rounded-2xl border-2 border-border dark:border-slate-700 bg-secondary dark:bg-slate-900 flex items-center justify-between opacity-70">
                                            <span className="font-bold text-muted-foreground dark:text-muted-foreground">Auto-Detect</span>
                                            <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-muted-foreground">Source</span>
                                        </div>
                                        <div className="flex justify-center md:hidden"><ArrowRight className="w-6 h-6 text-muted-foreground dark:text-slate-600 rotate-90" /></div>
                                        <div className="hidden md:flex justify-center"><ArrowRight className="w-6 h-6 text-muted-foreground dark:text-slate-600" /></div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {languages.map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => setTargetLang(lang.code)}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2 ${targetLang === lang.code ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-900/50' : 'border-border dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-secondary dark:hover:bg-slate-800'}`}
                                                >
                                                    <span className="text-xl">{lang.flag}</span>
                                                    <span className="font-bold text-foreground dark:text-slate-200 text-sm">{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {busy && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-muted-foreground">
                                                <span>{status}</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action */}
                                    {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
                                    <ActionButtons
                                        primaryText={busy ? 'Translating...' : 'Start Translation'}
                                        onPrimary={startTranslation}
                                        loading={busy}
                                        icon={Languages}
                                        className="w-full"
                                    />
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">Translation Complete!</h3>
                                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">Your document has been translated to {languages.find(l => l.code === targetLang)?.name}.</p>

                                    <div className="bg-secondary dark:bg-slate-900 p-6 rounded-xl border border-border dark:border-slate-700 text-left max-h-96 overflow-y-auto mb-6 whitespace-pre-wrap">
                                        {translatedText}
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(translatedText)}
                                            className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-bold hover:bg-secondary transition-all"
                                        >
                                            Copy Text
                                        </button>
                                        <button
                                            onClick={() => {
                                                const blob = new Blob([translatedText], { type: 'text/plain' })
                                                const url = URL.createObjectURL(blob)
                                                const a = document.createElement('a')
                                                a.href = url
                                                a.download = `translated_${targetLang}.txt`
                                                a.click()
                                            }}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all transform hover:scale-105"
                                        >
                                            Download Text
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-muted-foreground max-w-lg mx-auto">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Translation is experimental. Extracted text is sent to Google Gemini when you run this tool.
                </div>
            </div>
        </ToolLayout>
    )
}
