import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Binary, Hash, Copy } from 'lucide-react'

export default function BaseConverterTool() {
    const [values, setValues] = useState({
        bin: '',
        oct: '',
        dec: '',
        hex: ''
    })

    const handleChange = (type, val) => {
        // Remove invalid chars based on type
        let cleanVal = val
        if (type === 'bin') cleanVal = val.replace(/[^0-1]/g, '')
        if (type === 'oct') cleanVal = val.replace(/[^0-7]/g, '')
        if (type === 'dec') cleanVal = val.replace(/[^0-9]/g, '')
        if (type === 'hex') cleanVal = val.replace(/[^0-9a-fA-F]/g, '')

        if (!cleanVal) {
            setValues({ bin: '', oct: '', dec: '', hex: '' })
            return
        }

        try {
            const num = parseInt(cleanVal, type === 'bin' ? 2 : type === 'oct' ? 8 : type === 'dec' ? 10 : 16)
            if (!isNaN(num)) {
                setValues({
                    bin: num.toString(2),
                    oct: num.toString(8),
                    dec: num.toString(10),
                    hex: num.toString(16).toUpperCase()
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const copy = (txt) => {
        navigator.clipboard.writeText(txt)
    }

    return (
        <ToolLayout title="Base Converter" description="Convert between Binary, Octal, Decimal, and Hexadecimal.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput
                    label="Decimal (10)"
                    value={values.dec}
                    onChange={(v) => handleChange('dec', v)}
                    icon={<Hash className="w-5 h-5" />}
                    color="blue"
                />
                <BaseInput
                    label="Hexadecimal (16)"
                    value={values.hex}
                    onChange={(v) => handleChange('hex', v)}
                    icon={<div className="font-bold text-xs">0x</div>}
                    color="purple"
                />
                <BaseInput
                    label="Binary (2)"
                    value={values.bin}
                    onChange={(v) => handleChange('bin', v)}
                    icon={<Binary className="w-5 h-5" />}
                    color="green"
                />
                <BaseInput
                    label="Octal (8)"
                    value={values.oct}
                    onChange={(v) => handleChange('oct', v)}
                    icon={<div className="font-bold text-xs">8</div>}
                    color="orange"
                />
            </div>
        </ToolLayout>
    )
}

function BaseInput({ label, value, onChange, icon, color }) {
    const colorClasses = {
        blue: { ring: 'focus-within:ring-blue-100', text: 'text-blue-600', bg: 'bg-primary/10' },
        purple: { ring: 'focus-within:ring-purple-100', text: 'text-purple-600', bg: 'bg-purple-50' },
        green: { ring: 'focus-within:ring-green-100', text: 'text-green-600', bg: 'bg-emerald-500/10' },
        orange: { ring: 'focus-within:ring-orange-100', text: 'text-orange-600', bg: 'bg-orange-50' }
    }
    const theme = colorClasses[color] || colorClasses.blue

    return (
        <div className={`bg-card p-6 rounded-3xl shadow-lg border border-border transition-all focus-within:ring-4 ${theme.ring}`}>
            <div className="flex justify-between items-center mb-4">
                <div className={`flex items-center gap-2 font-bold ${theme.text}`}>
                    <div className={`p-2 rounded-lg ${theme.bg}`}>{icon}</div>
                    {label}
                </div>
                <button onClick={() => navigator.clipboard.writeText(value)} className="text-muted-foreground hover:text-muted-foreground">
                    <Copy className="w-4 h-4" />
                </button>
            </div>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full text-2xl font-mono font-bold text-foreground outline-none placeholder:text-slate-200"
                placeholder="0"
                spellCheck={false}
            />
        </div>
    )
}
