import React, { useState, useEffect, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Timer, Play, Pause, RefreshCw, Flag } from 'lucide-react'

export default function StopwatchTool() {
    const [time, setTime] = useState(0)
    const [running, setRunning] = useState(false)
    const [laps, setLaps] = useState([])
    const timerRef = useRef(null)

    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() => {
                setTime(t => t + 10)
            }, 10)
        } else {
            clearInterval(timerRef.current)
        }
        return () => clearInterval(timerRef.current)
    }, [running])

    const formatTime = (ms) => {
        const min = Math.floor(ms / 60000)
        const sec = Math.floor((ms % 60000) / 1000)
        const centi = Math.floor((ms % 1000) / 10)
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${centi.toString().padStart(2, '0')}`
    }

    const lap = () => {
        setLaps([...laps, time])
    }

    const reset = () => {
        setRunning(false)
        setTime(0)
        setLaps([])
    }

    return (
        <ToolLayout title="Stopwatch" description="Track time with millisecond precision and laps.">
            <div className="max-w-2xl mx-auto space-y-8">

                <div className="bg-slate-900 text-white rounded-full h-80 w-80 mx-auto flex flex-col items-center justify-center shadow-2xl border-8 border-slate-800 relative">
                    <div className="text-6xl font-black font-mono tracking-wider tabular-nums">
                        {formatTime(time)}
                    </div>
                    <div className="text-muted-foreground font-bold uppercase mt-2 text-sm tracking-widest">
                        {running ? 'Running' : 'Stopped'}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setRunning(!running)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 ${running ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                    >
                        {running ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                    </button>

                    {running && (
                        <button
                            onClick={lap}
                            className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        >
                            <Flag className="fill-current" />
                        </button>
                    )}

                    {!running && time > 0 && (
                        <button
                            onClick={reset}
                            className="w-16 h-16 rounded-full bg-secondary0 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        >
                            <RefreshCw />
                        </button>
                    )}
                </div>

                {laps.length > 0 && (
                    <div className="bg-card rounded-3xl shadow-lg border border-border overflow-hidden">
                        <div className="bg-secondary p-4 font-bold text-muted-foreground text-center uppercase text-xs">Laps</div>
                        <div className="max-h-60 overflow-auto">
                            {laps.slice().reverse().map((l, i) => (
                                <div key={i} className="flex justify-between p-4 border-b border-border last:border-0 font-mono font-bold text-foreground">
                                    <span className="text-muted-foreground">#{laps.length - i}</span>
                                    <span>{formatTime(l)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </ToolLayout>
    )
}
