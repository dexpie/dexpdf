import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Type, Copy, RefreshCw } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function CaseConverterTool() {
    const [text, setText] = useState('')

    // Case Functions
    const toLowerCase = (s) => s.toLowerCase()
    const toUpperCase = (s) => s.toUpperCase()
    const toTitleCase = (s) => s.toLowerCase().replace(/(?:^|\s)\w/g, m => m.toUpperCase())
    const toSentenceCase = (s) => s.toLowerCase().replace(/(^\w|\.\s+\w)/g, m => m.toUpperCase())

    // Complex cases requiring word splitting
    const getWords = (s) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').split(/\s+/).filter(w => w)

    const toCamelCase = (s) => {
        const words = getWords(s)
        return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    }

    const toSnakeCase = (s) => getWords(s).map(w => w.toLowerCase()).join('_')
    const toKebabCase = (s) => getWords(s).map(w => w.toLowerCase()).join('-')
    const toPascalCase = (s) => getWords(s).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    const toConstantCase = (s) => getWords(s).map(w => w.toUpperCase()).join('_')
    const toAlternatingCase = (s) => s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('')

    const CONVERTERS = [
        { name: 'lower case', fn: toLowerCase },
        { name: 'UPPER CASE', fn: toUpperCase },
        { name: 'Title Case', fn: toTitleCase },
        { name: 'Sentence case', fn: toSentenceCase },
        { name: 'camelCase', fn: toCamelCase },
        { name: 'snake_case', fn: toSnakeCase },
        { name: 'kebab-case', fn: toKebabCase },
        { name: 'PascalCase', fn: toPascalCase },
        { name: 'CONSTANT_CASE', fn: toConstantCase },
        { name: 'aLtErNaTiNg', fn: toAlternatingCase },
    ]

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        triggerConfetti()
    }

    return (
        <ToolLayout title="Case Converter" description="Convert text style instantly.">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border flex flex-col h-[300px]">
                    <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
                        <label className="font-bold text-slate-600 flex items-center gap-2">
                            <Type className="w-4 h-4" /> Text Input
                        </label>
                        <button onClick={handleCopy} className="text-blue-600 hover:text-blue-500 font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                            <Copy className="w-4 h-4" /> Copy
                        </button>
                    </div>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type or paste text here..."
                        className="flex-1 w-full p-6 resize-none outline-none text-lg leading-relaxed text-foreground"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {CONVERTERS.map(c => (
                        <button
                            key={c.name}
                            onClick={() => setText(c.fn(text))}
                            className="bg-card border border-border hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-bold py-3 px-2 rounded-xl text-sm transition-all shadow-sm"
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                <div className="bg-secondary rounded-xl p-4 text-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
                    {text.length} Characters • {text.split(/\s+/).filter(w => w).length} Words
                </div>

            </div>
        </ToolLayout>
    )
}
