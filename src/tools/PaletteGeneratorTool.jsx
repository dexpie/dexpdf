import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Palette, Copy, RefreshCw } from 'lucide-react'

// Simple HSL to Hex helper
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export default function PaletteGeneratorTool() {
    const [baseHue, setBaseHue] = useState(200)
    const [harmony, setHarmony] = useState('analogous')

    const generatePalette = (hue, mode) => {
        const palette = []
        let hues = []

        if (mode === 'analogous') hues = [0, 30, 60, -30, -60]
        if (mode === 'monochromatic') hues = [0, 0, 0, 0, 0] // Handle differently (lightness)
        if (mode === 'triadic') hues = [0, 120, 240, 120, 240] // Repeated for 5
        if (mode === 'complementary') hues = [0, 180, 0, 180, 0]
        if (mode === 'split') hues = [0, 150, 210, 150, 210]

        // Base Sat/Light
        hues.forEach((offset, i) => {
            let h = (hue + offset) % 360
            if (h < 0) h += 360

            let s = 70
            let l = 50

            if (mode === 'monochromatic') {
                l = 90 - (i * 15) // Gradient lightness
            }

            palette.push({
                hex: hslToHex(h, s, l),
                hsl: `hsl(${Math.round(h)}, ${s}%, ${l}%)`
            })
        })
        return palette
    }

    const colors = generatePalette(baseHue, harmony)

    return (
        <ToolLayout title="Palette Generator" description="Create harmonious color schemes instantly.">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Controls */}
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-wrap gap-6 items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <label className="font-bold text-muted-foreground">Base Hue</label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={baseHue}
                            onChange={e => setBaseHue(Number(e.target.value))}
                            className="flex-1 h-3 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {['analogous', 'monochromatic', 'triadic', 'complementary', 'split'].map(m => (
                            <button
                                key={m}
                                onClick={() => setHarmony(m)}
                                className={`px-4 py-2 rounded-full font-bold text-sm capitalize transition-all ${harmony === m ? 'bg-slate-800 text-white shadow-lg' : 'bg-secondary text-muted-foreground hover:bg-secondary'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Palette Display */}
                <div className="h-64 sm:h-96 rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row">
                    {colors.map((c, i) => (
                        <div
                            key={i}
                            className="flex-1 flex flex-col justify-end p-6 transition-all hover:flex-[1.5] group relative"
                            style={{ backgroundColor: c.hex }}
                        >
                            <div className="bg-card/90 backdrop-blur rounded-xl p-4 shadow-lg transform translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="font-black text-xl text-foreground uppercase tracking-wider mb-1">{c.hex}</div>
                                <div className="text-xs font-bold text-muted-foreground mb-2">{c.hsl}</div>
                                <button
                                    onClick={() => navigator.clipboard.writeText(c.hex)}
                                    className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-black"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </ToolLayout>
    )
}
