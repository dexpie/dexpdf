import React, { useState, useMemo } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Search, AlertTriangle, CheckCircle, Copy } from 'lucide-react'

export default function RegexTesterTool() {
    const [regexStr, setRegexStr] = useState('([A-Z])\\w+')
    const [flags, setFlags] = useState('gm')
    const [testString, setTestString] = useState('Welcome to DexPDF Tools 2024. This is a Regex Test.')

    const { parts, error, matchCount } = useMemo(() => {
        try {
            if (!regexStr) return { parts: [{ text: testString, match: false }], error: null, matchCount: 0 }

            const regex = new RegExp(regexStr, flags)
            let lastIndex = 0
            const resultParts = []
            let match
            let count = 0

            // If global flag is not set, existing looping method might fail or loop infinitely if not handled
            // Force global for highlighting logic if user didn't set it? 
            // Better: use matchAll if present, or manually loop if global.
            // If not global, only one match.

            const globalRegex = new RegExp(regexStr, flags.includes('g') ? flags : flags + 'g')

            while ((match = globalRegex.exec(testString)) !== null) {
                // Add non-match text before
                if (match.index > lastIndex) {
                    resultParts.push({ text: testString.slice(lastIndex, match.index), match: false })
                }

                // Add match
                resultParts.push({ text: match[0], match: true })
                lastIndex = globalRegex.lastIndex
                count++

                // Warning: Prevent infinite loop on zero-length matches
                if (match.index === globalRegex.lastIndex) {
                    globalRegex.lastIndex++
                }
            }

            // Add remaining text
            if (lastIndex < testString.length) {
                resultParts.push({ text: testString.slice(lastIndex), match: false })
            }

            return { parts: resultParts, error: null, matchCount: count }
        } catch (e) {
            return { parts: [{ text: testString, match: false }], error: e.message, matchCount: 0 }
        }
    }, [regexStr, flags, testString])

    const toggleFlag = (f) => {
        setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
    }

    return (
        <ToolLayout title="Regex Tester" description="Test and debug regular expressions.">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Regex Input Bar */}
                <div className="bg-card p-2 rounded-2xl shadow-lg border border-border flex items-center gap-2">
                    <div className="pl-4 font-mono font-bold text-muted-foreground text-lg">/</div>
                    <input
                        value={regexStr}
                        onChange={e => setRegexStr(e.target.value)}
                        placeholder="regex..."
                        className={`flex-1 p-2 outline-none font-mono text-lg font-medium ${error ? 'text-red-500' : 'text-foreground'}`}
                    />
                    <div className="font-mono font-bold text-muted-foreground text-lg">/</div>
                    <input
                        value={flags}
                        onChange={e => setFlags(e.target.value)}
                        placeholder="gims"
                        className="w-20 p-2 outline-none font-mono text-muted-foreground bg-secondary rounded-lg text-sm text-center"
                    />
                </div>

                {/* Flags Toggles */}
                <div className="flex gap-2 justify-center">
                    {['g', 'i', 'm', 's', 'u', 'y'].map(f => (
                        <button
                            key={f}
                            onClick={() => toggleFlag(f)}
                            className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-colors ${flags.includes(f) ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-card border-border text-muted-foreground hover:border-[rgba(243,239,228,0.16)]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-destructive/10 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-mono text-sm">{error}</span>
                    </div>
                )}

                {/* Test String Input/Output */}
                <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden min-h-[400px] flex flex-col">
                    <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
                        <h3 className="font-bold text-muted-foreground flex items-center gap-2">
                            Test String
                        </h3>
                        <div className="text-xs font-bold text-muted-foreground uppercase">
                            {matchCount} Match{matchCount !== 1 && 'es'}
                        </div>
                    </div>

                    <div className="relative flex-1">
                        {/* Editor Layer */}
                        <textarea
                            value={testString}
                            onChange={e => setTestString(e.target.value)}
                            className="absolute inset-0 w-full h-full p-6 font-mono text-sm bg-transparent text-transparent z-10 caret-slate-800 resize-none outline-none selection:bg-blue-200/50"
                            spellCheck={false}
                        />

                        {/* Highlight Layer */}
                        <div className="absolute inset-0 w-full h-full p-6 font-mono text-sm pointer-events-none whitespace-pre-wrap break-words text-muted-foreground z-0">
                            {parts.map((p, i) => (
                                <span
                                    key={i}
                                    className={`${p.match ? 'bg-yellow-300 text-foreground rounded font-bold box-decoration-clone' : ''}`}
                                >
                                    {p.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
