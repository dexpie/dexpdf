import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Type, AlignLeft, Hash, Clock, Copy, Trash2 } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function TextAnalyzerTool() {
    const [text, setText] = useState('')

    const stats = {
        chars: text.length,
        words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
        lines: text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length,
        time: Math.ceil(text.trim().split(/\s+/).length / 200) // Avg reading speed
    }

    const transform = (type) => {
        let newText = text
        if (type === 'upper') newText = text.toUpperCase()
        if (type === 'lower') newText = text.toLowerCase()
        if (type === 'title') {
            newText = text.replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            )
        }
        if (type === 'sentence') {
            newText = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase())
        }
        if (type === 'reverse') newText = text.split('').reverse().join('')

        setText(newText)
    }

    const copy = () => {
        navigator.clipboard.writeText(text)
        triggerConfetti()
    }

    return (
        <ToolLayout title="Text Analyzer" description="Count words, characters, and convert text case.">
            <div className="max-w-5xl mx-auto h-[600px] flex flex-col md:flex-row gap-6">
                {/* Stats */}
                <div className="w-full md:w-64 space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Words</div>
                        <div className="text-3xl font-black text-slate-800">{stats.words}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Characters</div>
                        <div className="text-3xl font-black text-slate-800">{stats.chars}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Lines</div>
                        <div className="text-3xl font-black text-slate-800">{stats.lines}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Reading Time</div>
                        <div className="text-xl font-black text-slate-800">{stats.time} min</div>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap gap-2">
                        <button onClick={() => transform('upper')} className="px-3 py-1 rounded bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100">UPPERCASE</button>
                        <button onClick={() => transform('lower')} className="px-3 py-1 rounded bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100">lowercase</button>
                        <button onClick={() => transform('title')} className="px-3 py-1 rounded bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100">Title Case</button>
                        <button onClick={() => transform('sentence')} className="px-3 py-1 rounded bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100">Sentence case</button>
                        <button onClick={() => transform('reverse')} className="px-3 py-1 rounded bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100">esreveR</button>
                    </div>

                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type or paste your text here to analyze..."
                        className="flex-1 w-full p-6 resize-none outline-none font-sans text-lg leading-relaxed text-slate-700"
                    />

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
                        <button onClick={() => setText('')} className="flex items-center gap-2 text-red-500 font-bold text-sm hover:text-red-600">
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>
                        <button onClick={copy} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 shadow-lg">
                            <Copy className="w-4 h-4" /> Copy Text
                        </button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
