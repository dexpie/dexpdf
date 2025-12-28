import React, { useState, useMemo } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Sigma, BarChart, X } from 'lucide-react'

export default function StatisticsTool() {
    const [input, setInput] = useState('')

    const stats = useMemo(() => {
        const nums = input.split(/[\s,]+/).map(n => parseFloat(n)).filter(n => !isNaN(n)).sort((a, b) => a - b)
        if (nums.length === 0) return null

        const sum = nums.reduce((a, b) => a + b, 0)
        const mean = sum / nums.length

        let median = 0
        const mid = Math.floor(nums.length / 2)
        if (nums.length % 2 === 0) median = (nums[mid - 1] + nums[mid]) / 2
        else median = nums[mid]

        const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length
        const stdDev = Math.sqrt(variance)

        return {
            count: nums.length,
            sum,
            mean,
            median,
            min: nums[0],
            max: nums[nums.length - 1],
            range: nums[nums.length - 1] - nums[0],
            stdDev
        }
    }, [input])

    return (
        <ToolLayout title="Statistics Calculator" description="Compute Mean, Median, Mode, and more.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Input */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <label className="font-bold text-slate-600 flex items-center gap-2">
                                <Sigma className="w-5 h-5 text-blue-500" /> Data Set
                            </label>
                            <button onClick={() => setInput('')} className="text-slate-400 hover:text-red-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Enter numbers separated by spaces or commas...&#10;Example: 10, 20, 30, 45, 12"
                            className="flex-1 w-full p-4 bg-slate-50 rounded-xl resize-none outline-none font-mono text-sm"
                        />
                        <div className="mt-4 text-xs font-bold text-slate-400 text-right">
                            {stats ? stats.count : 0} Valid Numbers
                        </div>
                    </div>
                </div>

                {/* Output */}
                <div className="space-y-4">
                    {stats ? (
                        <>
                            <StatCard label="Mean (Average)" value={stats.mean.toFixed(4)} color="blue" />
                            <StatCard label="Median" value={stats.median} color="purple" />
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label="Min" value={stats.min} color="slate" />
                                <StatCard label="Max" value={stats.max} color="slate" />
                            </div>
                            <StatCard label="Standard Deviation" value={stats.stdDev.toFixed(4)} color="orange" />
                            <StatCard label="Sum" value={stats.sum} color="green" />
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-3xl">
                            <BarChart className="w-12 h-12 mb-4 opacity-50" />
                            <p>Enter data to calculate stats</p>
                        </div>
                    )}
                </div>

            </div>
        </ToolLayout>
    )
}

function StatCard({ label, value, color }) {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center border-l-4 border-${color}-500`}>
            <span className="font-bold text-slate-500">{label}</span>
            <span className="font-mono font-black text-2xl text-slate-800">{value}</span>
        </div>
    )
}
