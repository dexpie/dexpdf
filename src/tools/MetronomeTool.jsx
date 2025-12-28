import React, { useState, useEffect, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Play, Pause, Minus, Plus, Volume2 } from 'lucide-react'

export default function MetronomeTool() {
    const [bpm, setBpm] = useState(120)
    const [isPlaying, setIsPlaying] = useState(false)
    const [beat, setBeat] = useState(0)
    const intervalRef = useRef(null)
    const audioContextRef = useRef(null)
    const nextNoteTimeRef = useRef(0)
    const beatCountRef = useRef(0)

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (audioContextRef.current) audioContextRef.current.close()
        }
    }, [])

    useEffect(() => {
        if (isPlaying) {
            nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.1
            intervalRef.current = setInterval(scheduler, 25)
        } else {
            clearInterval(intervalRef.current)
            setBeat(0)
        }
        return () => clearInterval(intervalRef.current)
    }, [isPlaying])

    const scheduler = () => {
        while (nextNoteTimeRef.current < audioContextRef.current.currentTime + 0.1) {
            scheduleNote(nextNoteTimeRef.current)
            nextNoteTime(nextNoteTimeRef.current)
        }
    }

    const nextNoteTime = (time) => {
        const secondsPerBeat = 60.0 / bpm
        nextNoteTimeRef.current += secondsPerBeat
        beatCountRef.current = (beatCountRef.current + 1) % 4
        setBeat(beatCountRef.current)
    }

    const scheduleNote = (time) => {
        const osc = audioContextRef.current.createOscillator()
        const envelope = audioContextRef.current.createGain()

        osc.frequency.value = beatCountRef.current === 0 ? 1000 : 800
        envelope.gain.value = 1
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001)
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)

        osc.connect(envelope)
        envelope.connect(audioContextRef.current.destination)

        osc.start(time)
        osc.stop(time + 0.03)
    }

    const adjustBpm = (val) => {
        setBpm(prev => Math.max(30, Math.min(300, prev + val)))
    }

    return (
        <ToolLayout title="Metronome" description="Precise BPM beat generator for music.">
            <div className="max-w-xl mx-auto text-center">
                <div className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl border-4 border-slate-800 relative overflow-hidden">
                    {/* Visual Beat */}
                    <div className={`absolute inset-0 bg-blue-600/20 transition-opacity duration-100 ease-out ${beat === 0 && isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
                    <div className={`absolute w-full h-2 bottom-0 left-0 bg-green-500 transition-all duration-100 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} style={{ width: `${(beat + 1) * 25}%` }}></div>

                    <h2 className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mb-4">BPM</h2>
                    <div className="text-9xl font-black text-white mb-8 select-none">
                        {bpm}
                    </div>

                    <div className="flex items-center justify-center gap-6 mb-8">
                        <button onClick={() => adjustBpm(-10)} className="w-12 h-12 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-xl">-10</button>
                        <button onClick={() => adjustBpm(-1)} className="w-16 h-16 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-bold text-2xl"><Minus className="w-6 h-6 mx-auto" /></button>

                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-blue-500 text-white shadow-blue-500/30'}`}
                        >
                            {isPlaying ? <Pause className="w-10 h-10 ml-0.5" /> : <Play className="w-10 h-10 ml-1.5" />}
                        </button>

                        <button onClick={() => adjustBpm(1)} className="w-16 h-16 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-bold text-2xl"><Plus className="w-6 h-6 mx-auto" /></button>
                        <button onClick={() => adjustBpm(10)} className="w-12 h-12 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-xl">+10</button>
                    </div>

                    <div className="text-slate-500 font-bold text-sm">
                        {isPlaying ? (
                            <span className="flex items-center justify-center gap-2 animate-pulse text-green-400">
                                <Volume2 className="w-4 h-4" /> Playing
                            </span>
                        ) : 'Tap Play to Start'}
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
