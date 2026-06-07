import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Palette, Copy, Shuffle, ArrowRight, ArrowDown, ArrowUpRight } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function GradientGeneratorTool() {
    const [color1, setColor1] = useState('#3B82F6')
    const [color2, setColor2] = useState('#9333EA')
    const [angle, setAngle] = useState(135)
    const [type, setType] = useState('linear') // linear, radial

    const getGradientCss = () => {
        if (type === 'radial') {
            return `radial-gradient(circle, ${color1}, ${color2})`
        }
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`
    }

    const randomize = () => {
        const r = () => '#' + Math.floor(Math.random() * 16777215).toString(16)
        setColor1(r())
        setColor2(r())
    }

    const copy = () => {
        navigator.clipboard.writeText(`background: ${getGradientCss()};`)
        triggerConfetti()
    }

    return (
        <ToolLayout title="Gradient Generator" description="Create beautiful CSS gradients.">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Controls */}
                <div className="w-full md:w-80 space-y-6">
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border space-y-6">
                        {/* Colors */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Color 1</label>
                                <div className="flex gap-2">
                                    <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
                                    <input type="text" value={color1} onChange={e => setColor1(e.target.value)} className="flex-1 bg-secondary border border-border rounded-lg px-3 font-mono text-sm uppercase" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Color 2</label>
                                <div className="flex gap-2">
                                    <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
                                    <input type="text" value={color2} onChange={e => setColor2(e.target.value)} className="flex-1 bg-secondary border border-border rounded-lg px-3 font-mono text-sm uppercase" />
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Type</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                <button onClick={() => setType('linear')} className={`flex-1 py-1 rounded-lg text-xs font-bold ${type === 'linear' ? 'bg-card shadow-sm text-blue-600' : 'text-muted-foreground'}`}>Linear</button>
                                <button onClick={() => setType('radial')} className={`flex-1 py-1 rounded-lg text-xs font-bold ${type === 'radial' ? 'bg-card shadow-sm text-blue-600' : 'text-muted-foreground'}`}>Radial</button>
                            </div>
                        </div>

                        {type === 'linear' && (
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 flex justify-between">
                                    <span>Angle</span>
                                    <span>{angle}°</span>
                                </label>
                                <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(e.target.value)} className="w-full accent-blue-600" />
                            </div>
                        )}

                        <button onClick={randomize} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold flex justify-center gap-2 hover:bg-slate-200">
                            <Shuffle className="w-4 h-4" /> Randomize
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 space-y-6">
                    <div
                        className="w-full aspect-square md:aspect-video rounded-3xl shadow-2xl transition-all duration-300"
                        style={{ background: getGradientCss() }}
                    />

                    <div className="bg-slate-900 text-green-400 p-6 rounded-2xl font-mono text-sm shadow-lg overflow-x-auto flex justify-between items-center group">
                        <code>background: {getGradientCss()};</code>
                        <button onClick={copy} className="p-2 hover:bg-card/10 rounded-lg text-white">
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
