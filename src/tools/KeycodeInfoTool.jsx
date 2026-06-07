import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Keyboard, Command, ArrowUp } from 'lucide-react'

export default function KeycodeInfoTool() {
    const [event, setEvent] = useState(null)
    const [history, setHistory] = useState([])

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent default for some common keys to allow testing without side effects
            if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) {
                e.preventDefault()
            }

            const evt = {
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
                which: e.which,
                location: e.location,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey
            }
            setEvent(evt)
            setHistory(prev => [evt, ...prev].slice(0, 10))
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <ToolLayout title="Keycode Info" description="Press any key to see its code and event details.">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {!event ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl animate-pulse">
                        <div className="p-6 bg-slate-800 rounded-2xl mb-4">
                            <Keyboard className="w-12 h-12 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Press any key</h2>
                        <p className="text-muted-foreground">to visualize event data</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* Main Display */}
                        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                            <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                                {event.keyCode}
                            </div>
                            <div className="text-2xl font-bold text-white mb-8">{event.key === ' ' ? 'Space' : event.key}</div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <KeyDetail label="event.key" value={event.key} />
                                <KeyDetail label="event.code" value={event.code} />
                                <KeyDetail label="event.which" value={event.which} />
                                <KeyDetail label="event.location" value={event.location} />
                            </div>

                            {/* Modifiers */}
                            <div className="flex justify-center gap-4 mt-8">
                                <Modifier label="CTRL" active={event.ctrlKey} />
                                <Modifier label="SHIFT" active={event.shiftKey} />
                                <Modifier label="ALT" active={event.altKey} />
                                <Modifier label="META" active={event.metaKey} />
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="bg-card rounded-3xl p-6 shadow-lg border border-border">
                            <h3 className="font-bold text-muted-foreground uppercase text-xs mb-4">Recent Keys</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {history.map((h, i) => (
                                    <div key={i} className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg border ${i === 0 ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-secondary text-muted-foreground border-border'}`}>
                                        {h.key === ' ' ? '␣' : h.key}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}

function KeyDetail({ label, value }) {
    return (
        <div className="bg-slate-800 p-4 rounded-xl flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-muted-foreground uppercase">{label}</span>
            <span className="text-green-400 font-mono font-bold truncate">{value}</span>
        </div>
    )
}

function Modifier({ label, active }) {
    return (
        <div className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${active ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800 text-slate-600'}`}>
            {label}
        </div>
    )
}
