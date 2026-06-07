import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { AlignLeft, Copy, RefreshCw } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function LoremIpsumTool() {
    const [paragraphs, setParagraphs] = useState(3)
    const [length, setLength] = useState('medium') // short, medium, long
    const [generated, setGenerated] = useState('')

    const IPSUM = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
        "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
        "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
        "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
    ]

    const generate = () => {
        let result = []
        for (let i = 0; i < paragraphs; i++) {
            const count = length === 'short' ? 2 : length === 'medium' ? 4 : 7
            let p = []
            for (let j = 0; j < count; j++) {
                p.push(IPSUM[Math.floor(Math.random() * IPSUM.length)])
            }
            result.push(p.join(" "))
        }
        setGenerated(result.join("\n\n"))
    }

    React.useEffect(() => {
        generate()
    }, [paragraphs, length])

    return (
        <ToolLayout title="Lorem Ipsum" description="Generate placeholder text for designs.">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Controls */}
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border col-span-1 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Paragraphs</label>
                            <input
                                type="number"
                                min="1" max="20"
                                value={paragraphs}
                                onChange={e => setParagraphs(e.target.value)}
                                className="w-full p-3 bg-secondary border border-border rounded-xl font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Length</label>
                            <div className="flex flex-col gap-2">
                                {['short', 'medium', 'long'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setLength(l)}
                                        className={`p-2 rounded-lg text-sm font-bold capitalize border ${length === l ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-transparent hover:bg-secondary'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={generate} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex justify-center gap-2 items-center hover:bg-slate-800">
                            <RefreshCw className="w-4 h-4" /> Regenerate
                        </button>
                    </div>

                    {/* Output */}
                    <div className="md:col-span-2 relative">
                        <textarea
                            value={generated}
                            readOnly
                            className="w-full h-[500px] p-8 -mt-2 bg-card rounded-3xl shadow-xl border border-border resize-none outline-none font-serif text-slate-600 leading-relaxed text-lg"
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generated)
                                triggerConfetti()
                            }}
                            className="absolute top-6 right-6 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
