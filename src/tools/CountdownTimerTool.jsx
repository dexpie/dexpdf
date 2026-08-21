import React, { useState, useEffect, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Play, Pause, RefreshCw, Bell } from 'lucide-react'

export default function CountdownTimerTool() {
    const [duration, setDuration] = useState(60) // in seconds
    const [timeLeft, setTimeLeft] = useState(60)
    const [running, setRunning] = useState(false)
    const timerRef = useRef(null)

    useEffect(() => {
        if (running && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(t => t - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setRunning(false)
            // Play alarm sound or visual indicator
            new Audio('/alarm.mp3').play().catch(() => { }) // Placeholder for alarm
        }
        return () => clearInterval(timerRef.current)
    }, [running, timeLeft])

    const start = () => {
        if (timeLeft === 0) setTimeLeft(duration)
        setRunning(true)
    }

    const reset = () => {
        setRunning(false)
        setTimeLeft(duration)
    }

    const format = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    return (
        <ToolLayout title="Countdown Timer" description="Focus on your tasks with a custom timer.">
            <div className="max-w-2xl mx-auto space-y-8 text-center">

                <div className={`transition-all duration-300 ${timeLeft === 0 ? 'scale-110 animate-bounce' : ''}`}>
                    <div className={`text-9xl font-black font-mono tabular-nums ${timeLeft < 10 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                        {format(timeLeft)}
                    </div>
                </div>

                {!running && (
                    <div className="flex justify-center gap-2">
                        {[1, 5, 10, 15, 25, 30, 60].map(m => (
                            <button
                                key={m}
                                onClick={() => { setDuration(m * 60); setTimeLeft(m * 60); }}
                                className={`px-4 py-2 rounded-full font-bold text-sm ${duration === m * 60 ? 'bg-slate-800 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary'}`}
                            >
                                {m}m
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex justify-center gap-6">
                    {!running && timeLeft !== 0 && (
                        <button onClick={start} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
                            <Play className="icon-xl fill-current ml-1" />
                        </button>
                    )}
                    {running && (
                        <button onClick={() => setRunning(false)} className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
                            <Pause className="icon-xl fill-current" />
                        </button>
                    )}
                    <button onClick={reset} className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground shadow-xl hover:scale-110 transition-transform">
                        <RefreshCw className="icon-xl" />
                    </button>
                </div>

                {timeLeft === 0 && (
                    <div className="inline-flex items-center gap-2 text-red-500 font-bold bg-destructive/10 px-6 py-2 rounded-full">
                        <Bell className="animate-swing" /> Time's Up!
                    </div>
                )}

            </div>
        </ToolLayout>
    )
}
