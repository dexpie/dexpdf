import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Link2, ArrowDownUp, Copy } from 'lucide-react'

export default function UrlEncoderTool() {
    const [input, setInput] = useState('')
    const [encoded, setEncoded] = useState('')
    const [decoded, setDecoded] = useState('')

    const handleInput = (val) => {
        setInput(val)
        try {
            setEncoded(encodeURIComponent(val))
            setDecoded(decodeURIComponent(val))
        } catch (e) {
            // ignore
        }
    }

    return (
        <ToolLayout title="URL Encoder / Decoder" description="Safe URL formatting.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                    <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">Input String</label>
                    <textarea
                        value={input}
                        onChange={e => handleInput(e.target.value)}
                        placeholder="Paste URL or text here..."
                        className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 ring-blue-500 font-mono text-sm h-32 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultBox label="Encoded" value={encoded} color="blue" />
                    <ResultBox label="Decoded" value={decoded} color="green" />
                </div>

            </div>
        </ToolLayout>
    )
}

function ResultBox({ label, value, color }) {
    return (
        <div className={`bg-card rounded-3xl shadow-md border border-border overflow-hidden flex flex-col`}>
            <div className={`p-4 bg-${color}-50 border-b border-${color}-100 flex justify-between items-center`}>
                <span className={`font-bold text-${color}-600`}>{label}</span>
                <button onClick={() => navigator.clipboard.writeText(value)} className="text-muted-foreground hover:text-muted-foreground">
                    <Copy className="w-4 h-4" />
                </button>
            </div>
            <textarea
                value={value}
                readOnly
                className="flex-1 p-4 resize-none outline-none font-mono text-sm text-foreground bg-card h-40"
            />
        </div>
    )
}
