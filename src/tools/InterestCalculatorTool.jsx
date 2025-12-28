import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { TrendingUp, DollarSign } from 'lucide-react'

export default function InterestCalculatorTool() {
    const [principal, setPrincipal] = useState(10000)
    const [rate, setRate] = useState(7)
    const [time, setTime] = useState(10)
    const [type, setType] = useState('compound') // simple, compound

    const calculate = () => {
        if (type === 'simple') {
            return principal * (1 + (rate / 100 * time))
        } else {
            return principal * Math.pow((1 + rate / 100), time)
        }
    }

    const total = calculate()
    const profit = total - principal

    return (
        <ToolLayout title="Interest Calculator" description="Compute simple or compound interest growth.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 space-y-6">
                    <Input label="Principal Amount ($)" value={principal} onChange={setPrincipal} />
                    <Input label="Annual Rate (%)" value={rate} onChange={setRate} step="0.1" />
                    <Input label="Time Period (Years)" value={time} onChange={setTime} />

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
                        <select
                            value={type} onChange={e => setType(e.target.value)}
                            className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none"
                        >
                            <option value="compound">Compound Interest</option>
                            <option value="simple">Simple Interest</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl shadow-xl p-8 text-white flex flex-col justify-center gap-6">
                    <div>
                        <div className="text-green-100 font-bold uppercase text-xs mb-1">Total Value</div>
                        <div className="text-5xl font-black tracking-tight">
                            ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="h-px bg-white/20" />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-green-100 font-bold uppercase text-xs mb-1">Total Interest</div>
                            <div className="text-2xl font-bold text-green-200">
                                +${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div>
                            <div className="text-green-100 font-bold uppercase text-xs mb-1">Total Growth</div>
                            <div className="text-2xl font-bold text-green-200">
                                {((profit / principal) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}

function Input({ label, value, onChange, step = 1 }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{label}</label>
            <input
                type="number" value={value} onChange={e => onChange(Number(e.target.value))} step={step}
                className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:ring-2 ring-green-500"
            />
        </div>
    )
}
