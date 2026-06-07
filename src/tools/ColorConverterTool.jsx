import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Palette, Copy, RefreshCw } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function ColorConverterTool() {
    const [hex, setHex] = useState('#3B82F6')
    const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 })
    const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 })
    const [cmyk, setCmyk] = useState({ c: 76, m: 47, y: 0, k: 4 })

    // Update all when HEX changes
    const handleHex = (val) => {
        setHex(val)
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            const r = parseInt(val.substring(1, 3), 16)
            const g = parseInt(val.substring(3, 5), 16)
            const b = parseInt(val.substring(5, 7), 16)
            updateFromRgb(r, g, b, false) // don't update hex back
        }
    }

    const updateFromRgb = (r, g, b, updateHex = true) => {
        setRgb({ r, g, b })

        if (updateHex) {
            const toHex = (c) => {
                const hex = c.toString(16)
                return hex.length === 1 ? '0' + hex : hex
            }
            setHex('#' + toHex(r) + toHex(g) + toHex(b))
        }

        // RGB to HSL
        let r1 = r / 255, g1 = g / 255, b1 = b / 255
        let max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1)
        let h, s, l = (max + min) / 2

        if (max === min) {
            h = s = 0
        } else {
            let d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            if (max === r1) h = (g1 - b1) / d + (g1 < b1 ? 6 : 0)
            else if (max === g1) h = (b1 - r1) / d + 2
            else h = (r1 - g1) / d + 4
            h /= 6
        }
        setHsl({ h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) })

        // RGB to CMYK
        let k = 1 - Math.max(r1, g1, b1)
        let c = (1 - r1 - k) / (1 - k) || 0
        let m = (1 - g1 - k) / (1 - k) || 0
        let y = (1 - b1 - k) / (1 - k) || 0
        setCmyk({ c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) })
    }

    const copy = (text) => {
        navigator.clipboard.writeText(text)
        triggerConfetti()
    }

    return (
        <ToolLayout title="Color Converter" description="Convert between HEX, RGB, HSL, and CMYK.">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Visual Preview */}
                <div className="w-full md:w-64 flex flex-col gap-4">
                    <div
                        className="w-full aspect-square rounded-3xl shadow-lg border-4 border-white ring-1 ring-slate-200"
                        style={{ backgroundColor: hex }}
                    />
                    <div className="bg-card p-4 rounded-2xl text-center shadow-sm border border-border">
                        <div className="text-muted-foreground text-xs font-bold uppercase mb-1">Preview</div>
                        <input
                            type="color"
                            value={hex}
                            onChange={e => handleHex(e.target.value)}
                            className="w-full h-10 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Converters */}
                <div className="flex-1 space-y-4">
                    {/* HEX */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex justify-between items-center group">
                        <div>
                            <div className="text-muted-foreground text-xs font-bold uppercase mb-1">HEX</div>
                            <input
                                value={hex}
                                onChange={e => handleHex(e.target.value)}
                                className="font-mono text-xl font-bold text-foreground outline-none uppercase w-full"
                            />
                        </div>
                        <button onClick={() => copy(hex)} className="p-2 text-muted-foreground hover:text-blue-500"><Copy className="w-5 h-5" /></button>
                    </div>

                    {/* RGB */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border group">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-muted-foreground text-xs font-bold uppercase">RGB</div>
                            <button onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="p-2 text-muted-foreground hover:text-blue-500"><Copy className="w-4 h-4" /></button>
                        </div>
                        <div className="flex gap-4">
                            {['r', 'g', 'b'].map(k => (
                                <div key={k} className="flex-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">{k}</label>
                                    <input
                                        type="number" min="0" max="255"
                                        value={rgb[k]}
                                        onChange={e => {
                                            const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0))
                                            const newRgb = { ...rgb, [k]: val }
                                            updateFromRgb(newRgb.r, newRgb.g, newRgb.b)
                                        }}
                                        className="w-full bg-secondary border border-border rounded-lg px-2 py-1 font-mono font-bold"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HSL */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border group">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-muted-foreground text-xs font-bold uppercase">HSL</div>
                            <button onClick={() => copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className="p-2 text-muted-foreground hover:text-blue-500"><Copy className="w-4 h-4" /></button>
                        </div>
                        <div className="flex gap-4">
                            {['h', 's', 'l'].map(k => (
                                <div key={k} className="flex-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">{k}</label>
                                    <input
                                        type="number"
                                        value={hsl[k]}
                                        readOnly
                                        className="w-full bg-secondary border-none rounded-lg px-2 py-1 font-mono font-bold text-muted-foreground"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CMYK */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border group">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-muted-foreground text-xs font-bold uppercase">CMYK</div>
                            <button onClick={() => copy(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`)} className="p-2 text-muted-foreground hover:text-blue-500"><Copy className="w-4 h-4" /></button>
                        </div>
                        <div className="flex gap-4">
                            {['c', 'm', 'y', 'k'].map(k => (
                                <div key={k} className="flex-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">{k}</label>
                                    <input
                                        type="number"
                                        value={cmyk[k]}
                                        readOnly
                                        className="w-full bg-secondary border-none rounded-lg px-2 py-1 font-mono font-bold text-muted-foreground"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
