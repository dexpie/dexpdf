import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { ArrowDownUp, Copy, Trash2, Code } from 'lucide-react'

export default function Base64Tool() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [mode, setMode] = useState('encode') // encode | decode

    const process = (val, currentMode) => {
        setInput(val)
        try {
            if (!val) {
                setOutput('')
                return
            }
            if (currentMode === 'encode') {
                setOutput(btoa(val))
            } else {
                setOutput(atob(val))
            }
        } catch (e) {
            setOutput('Invalid Input')
        }
    }

    const toggleMode = () => {
        const newMode = mode === 'encode' ? 'decode' : 'encode'
        setMode(newMode)
        // Swap values
        const temp = input
        setInput(output)
        process(output, newMode)
    }

    return (
        <ToolLayout title="Base64 Converter" description="Encode and decode text to Base64 format.">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col gap-4">
                    {/* Input */}
                    <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                                {mode === 'encode' ? 'Text' : 'Base64'}
                            </label>
                            <button onClick={() => setInput('')} className="text-muted-foreground hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={input}
                            onChange={e => process(e.target.value, mode)}
                            placeholder={mode === 'encode' ? "Type text to encode..." : "Paste Base64 to decode..."}
                            className="w-full h-32 resize-none bg-secondary border-none rounded-xl p-4 focus:ring-2 ring-blue-500 outline-none font-mono text-sm"
                        />
                    </div>

                    {/* Switcher */}
                    <div className="flex justify-center">
                        <button
                            onClick={toggleMode}
                            className="bg-slate-900 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                        >
                            <ArrowDownUp className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Output */}
                    <div className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800 relative group">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                                {mode === 'encode' ? 'Base64' : 'Text'}
                            </label>
                            <button
                                onClick={() => navigator.clipboard.writeText(output)}
                                className="text-muted-foreground hover:text-white"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={output}
                            placeholder="Result will appear here..."
                            className="w-full h-32 resize-none bg-transparent text-green-400 border-none outline-none font-mono text-sm"
                        />
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
