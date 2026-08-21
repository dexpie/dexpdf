import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Key, Copy, RefreshCw, ShieldCheck } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function PasswordGeneratorTool() {
    const [password, setPassword] = useState('')
    const [length, setLength] = useState(16)
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    })
    const [strength, setStrength] = useState('Strong')

    const generate = () => {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lower = 'abcdefghijklmnopqrstuvwxyz'
        const nums = '0123456789'
        const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?'

        let chars = ''
        if (options.uppercase) chars += upper
        if (options.lowercase) chars += lower
        if (options.numbers) chars += nums
        if (options.symbols) chars += syms

        if (!chars) return

        let pass = ''
        for (let i = 0; i < length; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(pass)

        // Simple strength calc
        if (length < 8) setStrength('Weak')
        else if (length < 12) setStrength('Medium')
        else if (Object.values(options).filter(Boolean).length < 3) setStrength('Medium')
        else setStrength('Strong')
    }

    // Auto generate on change
    useEffect(() => {
        generate()
    }, [length, options])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password)
        triggerConfetti()
        alert('Password copied!')
    }

    return (
        <ToolLayout title="Password Generator" description="Create strong, secure passwords instantly.">
            <div className="max-w-2xl mx-auto">
                {/* Display */}
                <div className="bg-slate-900 rounded-3xl p-8 mb-8 text-center shadow-2xl relative overflow-hidden group">
                    {/* Strength Meter background */}
                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500
                        ${strength === 'Weak' ? 'w-1/3 bg-red-500' : strength === 'Medium' ? 'w-2/3 bg-yellow-500' : 'w-full bg-green-500'}
                     `} />

                    <div className="font-mono text-3xl md:text-5xl text-white break-all mb-4 font-bold tracking-wider">
                        {password}
                    </div>

                    <div className="flex justify-center gap-4">
                        <button onClick={generate} className="p-3 bg-card/10 hover:bg-card/20 rounded-xl text-white transition-colors">
                            <RefreshCw className="w-6 h-6" />
                        </button>
                        <button onClick={copyToClipboard} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors shadow-lg shadow-blue-500/30">
                            <Copy className="w-6 h-6" /> Copy
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <div className="mb-8">
                        <label className="flex justify-between font-bold text-foreground mb-2">
                            <span>Length</span>
                            <span className="text-blue-600">{length} characters</span>
                        </label>
                        <input
                            type="range"
                            min="6" max="64"
                            value={length}
                            onChange={e => setLength(parseInt(e.target.value))}
                            className="w-full accent-blue-600 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {Object.keys(options).map(key => (
                            <label key={key} className={`
                                flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                                ${options[key] ? 'border-blue-500 bg-primary/10 text-blue-700' : 'border-border hover:border-[rgba(243,239,228,0.16)] text-muted-foreground'}
                            `}>
                                <span className="capitalize font-bold">{key}</span>
                                <input
                                    type="checkbox"
                                    checked={options[key]}
                                    onChange={() => setOptions(p => ({ ...p, [key]: !p[key] }))}
                                    className="w-5 h-5 accent-blue-600"
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
