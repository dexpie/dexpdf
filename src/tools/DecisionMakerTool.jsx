import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { HelpCircle, RefreshCw } from 'lucide-react'

export default function DecisionMakerTool() {
    const [mode, setMode] = useState('coin') // coin, wheel
    const [result, setResult] = useState(null)
    const [spinning, setSpinning] = useState(false)
    const [items, setItems] = useState('Yes\nNo\nMaybe')

    const flipCoin = () => {
        setSpinning(true)
        setResult(null)
        setTimeout(() => {
            setResult(Math.random() > 0.5 ? 'Heads' : 'Tails')
            setSpinning(false)
        }, 1000)
    }

    const spinWheel = () => {
        const options = items.split('\n').filter(i => i.trim())
        if (options.length === 0) return
        setSpinning(true)
        setResult(null)
        setTimeout(() => {
            setResult(options[Math.floor(Math.random() * options.length)])
            setSpinning(false)
        }, 1500)
    }

    return (
        <ToolLayout title="Decision Maker" description="Coin flip and random picker wheel.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">

                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col gap-4">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button onClick={() => setMode('coin')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${mode === 'coin' ? 'bg-card shadow' : 'text-muted-foreground'}`}>Coin Flip</button>
                        <button onClick={() => setMode('wheel')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${mode === 'wheel' ? 'bg-card shadow' : 'text-muted-foreground'}`}>Random Picker</button>
                    </div>

                    {mode === 'wheel' && (
                        <textarea
                            value={items} onChange={e => setItems(e.target.value)}
                            className="flex-1 resize-none p-4 bg-secondary rounded-xl outline-none font-bold text-slate-600 border border-border focus:border-blue-300"
                            placeholder="Enter options (one per line)"
                        />
                    )}

                    <button
                        onClick={mode === 'coin' ? flipCoin : spinWheel}
                        disabled={spinning}
                        className="p-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {spinning ? 'Deciding...' : 'Decide Now'}
                    </button>
                </div>

                <div className="bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center relative overflow-hidden">
                    {result && !spinning && (
                        <div className="text-center animate-bounce">
                            <div className="text-white font-black text-6xl drop-shadow-lg">{result}</div>
                        </div>
                    )}
                    {spinning && (
                        <RefreshCw className="w-16 h-16 text-purple-500 animate-spin" />
                    )}
                    {!result && !spinning && (
                        <div className="text-foreground font-bold uppercase text-sm">Ready to decide</div>
                    )}
                </div>

            </div>
        </ToolLayout>
    )
}
