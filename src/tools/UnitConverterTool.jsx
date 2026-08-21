import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { ArrowLeftRight, Ruler, Scale, Thermometer, Gauge, HardDrive } from 'lucide-react'

const CATEGORIES = {
    length: {
        icon: Ruler,
        units: {
            m: 1,
            km: 0.001,
            cm: 100,
            mm: 1000,
            in: 39.3701,
            ft: 3.28084,
            yd: 1.09361,
            mi: 0.000621371
        }
    },
    weight: {
        icon: Scale,
        units: {
            kg: 1,
            g: 1000,
            mg: 1000000,
            lb: 2.20462,
            oz: 35.274
        }
    },
    speed: {
        icon: Gauge,
        units: {
            'm/s': 1,
            'km/h': 3.6,
            'mph': 2.23694,
            'kn': 1.94384
        }
    },
    data: {
        icon: HardDrive,
        units: {
            B: 1,
            KB: 1 / 1024,
            MB: 1 / (1024 * 1024),
            GB: 1 / (1024 * 1024 * 1024),
            TB: 1 / (1024 * 1024 * 1024 * 1024)
        }
    }
    // Temp is special case (formula based)
}

export default function UnitConverterTool() {
    const [category, setCategory] = useState('length')
    const [fromUnit, setFromUnit] = useState('m')
    const [toUnit, setToUnit] = useState('ft')
    const [amount, setAmount] = useState(1)
    const [result, setResult] = useState(0)

    // Reset units when category changes
    useEffect(() => {
        if (category === 'temp') {
            setFromUnit('C')
            setToUnit('F')
        } else {
            const units = Object.keys(CATEGORIES[category].units)
            setFromUnit(units[0])
            setToUnit(units[1] || units[0])
        }
    }, [category])

    useEffect(() => {
        calculate()
    }, [amount, fromUnit, toUnit, category])

    const calculate = () => {
        const val = parseFloat(amount)
        if (isNaN(val)) { setResult(''); return }

        if (category === 'temp') {
            let res = val
            if (fromUnit === 'C' && toUnit === 'F') res = (val * 9 / 5) + 32
            else if (fromUnit === 'F' && toUnit === 'C') res = (val - 32) * 5 / 9
            else if (fromUnit === 'C' && toUnit === 'K') res = val + 273.15
            else if (fromUnit === 'K' && toUnit === 'C') res = val - 273.15
            else if (fromUnit === 'F' && toUnit === 'K') res = (val - 32) * 5 / 9 + 273.15
            else if (fromUnit === 'K' && toUnit === 'F') res = (val - 273.15) * 9 / 5 + 32
            setResult(res)
            return
        }

        const cat = CATEGORIES[category]
        const base = val / cat.units[fromUnit]
        const final = base * cat.units[toUnit]
        setResult(final)
    }

    const swap = () => {
        setFromUnit(toUnit)
        setToUnit(fromUnit)
    }

    return (
        <ToolLayout title="Unit Converter" description="Convert length, weight, temperature, and more.">
            <div className="max-w-4xl mx-auto">
                {/* Category Selector */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {Object.keys(CATEGORIES).map(c => {
                        const Icon = CATEGORIES[c].icon
                        return (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-full font-bold capitalize transition-all
                                    ${category === c
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-card text-muted-foreground hover:bg-secondary shadow-sm'}
                                `}
                            >
                                <Icon className="w-5 h-5" /> {c}
                            </button>
                        )
                    })}
                    <button
                        onClick={() => setCategory('temp')}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-full font-bold capitalize transition-all
                            ${category === 'temp'
                                ? 'bg-orange-500 text-white shadow-lg scale-105'
                                : 'bg-card text-muted-foreground hover:bg-secondary shadow-sm'}
                        `}
                    >
                        <Thermometer className="w-5 h-5" /> Temp
                    </button>
                </div>

                {/* Converter Card */}
                <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border max-w-2xl mx-auto">
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                        {/* From */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-muted-foreground uppercase">From</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full text-3xl font-bold bg-secondary p-4 rounded-xl border border-border outline-none focus:ring-2 ring-blue-500"
                            />
                            <select
                                value={fromUnit}
                                onChange={e => setFromUnit(e.target.value)}
                                className="w-full p-3 rounded-xl bg-secondary font-bold text-foreground cursor-pointer"
                            >
                                {category === 'temp'
                                    ? ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>)
                                    : Object.keys(CATEGORIES[category].units).map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Swap Button */}
                        <div className="pt-6">
                            <button
                                onClick={swap}
                                className="p-4 bg-slate-900 text-white rounded-full hover:scale-110 hover:rotate-180 transition-all shadow-xl"
                            >
                                <ArrowLeftRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* To */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-muted-foreground uppercase">To</label>
                            <div className="w-full text-3xl font-bold bg-primary/10 text-blue-600 p-4 rounded-xl border border-blue-100 flex items-center overflow-hidden">
                                {typeof result === 'number' ? result.toLocaleString('en-US', { maximumFractionDigits: 6 }) : result}
                            </div>
                            <select
                                value={toUnit}
                                onChange={e => setToUnit(e.target.value)}
                                className="w-full p-3 rounded-xl bg-secondary font-bold text-foreground cursor-pointer"
                            >
                                {category === 'temp'
                                    ? ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>)
                                    : Object.keys(CATEGORIES[category].units).map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
