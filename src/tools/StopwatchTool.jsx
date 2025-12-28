import React, { useState, useEffect, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Play, Pause, RotateCcw, Flag, Timer } from 'lucide-react'

export default function StopwatchTool() {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [laps, setLaps] = useState([])
    const intervalRef = useRef(null)

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prev => prev + 10)
            }, 10)
        } else {
            clearInterval(intervalRef.current)
        }
        return () => clearInterval(intervalRef.current)
    }, [isRunning])

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        const centiseconds = Math.floor((ms % 1000) / 10)
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
    }

    const handleLap = () => {
        setLaps(prev => [time, ...prev])
    }

    const handleReset = () => {
        setIsRunning(false)
        setTime(0)
        setLaps([])
    }

    return (
        <ToolLayout title="Stopwatch" description="Precision timer with lap recording.">
            <div className="max-w-xl mx-auto">
                <div className="bg-slate-900 rounded-full aspect-square flex flex-col items-center justify-center shadow-2xl border-8 border-slate-800 relative mb-8">
                    <div className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Chronometer</div>
                    <div className="text-6xl md:text-8xl font-mono font-bold text-white tabular-nums tracking-tighter">
                        {formatTime(time)}
                    </div>
                    <div className="absolute top-8 text-blue-500 animate-pulse">
                        {isRunning && <Timer className="w-6 h-6" />}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {!isRunning ? (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Play className="w-6 h-6" /> Start
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsRunning(false)}
                            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Pause className="w-6 h-6" /> Stop
                        </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleLap}
                            disabled={!isRunning}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                        >
                            <Flag className="w-5 h-5" /> Lap
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <RotateCcw className="w-5 h-5" /> Reset
                        </button>
                    </div>
                </div>

                {laps.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 max-h-60 overflow-y-auto">
                        <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <Flag className="w-4 h-4 text-blue-500" /> Laps
                        </h3>
                        <div className="space-y-2">
                            {laps.map((lapTime, idx) => (
                                <div key={idx} className="flex justify-between items-center font-mono text-lg p-2 hover:bg-slate-50 rounded-lg">
                                    <span className="text-slate-400 text-sm">#{laps.length - idx}</span>
                                    <span className="font-bold text-slate-800">{formatTime(lapTime)}</span>
                                    <span className="text-xs text-slate-400">
                                        {idx < laps.length - 1 ? `+${formatTime(lapTime - laps[idx + 1])}` : '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
