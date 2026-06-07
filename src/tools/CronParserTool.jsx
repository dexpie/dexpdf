import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Clock, Calendar, AlertCircle } from 'lucide-react'

// Simple Cron Describer mapping (Mock implementation as 'cronstrue' is a heavy dep to add just for this right now)
// In a real scenario we would install 'cronstrue'
const describeCron = (cron) => {
    const parts = cron.trim().split(/\s+/)
    if (parts.length < 5) return 'Invalid Cron Expression'

    const [min, hour, dom, month, dow] = parts

    let desc = 'At '

    // Time
    if (min === '*' && hour === '*') desc += 'every minute'
    else if (min !== '*' && hour === '*') desc += `minute ${min} past every hour`
    else if (min !== '*' && hour !== '*') desc += `${hour}:${min.padStart(2, '0')}`
    else desc += `${hour}:${min}`

    // Date
    if (dom !== '*' || month !== '*' || dow !== '*') {
        desc += ' on '
        if (dom !== '*') desc += `day-of-month ${dom} `
        if (month !== '*') desc += `in ${getMonthName(month)} `
        if (dow !== '*') desc += `on ${getDayName(dow)}`
    }

    return desc
}

const getMonthName = (m) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[parseInt(m) - 1] || m
}

const getDayName = (d) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[parseInt(d)] || d
}

export default function CronParserTool() {
    const [expression, setExpression] = useState('*/5 * * * *')
    const [desc, setDesc] = useState(describeCron('*/5 * * * *'))

    const handleInput = (val) => {
        setExpression(val)
        setDesc(describeCron(val))
    }

    const setExample = (val) => {
        setExpression(val)
        setDesc(describeCron(val))
    }

    return (
        <ToolLayout title="Cron Parser" description="Understand Cron schedule expressions.">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Input */}
                <div className="bg-card p-8 rounded-[2rem] shadow-xl border border-border flex flex-col items-center gap-6">
                    <div className="w-full relative">
                        <input
                            type="text"
                            value={expression}
                            onChange={e => handleInput(e.target.value)}
                            className="w-full text-center text-4xl font-mono font-bold text-foreground bg-secondary border-2 border-border rounded-2xl p-6 outline-none focus:border-blue-500 focus:bg-card transition-all"
                        />
                        <div className="absolute -bottom-6 left-0 w-full flex justify-between text-xs font-mono text-muted-foreground px-8">
                            <span>MIN</span>
                            <span>HOUR</span>
                            <span>DOM</span>
                            <span>MON</span>
                            <span>DOW</span>
                        </div>
                    </div>

                    <div className="text-2xl font-bold text-blue-600 text-center mt-4 bg-blue-50 px-8 py-4 rounded-xl border border-blue-100">
                        "{desc}"
                    </div>
                </div>

                {/* Cheat Sheet */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ExampleBtn val="* * * * *" label="Every Minute" set={setExample} />
                    <ExampleBtn val="0 0 * * *" label="Midnight Daily" set={setExample} />
                    <ExampleBtn val="0 9 * * 1" label="Mondays at 9AM" set={setExample} />
                    <ExampleBtn val="0 0 1 * *" label="1st of Month" set={setExample} />
                    <ExampleBtn val="*/15 * * * *" label="Every 15 Mins" set={setExample} />
                    <ExampleBtn val="0 12 * * 1-5" label="Weekdays Noon" set={setExample} />
                </div>
            </div>
        </ToolLayout>
    )
}

function ExampleBtn({ val, label, set }) {
    return (
        <button
            onClick={() => set(val)}
            className="p-4 bg-card rounded-xl shadow-sm border border-border hover:shadow-md hover:border-blue-200 transition-all text-left group"
        >
            <div className="font-bold text-foreground text-sm mb-1 group-hover:text-blue-600">{label}</div>
            <div className="font-mono text-xs text-muted-foreground">{val}</div>
        </button>
    )
}
