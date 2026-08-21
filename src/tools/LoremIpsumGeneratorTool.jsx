import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileText, Copy, RefreshCw } from 'lucide-react'
import { LoremIpsum } from 'lorem-ipsum'

export default function LoremIpsumGeneratorTool() {
    const [count, setCount] = useState(3)
    const [unit, setUnit] = useState('paragraphs') // paragraphs, sentences, words
    const [text, setText] = useState('')

    const generate = () => {
        const lorem = new LoremIpsum({
            sentencesPerParagraph: { max: 8, min: 4 },
            wordsPerSentence: { max: 16, min: 4 }
        })

        let res = ''
        if (unit === 'paragraphs') res = lorem.generateParagraphs(count)
        if (unit === 'sentences') res = lorem.generateSentences(count)
        if (unit === 'words') res = lorem.generateWords(count)

        setText(res)
    }

    React.useEffect(() => {
        generate()
    }, [])

    return (
        <ToolLayout title="Lorem Ipsum" description="Generate dummy text for your designs.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-wrap gap-4 items-end">
                    <div className="space-y-1 flex-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Count</label>
                        <input
                            type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))}
                            className="w-full p-3 bg-secondary rounded-xl font-bold border border-border"
                        />
                    </div>
                    <div className="space-y-1 flex-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Unit</label>
                        <select
                            value={unit} onChange={e => setUnit(e.target.value)}
                            className="w-full p-3 bg-secondary rounded-xl font-bold border border-border outline-none"
                        >
                            <option value="paragraphs">Paragraphs</option>
                            <option value="sentences">Sentences</option>
                            <option value="words">Words</option>
                        </select>
                    </div>
                    <button
                        onClick={generate}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" /> Generate
                    </button>
                    <button
                        onClick={() => navigator.clipboard.writeText(text)}
                        className="px-6 py-3 bg-secondary text-muted-foreground rounded-xl font-bold hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                        <Copy className="w-5 h-5" /> Copy
                    </button>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-lg border border-border min-h-[300px]">
                    <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-line font-serif text-lg">
                        {text}
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
