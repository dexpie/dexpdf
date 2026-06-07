import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileDiff, ArrowRight, ArrowLeft } from 'lucide-react'
import * as Diff from 'diff'

export default function TextDiffTool() {
    const [oldText, setOldText] = useState('')
    const [newText, setNewText] = useState('')
    const [differences, setDifferences] = useState([])

    useEffect(() => {
        if (!oldText && !newText) {
            setDifferences([])
            return
        }

        const diff = Diff.diffLines(oldText, newText)
        setDifferences(diff)

    }, [oldText, newText])

    return (
        <ToolLayout title="Text Diff" description="Compare two blocks of text to find differences.">
            <div className="max-w-6xl mx-auto flex flex-col gap-8 h-full">

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-muted-foreground text-sm">Original Text</label>
                        <textarea
                            value={oldText}
                            onChange={e => setOldText(e.target.value)}
                            className="flex-1 p-4 rounded-2xl border border-border outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all font-mono text-xs resize-none"
                            placeholder="Paste original text here..."
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-muted-foreground text-sm">New Text</label>
                        <textarea
                            value={newText}
                            onChange={e => setNewText(e.target.value)}
                            className="flex-1 p-4 rounded-2xl border border-border outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all font-mono text-xs resize-none"
                            placeholder="Paste modified text here..."
                        />
                    </div>
                </div>

                {/* Diff Output */}
                <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border flex flex-col">
                    <div className="bg-secondary p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <FileDiff className="w-5 h-5" /> Comparison Result
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                            <span className="flex items-center gap-1 text-red-500"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div> Removed</span>
                            <span className="flex items-center gap-1 text-green-600"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div> Added</span>
                        </div>
                    </div>
                    <div className="p-0 overflow-auto max-h-[500px] bg-slate-900 text-muted-foreground font-mono text-sm leading-relaxed">
                        {differences.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">Differences will appear here...</div>
                        ) : (
                            differences.map((part, index) => {
                                const color = part.added ? 'bg-green-900/30 text-green-400 border-l-4 border-green-500' :
                                    part.removed ? 'bg-red-900/30 text-red-400 border-l-4 border-red-500' :
                                        'text-muted-foreground border-l-4 border-transparent hover:bg-slate-800'

                                return (
                                    <pre
                                        key={index}
                                        className={`whitespace-pre-wrap py-1 px-4 ${color}`}
                                    >
                                        {part.value}
                                    </pre>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
