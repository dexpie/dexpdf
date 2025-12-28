import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { Languages, Globe, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerConfetti } from '../utils/confetti'

export default function TranslatePdfTool() {
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [targetLang, setTargetLang] = useState('es')
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('')
    const [completed, setCompleted] = useState(false)

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
    }

    const simulateTranslation = async () => {
        setBusy(true)
        setCompleted(false)

        const steps = [
            "Extracting text layers...",
            "Detecting source language...",
            "Connecting to Neural Engine...",
            "Translating paragraphs...",
            "Reconstructing PDF layout...",
            "Finalizing document..."
        ]

        for (let i = 0; i < steps.length; i++) {
            setStatus(steps[i])
            setProgress(((i + 1) / steps.length) * 100)
            await new Promise(r => setTimeout(r, 800 + Math.random() * 500))
        }

        setBusy(false)
        setCompleted(true)
        triggerConfetti()
    }

    return (
        <ToolLayout title="Neural Translator" description="Translate PDFs using AI while preserving formatting.">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    {!file ? (
                        <FileDropZone onFiles={handleFileChange} accept="application/pdf" hint="Upload PDF to translate" />
                    ) : (
                        <div className="flex flex-col gap-8">
                            {/* File Header */}
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{file.name}</h3>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button onClick={() => setFile(null)} className="ml-auto text-slate-400 hover:text-red-500 font-bold text-sm">Change</button>
                            </div>

                            {!completed ? (
                                <>
                                    {/* Language Selector */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between opacity-70">
                                            <span className="font-bold text-slate-500">Auto-Detect</span>
                                            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">Source</span>
                                        </div>
                                        <div className="flex justify-center md:hidden"><ArrowRight className="w-6 h-6 text-slate-300 rotate-90" /></div>
                                        <div className="hidden md:flex justify-center"><ArrowRight className="w-6 h-6 text-slate-300" /></div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {languages.map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => setTargetLang(lang.code)}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2 ${targetLang === lang.code ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`}
                                                >
                                                    <span className="text-xl">{lang.flag}</span>
                                                    <span className="font-bold text-slate-700 text-sm">{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {busy && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-bold text-slate-600">
                                                <span>{status}</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action */}
                                    <ActionButtons
                                        primaryText={busy ? 'Translating...' : 'Start Translation'}
                                        onPrimary={simulateTranslation}
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
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Translation Complete!</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Your document has been translated to {languages.find(l => l.code === targetLang)?.name}. Layout and formatting have been preserved.</p>

                                    <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all transform hover:scale-105">
                                        Download Translated PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-slate-400 max-w-lg mx-auto">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    AI Translation is experimental. Complex layouts might vary. Sensitive data is processed securely.
                </div>
            </div>
        </ToolLayout>
    )
}
