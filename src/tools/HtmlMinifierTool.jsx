import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileCode, ArrowRight, Copy, Download } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function HtmlMinifierTool() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')

    const minify = () => {
        let minified = input
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/>\s+</g, '><') // Remove whitespace between tags
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .trim()
        setOutput(minified)
        triggerConfetti()
    }

    return (
        <ToolLayout title="HTML Minifier" description="Compress HTML code by removing whitespace and comments.">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                {/* Input */}
                <div className="flex flex-col bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                    <label className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                        <FileCode className="w-4 h-4" /> Input HTML
                    </label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="<div class='foo'>
    <span>  Hello  </span>
    <!-- Comment -->
</div>"
                        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm resize-none outline-none focus:ring-2 ring-blue-500"
                    />
                </div>

                {/* Output */}
                <div className="flex flex-col bg-slate-900 rounded-3xl shadow-lg border border-slate-800 p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                            <FileCode className="w-4 h-4" /> Minified Output
                        </label>
                        <button
                            onClick={() => navigator.clipboard.writeText(output)}
                            className="text-slate-400 hover:text-white"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="flex-1 w-full bg-transparent text-green-400 font-mono text-sm resize-none outline-none"
                    />

                    <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 md:block hidden">
                        <button
                            onClick={minify}
                            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="md:hidden mt-4">
                        <button
                            onClick={minify}
                            className="w-full py-3 bg-blue-600 rounded-xl text-white font-bold"
                        >
                            Minify
                        </button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
