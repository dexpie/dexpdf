import React, { useState, useMemo } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileText, BarChart2 } from 'lucide-react'

const STOP_WORDS = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'])

export default function WordDensityTool() {
    const [text, setText] = useState('')
    const [excludeStopWords, setExcludeStopWords] = useState(true)

    const stats = useMemo(() => {
        if (!text) return { words: [], total: 0 }

        // Normalize
        const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
        const allWords = cleanText.split(' ').filter(w => w)

        const counts = {}
        allWords.forEach(w => {
            if (excludeStopWords && STOP_WORDS.has(w)) return
            counts[w] = (counts[w] || 0) + 1
        })

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // Sort by count descending
            .slice(0, 50) // Top 50

        return {
            words: sorted,
            total: allWords.length
        }
    }, [text, excludeStopWords])

    return (
        <ToolLayout title="Word Density" description="Analyze keyword frequency and stats.">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[600px]">

                {/* Input Area */}
                <div className="flex-1 flex flex-col bg-card rounded-3xl shadow-lg border border-border overflow-hidden">
                    <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
                        <label className="font-bold text-slate-600 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Source Text
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={excludeStopWords}
                                onChange={e => setExcludeStopWords(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            Exclude Stop Words
                        </label>
                    </div>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Paste your article or text here..."
                        className="flex-1 w-full p-6 resize-none outline-none text-foreground leading-relaxed"
                    />
                </div>

                {/* Stats Panel */}
                <div className="w-full md:w-80 bg-secondary rounded-3xl border border-border flex flex-col overflow-hidden">
                    <div className="p-4 bg-card border-b border-border">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-500" /> Analysis
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1">
                            Total Words: <strong className="text-foreground">{stats.total}</strong>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {stats.words.map(([word, count], i) => {
                            const percent = ((count / stats.total) * 100).toFixed(1)
                            return (
                                <div key={word} className="flex items-center justify-between p-2 hover:bg-card rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                                        <span className="font-medium text-foreground">{word}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-12 bg-slate-200 rounded-full overflow-hidden">
                                            <div style={{ width: `${percent}%` }} className="h-full bg-blue-500"></div>
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground w-8 text-right">{count}</span>
                                    </div>
                                </div>
                            )
                        })}
                        {stats.words.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground text-sm">
                                No words found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
