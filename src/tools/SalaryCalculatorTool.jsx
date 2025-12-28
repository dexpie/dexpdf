import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Briefcase, CreditCard } from 'lucide-react'

export default function SalaryCalculatorTool() {
    const [amount, setAmount] = useState(25)
    const [period, setPeriod] = useState('Hourly')
    const [hoursPerWeek, setHoursPerWeek] = useState(40)

    const calc = () => {
        let hourly = 0
        if (period === 'Hourly') hourly = amount
        if (period === 'Daily') hourly = amount / 8
        if (period === 'Weekly') hourly = amount / hoursPerWeek
        if (period === 'Bi-Weekly') hourly = amount / (hoursPerWeek * 2)
        if (period === 'Monthly') hourly = amount / (hoursPerWeek * 4.33)
        if (period === 'Annual') hourly = amount / (hoursPerWeek * 52)

        return {
            Hourly: hourly,
            Daily: hourly * 8,
            Weekly: hourly * hoursPerWeek,
            'Bi-Weekly': hourly * hoursPerWeek * 2,
            Monthly: hourly * hoursPerWeek * 4.33,
            Annual: hourly * hoursPerWeek * 52
        }
    }

    const results = calc()

    return (
        <ToolLayout title="Salary Calculator" description="Convert between hourly, monthly, and annual income.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1 md:col-span-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Amount</label>
                        <input
                            type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                            className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:ring-2 ring-blue-500"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Per</label>
                        <select
                            value={period} onChange={e => setPeriod(e.target.value)}
                            className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none"
                        >
                            {Object.keys(results).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1 md:col-span-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Hours/Week</label>
                        <input
                            type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value))}
                            className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:ring-2 ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(results).map(([key, value]) => (
                        <div key={key} className={`p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col ${period === key ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                            <span className="text-xs font-bold text-slate-400 uppercase mb-2">{key}</span>
                            <span className={`text-2xl font-black ${period === key ? 'text-blue-600' : 'text-slate-700'}`}>
                                ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </ToolLayout>
    )
}
