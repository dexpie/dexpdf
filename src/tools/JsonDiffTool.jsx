import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileDiff, Braces } from 'lucide-react'
import * as Diff from 'diff'

export default function JsonDiffTool() {
    const [left, setLeft] = useState('{\n  "name": "DexPDF",\n  "version": 1.0\n}')
    const [right, setRight] = useState('{\n  "name": "DexPDF Pro",\n  "version": 2.0\n}')
    const [diffs, setDiffs] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        try {
            // Validate JSON
            const lObj = JSON.parse(left)
            const rObj = JSON.parse(right)

            // Pretty print for better line diffing
            const lStr = JSON.stringify(lObj, null, 2)
            const rStr = JSON.stringify(rObj, null, 2)

            const d = Diff.diffLines(lStr, rStr)
            setDiffs(d)
            setError(null)
        } catch (e) {
            setError("Invalid JSON on one or both sides.")
            setDiffs([])
        }
    }, [left, right])

    return (
        <ToolLayout title="JSON Diff" description="Compare two JSON objects semantically.">
            <div className="max-w-6xl mx-auto h-[700px] flex flex-col gap-6">

                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4 h-1/3">
                    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="p-2 border-b text-xs font-bold text-slate-400 uppercase bg-slate-50 rounded-t-2xl pl-4">Original JSON</div>
                        <textarea
                            value={left}
                            onChange={e => setLeft(e.target.value)}
                            className="flex-1 w-full p-4 font-mono text-xs resize-none outline-none rounded-b-2xl"
                        />
                    </div>
                    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="p-2 border-b text-xs font-bold text-slate-400 uppercase bg-slate-50 rounded-t-2xl pl-4">New JSON</div>
                        <textarea
                            value={right}
                            onChange={e => setRight(e.target.value)}
                            className="flex-1 w-full p-4 font-mono text-xs resize-none outline-none rounded-b-2xl"
                        />
                    </div>
                </div>

                {/* Output */}
                <div className="flex-1 bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col border border-slate-800">
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-slate-300">
                            <FileDiff className="w-5 h-5" /> Semantic Difference
                        </div>
                        {error && <span className="text-red-400 text-xs font-bold bg-red-900/50 px-3 py-1 rounded-full">{error}</span>}
                    </div>

                    <div className="flex-1 overflow-auto p-0 font-mono text-sm">
                        {diffs.map((part, i) => {
                            const color = part.added ? 'bg-green-900/30 text-green-400 border-l-4 border-green-500'
                                : part.removed ? 'bg-red-900/30 text-red-400 border-l-4 border-red-500'
                                    : 'text-slate-400 border-l-4 border-transparent'
                            return (
                                <pre key={i} className={`px-4 py-0.5 whitespace-pre-wrap ${color}`}>
                                    {part.value}
                                </pre>
                            )
                        })}
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
