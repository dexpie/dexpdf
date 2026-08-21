import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Clock, Globe, Plus, X, Search } from 'lucide-react'

const ZONES = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney', 'Asia/Singapore',
    'Asia/Kolkata', 'Europe/Berlin', 'Europe/Moscow', 'America/Sao_Paulo'
]

export default function WorldClockTool() {
    const [clocks, setClocks] = useState(['UTC', 'America/New_York', 'Asia/Tokyo'])
    const [now, setNow] = useState(new Date())
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const addClock = (zone) => {
        if (!clocks.includes(zone)) {
            setClocks([...clocks, zone])
        }
        setAdding(false)
    }

    const removeClock = (zone) => {
        setClocks(clocks.filter(c => c !== zone))
    }

    return (
        <ToolLayout title="World Clock" description="Track time across the globe.">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-end mb-6">
                    <div className="relative">
                        <button
                            onClick={() => setAdding(!adding)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" /> Add City
                        </button>
                        {adding && (
                            <div className="absolute top-full right-0 mt-2 bg-card rounded-xl shadow-xl border border-border p-2 w-64 z-10 grid gap-1 max-h-64 overflow-y-auto">
                                {ZONES.map(z => (
                                    <button
                                        key={z}
                                        onClick={() => addClock(z)}
                                        className="text-left px-4 py-2 hover:bg-secondary rounded-lg text-sm font-bold text-foreground disabled:opacity-50"
                                        disabled={clocks.includes(z)}
                                    >
                                        {z.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clocks.map(zone => (
                        <div key={zone} className="bg-card p-6 rounded-3xl shadow-lg border border-border relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => removeClock(zone)} className="bg-secondary text-muted-foreground p-2 rounded-full hover:bg-red-100 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-secondary text-muted-foreground rounded-full">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg">{zone.split('/')[1]?.replace('_', ' ') || zone}</h3>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">{zone.split('/')[0]}</p>
                                </div>
                            </div>

                            <div className="text-center py-6">
                                <div className="text-4xl font-black text-foreground font-mono tracking-wider">
                                    {now.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-sm font-bold text-muted-foreground mt-2">
                                    {now.toLocaleDateString('en-US', { timeZone: zone, weekday: 'long', month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Day/Night Indicator Stripe */}
                            <div className={`h-2 w-full absolute bottom-0 left-0 ${parseInt(now.toLocaleTimeString('en-US', { timeZone: zone, hour12: false, hour: '2-digit' })) >= 6 &&
                                    parseInt(now.toLocaleTimeString('en-US', { timeZone: zone, hour12: false, hour: '2-digit' })) < 18
                                    ? 'bg-yellow-400'
                                    : 'bg-indigo-900'
                                }`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </ToolLayout>
    )
}
