import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Fingerprint, Copy, RefreshCw, Layers } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { triggerConfetti } from '../utils/confetti'

export default function UuidGeneratorTool() {
    const [count, setCount] = useState(1)
    const [uuids, setUuids] = useState([])
    const [hyphens, setHyphens] = useState(true)
    const [uppercase, setUppercase] = useState(false)
    const [version, setVersion] = useState(4) // Only supporting v4 for now

    const generate = () => {
        const newUuids = []
        for (let i = 0; i < count; i++) {
            let id = uuidv4()
            if (!hyphens) id = id.replace(/-/g, '')
            if (uppercase) id = id.toUpperCase()
            newUuids.push(id)
        }
        setUuids(newUuids)
    }

    React.useEffect(() => {
        generate()
    }, [count, hyphens, uppercase])

    const copyAll = () => {
        navigator.clipboard.writeText(uuids.join('\n'))
        triggerConfetti()
    }

    return (
        <ToolLayout title="UUID Generator" description="Generate bulk Version 4 UUIDs.">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Controls */}
                <div className="w-full md:w-80 space-y-6">
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border space-y-6">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Quantity: {count}</label>
                            <input
                                type="range" min="1" max="100"
                                value={count}
                                onChange={e => setCount(parseInt(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={hyphens}
                                    onChange={e => setHyphens(e.target.checked)}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-bold text-foreground text-sm">Hyphens</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={uppercase}
                                    onChange={e => setUppercase(e.target.checked)}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-bold text-foreground text-sm">UPPERCASE</span>
                            </label>
                        </div>

                        <button
                            onClick={() => generate()}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-800"
                        >
                            <RefreshCw className="w-4 h-4" /> Regenerate
                        </button>
                    </div>
                </div>

                {/* Output */}
                <div className="flex-1 flex flex-col bg-card rounded-3xl shadow-lg border border-border overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 bg-gradient-to-b from-white via-white to-transparent w-full flex justify-end">
                        <button
                            onClick={copyAll}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-200"
                        >
                            <Copy className="w-4 h-4" /> Copy All
                        </button>
                    </div>
                    <div className="p-6 pt-16 h-[500px] overflow-y-auto space-y-2 font-mono text-muted-foreground">
                        {uuids.map((id, idx) => (
                            <div key={idx} className="flex gap-4 items-center group pb-2 border-b border-slate-50 last:border-0 hover:bg-secondary p-2 rounded-lg">
                                <span className="text-muted-foreground text-xs w-6 text-right select-none">{idx + 1}</span>
                                <span className="flex-1 select-all">{id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
