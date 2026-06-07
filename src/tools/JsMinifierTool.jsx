import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileCode, ArrowRight, Copy } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function JsMinifierTool() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')

    const minify = () => {
        // Very basic simple minifier: remove comments and excessive whitespace
        // Note: For real production JS minification, we'd need a heavy library like Terser.
        // This is a "lite" version for simple scripts, safe for client-side.
        let minified = input
            .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
            .replace(/\/\/.*/g, '') // Line comments
            .replace(/\s+/g, ' ') // DANGEROUS: Basic space collapsing
            .replace(/\s*([=+\-*/{}();,])\s*/g, '$1') // Remove spaces around ops
            .trim()
        setOutput(minified)
        triggerConfetti()
    }

    return (
        <ToolLayout title="JS Minifier (Lite)" description="Basic JavaScript compression.">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                {/* Input */}
                <div className="flex flex-col bg-card rounded-3xl shadow-lg border border-border p-6">
                    <label className="text-sm font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                        <FileCode className="w-4 h-4" /> Input JavaScript
                    </label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={`function hello() {
    // Say hello
    console.log("Hello World");
}`}
                        className="flex-1 w-full bg-secondary border border-border rounded-xl p-4 font-mono text-sm resize-none outline-none focus:ring-2 ring-yellow-500"
                    />
                </div>

                {/* Output */}
                <div className="flex flex-col bg-slate-900 rounded-3xl shadow-lg border border-slate-800 p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                            <FileCode className="w-4 h-4" /> Minified Output
                        </label>
                        <button
                            onClick={() => navigator.clipboard.writeText(output)}
                            className="text-muted-foreground hover:text-white"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="flex-1 w-full bg-transparent text-yellow-400 font-mono text-sm resize-none outline-none"
                    />

                    <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 md:block hidden">
                        <button
                            onClick={minify}
                            className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="md:hidden mt-4">
                        <button
                            onClick={minify}
                            className="w-full py-3 bg-yellow-500 rounded-xl text-white font-bold"
                        >
                            Minify
                        </button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
