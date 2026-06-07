import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Dices, RefreshCw, Copy, List } from 'lucide-react'

export default function NumberGeneratorTool() {
    const [min, setMin] = useState(1)
    const [max, setMax] = useState(100)
    const [count, setCount] = useState(1)
    const [allowDuplicates, setAllowDuplicates] = useState(true)
    const [result, setResult] = useState([])

    const generate = () => {
        const nums = []
        if (!allowDuplicates && count > (max - min + 1)) {
            alert("Range too small for unique numbers")
            return
        }

        if (allowDuplicates) {
            for (let i = 0; i < count; i++) {
                nums.push(Math.floor(Math.random() * (max - min + 1)) + min)
            }
        } else {
            const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min)
            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * pool.length)
                nums.push(pool[idx])
                pool.splice(idx, 1)
            }
        }
        setResult(nums)
    }

    return (
        <ToolLayout title="Number Generator" description="Generate random numbers or sequences.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Controls */}
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-foreground font-bold text-lg mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Dices className="w-6 h-6" /></div>
                        Settings
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Min</label>
                            <input type="number" value={min} onChange={e => setMin(Number(e.target.value))} className="w-full p-3 bg-secondary rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Max</label>
                            <input type="number" value={max} onChange={e => setMax(Number(e.target.value))} className="w-full p-3 bg-secondary rounded-xl font-bold" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Quantity</label>
                        <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full p-3 bg-secondary rounded-xl font-bold" />
                    </div>

                    <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={allowDuplicates} onChange={e => setAllowDuplicates(e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                        Allow Duplicates
                    </label>

                    <button
                        onClick={generate}
                        className="mt-auto w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" /> Generate
                    </button>
                </div>

                {/* Results */}
                <div className="md:col-span-2 bg-slate-900 rounded-3xl shadow-xl flex flex-col overflow-hidden relative min-h-[400px]">
                    <div className="bg-slate-800 p-4 flex justify-between items-center">
                        <div className="text-muted-foreground font-bold flex items-center gap-2">
                            <List className="w-4 h-4" /> Result ({result.length})
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(result.join(', '))} className="text-muted-foreground hover:text-white">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto content-start">
                        {result.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {result.map((n, i) => (
                                    <div key={i} className="px-4 py-2 bg-slate-800 text-purple-300 font-mono text-xl font-bold rounded-xl border border-slate-700">
                                        {n}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center text-slate-600">
                                <Dices className="w-16 h-16 mb-4 opacity-20" />
                                <p>Ready to roll</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
