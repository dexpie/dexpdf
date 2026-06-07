import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Braces, Copy, Minimize2, AlignLeft, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function JsonFormatterTool() {
    const [input, setInput] = useState('')
    const [error, setError] = useState(null)
    const [mode, setMode] = useState('format') // format | minify

    const handleFormat = () => {
        try {
            if (!input.trim()) return
            const obj = JSON.parse(input)
            const result = JSON.stringify(obj, null, 2)
            setInput(result)
            setError(null)
            setMode('format')
            triggerConfetti()
        } catch (e) {
            setError(e.message)
        }
    }

    const handleMinify = () => {
        try {
            if (!input.trim()) return
            const obj = JSON.parse(input)
            const result = JSON.stringify(obj)
            setInput(result)
            setError(null)
            setMode('minify')
        } catch (e) {
            setError(e.message)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(input)
        alert('Copied to clipboard!')
    }

    const clear = () => {
        setInput('')
        setError(null)
    }

    return (
        <ToolLayout title="JSON Formatter" description="Validate, prettify, and minify JSON data.">
            <div className="max-w-5xl mx-auto h-[600px] flex flex-col">
                {/* Toolbar */}
                <div className="bg-card p-4 rounded-t-3xl border border-border border-b-0 flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={handleFormat}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold transition-colors"
                        >
                            <AlignLeft className="w-4 h-4" /> Prettify
                        </button>
                        <button
                            onClick={handleMinify}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-slate-600 rounded-lg hover:bg-slate-100 font-bold transition-colors"
                        >
                            <Minimize2 className="w-4 h-4" /> Minify
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold transition-colors"
                        >
                            <Copy className="w-4 h-4" /> Copy
                        </button>
                        <button
                            onClick={clear}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 relative">
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            setError(null)
                        }}
                        placeholder="Paste your JSON here..."
                        className={`
                            w-full h-full p-6 font-mono text-sm resize-none focus:outline-none border-2 rounded-b-3xl
                            ${error ? 'border-red-300 bg-red-50 text-red-900' : 'border-border bg-slate-900 text-green-400'}
                        `}
                    />

                    {/* Status Indicator */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold pointer-events-none">
                        {error ? (
                            <>
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-red-200">Invalid JSON</span>
                            </>
                        ) : input.trim() ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-200">Valid JSON</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">Waiting for input...</span>
                        )}
                    </div>
                </div>

                {/* Detailed Error */}
                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-xl font-mono text-sm border border-red-200">
                        Error: {error}
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
