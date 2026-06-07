import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Eraser, Scissors, Copy } from 'lucide-react'

export default function TextCleanerTool() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')

    const clean = (type) => {
        let res = input
        if (type === 'trim') res = res.split('\n').map(l => l.trim()).filter(l => l).join('\n')
        if (type === 'dedup') res = [...new Set(res.split('\n'))].join('\n')
        if (type === 'oneline') res = res.replace(/[\n\r]+/g, ' ').trim()
        if (type === 'sort') res = res.split('\n').sort().join('\n')
        if (type === 'lowercase') res = res.toLowerCase()
        if (type === 'uppercase') res = res.toUpperCase()

        setOutput(res)
    }

    return (
        <ToolLayout title="Text Cleaner" description="Deduplicate, sort, trim, and format lists.">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[600px]">

                <div className="flex-1 flex flex-col bg-card rounded-3xl shadow p-4 border border-border">
                    <label className="font-bold text-muted-foreground mb-2">Input Text</label>
                    <textarea
                        value={input} onChange={e => setInput(e.target.value)}
                        className="flex-1 resize-none outline-none font-mono text-sm p-4 bg-secondary rounded-xl"
                        placeholder="Paste list here..."
                    />
                </div>

                <div className="flex flex-col justify-center gap-3 w-full md:w-48">
                    <ActionButton icon={<Scissors />} label="Trim Lines" onClick={() => clean('trim')} />
                    <ActionButton icon={<Eraser />} label="Dedup Lines" onClick={() => clean('dedup')} />
                    <ActionButton icon={<Scissors />} label="To One Line" onClick={() => clean('oneline')} />
                    <ActionButton icon={<Scissors />} label="Sort Lines" onClick={() => clean('sort')} />
                    <ActionButton icon={<Scissors />} label="UPPERCASE" onClick={() => clean('uppercase')} />
                    <ActionButton icon={<Scissors />} label="lowercase" onClick={() => clean('lowercase')} />
                </div>

                <div className="flex-1 flex flex-col bg-slate-900 rounded-3xl shadow p-4 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-muted-foreground">Cleaned Result</label>
                        <button onClick={() => navigator.clipboard.writeText(output)} className="text-muted-foreground hover:text-white"><Copy className="w-4 h-4" /></button>
                    </div>
                    <textarea
                        value={output} readOnly
                        className="flex-1 resize-none outline-none font-mono text-sm p-4 bg-transparent text-green-400"
                        placeholder="Result will appear here..."
                    />
                </div>

            </div>
        </ToolLayout>
    )
}

function ActionButton({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="p-3 bg-card text-slate-600 rounded-xl border border-border font-bold text-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2"
        >
            {icon} {label}
        </button>
    )
}
