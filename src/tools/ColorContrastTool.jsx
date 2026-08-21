import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function ColorContrastTool() {
    const [fg, setFg] = useState('#000000')
    const [bg, setBg] = useState('#ffffff')
    const [ratio, setRatio] = useState(21)
    const [score, setScore] = useState({ aa: true, aaa: true, aaLarge: true, aaaLarge: true })

    // Helper: Hex to RGB
    const hexToRgb = (hex) => {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        const h = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    // Helper: Luminance
    const luminance = (r, g, b) => {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    useEffect(() => {
        const rgb1 = hexToRgb(fg)
        const rgb2 = hexToRgb(bg)
        const l1 = luminance(rgb1.r, rgb1.g, rgb1.b)
        const l2 = luminance(rgb2.r, rgb2.g, rgb2.b)
        const lighter = Math.max(l1, l2)
        const darker = Math.min(l1, l2)
        const currentRatio = (lighter + 0.05) / (darker + 0.05)

        setRatio(currentRatio)
        setScore({
            aaLarge: currentRatio >= 3,
            aa: currentRatio >= 4.5,
            aaaLarge: currentRatio >= 4.5,
            aaa: currentRatio >= 7
        })
    }, [fg, bg])

    const swap = () => {
        setFg(bg)
        setBg(fg)
    }

    return (
        <ToolLayout title="Contrast Checker" description="Ensure your colors meet WCAG accessibility standards.">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Inputs */}
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Text Color</label>
                            <div className="flex gap-2">
                                <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer shadow-sm border border-border p-1 bg-card" />
                                <input type="text" value={fg} onChange={e => setFg(e.target.value)} className="flex-1 p-3 bg-secondary rounded-xl font-bold uppercase" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Background</label>
                            <div className="flex gap-2">
                                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer shadow-sm border border-border p-1 bg-card" />
                                <input type="text" value={bg} onChange={e => setBg(e.target.value)} className="flex-1 p-3 bg-secondary rounded-xl font-bold uppercase" />
                            </div>
                        </div>
                    </div>

                    <button onClick={swap} className="mx-auto p-2 bg-secondary rounded-full hover:bg-secondary transition-colors">
                        <RefreshCw className="w-5 h-5 text-muted-foreground" />
                    </button>

                    {/* Preview */}
                    <div
                        className="p-8 rounded-2xl flex flex-col justify-center items-center gap-4 text-center transition-colors border border-border h-48"
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        <h3 className="text-2xl font-bold">Preview Text</h3>
                        <p className="text-sm opacity-80 max-w-xs">
                            This is how your text looks on the background. Ensure it is readable for everyone.
                        </p>
                    </div>
                </div>

                {/* Score Card */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                    <div className="text-center mb-8">
                        <div className="text-muted-foreground font-bold uppercase text-sm mb-2">Contrast Ratio</div>
                        <div className={`text-6xl font-black ${ratio < 3 ? 'text-red-500' : ratio < 4.5 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {ratio.toFixed(2)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <ScoreItem label="AA Normal" pass={score.aa} />
                        <ScoreItem label="AA Large" pass={score.aaLarge} />
                        <ScoreItem label="AAA Normal" pass={score.aaa} />
                        <ScoreItem label="AAA Large" pass={score.aaaLarge} />
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}

function ScoreItem({ label, pass }) {
    return (
        <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${pass ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
            <span className="font-bold text-sm">{label}</span>
            {pass ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </div>
    )
}
