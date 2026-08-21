import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Clock, ArrowRight, Calendar, Copy } from 'lucide-react'

export default function UnixTimestampTool() {
    const [now, setNow] = useState(Math.floor(Date.now() / 1000))
    const [input, setInput] = useState('')
    const [output, setOutput] = useState(null)
    const [reverseInput, setReverseInput] = useState('') // ISO Date string
    const [reverseOutput, setReverseOutput] = useState(null)

    useEffect(() => {
        const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
        return () => clearInterval(interval)
    }, [])

    const convertToDate = () => {
        if (!input) return
        const ts = parseInt(input)
        if (isNaN(ts)) {
            setOutput('Invalid Timestamp')
            return
        }
        // Detect if ms (13 digits) or s (10 digits)
        const date = new Date(input.length > 11 ? ts : ts * 1000)
        setOutput(date.toString())
    }

    const convertToTimestamp = () => {
        const date = new Date(reverseInput)
        if (isNaN(date.getTime())) {
            setReverseOutput('Invalid Date')
            return
        }
        setReverseOutput(Math.floor(date.getTime() / 1000))
    }

    return (
        <ToolLayout title="Unix Timestamp Converter" description="Convert Epoch time to human dates.">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Current Time */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl text-center shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Current Unix Timestamp</div>
                        <div className="text-6xl font-black font-mono tracking-tighter text-green-400 mb-4">{now}</div>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setNow(prev => prev)} className="px-4 py-2 bg-card/10 hover:bg-card/20 rounded-lg text-sm font-bold">Refresh</button>
                            <button onClick={() => navigator.clipboard.writeText(now.toString())} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold">Copy</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Timestamp -> Date */}
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" /> Timestamp to Date
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="1672531200"
                                className="flex-1 p-3 bg-secondary border border-border rounded-xl font-mono text-sm"
                            />
                            <button onClick={convertToDate} className="p-3 bg-blue-600 text-white rounded-xl">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        {output && (
                            <div className="p-4 bg-secondary rounded-xl border border-border">
                                <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Result</div>
                                <div className="font-bold text-foreground break-words">{output}</div>
                            </div>
                        )}
                    </div>

                    {/* Date -> Timestamp */}
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" /> Date to Timestamp
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="datetime-local"
                                value={reverseInput}
                                onChange={e => setReverseInput(e.target.value)}
                                className="flex-1 p-3 bg-secondary border border-border rounded-xl font-mono text-sm"
                            />
                            <button onClick={convertToTimestamp} className="p-3 bg-purple-600 text-white rounded-xl">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        {reverseOutput && (
                            <div className="p-4 bg-secondary rounded-xl border border-border flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Epoch</div>
                                    <div className="font-bold text-foreground font-mono">{reverseOutput}</div>
                                </div>
                                <button onClick={() => navigator.clipboard.writeText(reverseOutput)} className="text-muted-foreground hover:text-blue-500">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
