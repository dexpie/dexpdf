import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Calendar, ArrowRight } from 'lucide-react'
import { differenceInDays, differenceInMonths, differenceInYears, format } from 'date-fns'

export default function DateDiffTool() {
    const [start, setStart] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [end, setEnd] = useState(format(new Date(), 'yyyy-MM-dd'))

    const d1 = new Date(start)
    const d2 = new Date(end)

    const diffDays = differenceInDays(d2, d1)
    const diffMonths = differenceInMonths(d2, d1)
    const diffYears = differenceInYears(d2, d1)

    return (
        <ToolLayout title="Date Difference" description="Calculate duration between two dates.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-8 items-center justify-center">
                    <div className="text-center">
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Start Date</label>
                        <input
                            type="date" value={start} onChange={e => setStart(e.target.value)}
                            className="bg-slate-50 p-4 rounded-xl font-bold text-lg outline-none focus:ring-2 ring-blue-500"
                        />
                    </div>

                    <ArrowRight className="text-slate-300 w-8 h-8 hidden md:block" />

                    <div className="text-center">
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-2">End Date</label>
                        <input
                            type="date" value={end} onChange={e => setEnd(e.target.value)}
                            className="bg-slate-50 p-4 rounded-xl font-bold text-lg outline-none focus:ring-2 ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DiffCard value={diffDays} label="Days" color="blue" />
                    <DiffCard value={diffMonths} label="Months" color="purple" />
                    <DiffCard value={diffYears} label="Years" color="green" />
                </div>

            </div>
        </ToolLayout>
    )
}

function DiffCard({ value, label, color }) {
    return (
        <div className={`p-8 rounded-3xl bg-${color}-50 border border-${color}-100 flex flex-col items-center justify-center text-${color}-600 shadow-sm`}>
            <span className="text-5xl font-black mb-2">{value}</span>
            <span className="font-bold uppercase tracking-widest text-xs opacity-70">{label}</span>
        </div>
    )
}
