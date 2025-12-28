import React, { useState, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Zap } from 'lucide-react'

export default function ReactionTesterTool() {
    const [state, setState] = useState('waiting') // waiting, ready, active, result, early
    const [startTime, setStartTime] = useState(0)
    const [result, setResult] = useState(0)
    const timerRef = useRef(null)

    const start = () => {
        setState('ready')
        const delay = Math.random() * 2000 + 1000 // 1-3 seconds
        timerRef.current = setTimeout(() => {
            setState('active')
            setStartTime(Date.now())
        }, delay)
    }

    const handleClick = () => {
        if (state === 'waiting' || state === 'result') {
            start()
        } else if (state === 'ready') {
            clearTimeout(timerRef.current)
            setState('early')
        } else if (state === 'active') {
            const end = Date.now()
            setResult(end - startTime)
            setState('result')
        }
    }

    return (
        <ToolLayout title="Reaction Time" description="Test your visual reflexes. Click when it turns green.">
            <div className="max-w-4xl mx-auto h-[500px]">

                <div
                    onClick={handleClick}
                    className={`w-full h-full rounded-3xl shadow-xl flex flex-col items-center justify-center cursor-pointer transition-all select-none ${state === 'waiting' || state === 'result' ? 'bg-slate-800 hover:bg-slate-700 text-white' :
                            state === 'ready' ? 'bg-red-500 text-white' :
                                state === 'active' ? 'bg-green-500 text-white' :
                                    state === 'early' ? 'bg-orange-500 text-white' : 'bg-slate-800'
                        }`}
                >
                    {state === 'waiting' && <><Zap className="w-16 h-16 mb-4 animate-pulse" /> <div className="text-3xl font-black uppercase">Click to Start</div></>}

                    {state === 'ready' && <div className="text-3xl font-black uppercase">Wait for Green...</div>}

                    {state === 'active' && <div className="text-6xl font-black uppercase tracking-widest">CLICK!</div>}

                    {state === 'result' && (
                        <>
                            <div className="text-8xl font-black mb-4">{result} ms</div>
                            <div className="text-xl font-bold opacity-80 uppercase">Click to Try Again</div>
                        </>
                    )}

                    {state === 'early' && (
                        <>
                            <div className="text-3xl font-black uppercase mb-2">Too Soon!</div>
                            <div className="text-lg font-bold opacity-80 uppercase">Click to Retry</div>
                        </>
                    )}
                </div>

            </div>
        </ToolLayout>
    )
}
