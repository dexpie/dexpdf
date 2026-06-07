import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Volume2, Play, Pause, Square, RefreshCw } from 'lucide-react'

export default function TextToSpeechTool() {
    const [text, setText] = useState('Welcome to DexPDF, the ultimate tool collection.')
    const [voices, setVoices] = useState([])
    const [selectedVoice, setSelectedVoice] = useState(null)
    const [rate, setRate] = useState(1)
    const [pitch, setPitch] = useState(1)
    const [isSpeaking, setIsSpeaking] = useState(false)

    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices()
            setVoices(v)
            if (v.length > 0 && !selectedVoice) {
                // Prefer English or first available
                const preferred = v.find(voice => voice.lang.includes('en')) || v[0]
                setSelectedVoice(preferred.name)
            }
        }

        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices

        return () => window.speechSynthesis.cancel()
    }, [])

    const speak = () => {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        const voice = voices.find(v => v.name === selectedVoice)
        if (voice) utterance.voice = voice
        utterance.rate = rate
        utterance.pitch = pitch

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }

    const stop = () => {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }

    return (
        <ToolLayout title="Text to Speech" description="Convert text into spoken words.">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Controls */}
                <div className="w-full md:w-80 space-y-6">
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border space-y-6">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Voice</label>
                            <select
                                value={selectedVoice || ''}
                                onChange={e => setSelectedVoice(e.target.value)}
                                className="w-full p-2 bg-secondary border border-border rounded-lg text-sm font-bold truncate"
                            >
                                {voices.map(v => (
                                    <option key={v.name} value={v.name}>
                                        {v.name} ({v.lang})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 flex justify-between">
                                <span>Speed</span>
                                <span>{rate}x</span>
                            </label>
                            <input
                                type="range" min="0.5" max="2" step="0.1"
                                value={rate}
                                onChange={e => setRate(parseFloat(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 flex justify-between">
                                <span>Pitch</span>
                                <span>{pitch}</span>
                            </label>
                            <input
                                type="range" min="0.5" max="2" step="0.1"
                                value={pitch}
                                onChange={e => setPitch(parseFloat(e.target.value))}
                                className="w-full accent-purple-600"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={speak}
                                disabled={isSpeaking}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                <Play className="w-4 h-4" /> Speak
                            </button>
                            <button
                                onClick={stop}
                                disabled={!isSpeaking}
                                className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 disabled:opacity-50"
                            >
                                <Square className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Text Area */}
                <div className="flex-1 flex flex-col relative group">
                    <div className="absolute inset-0 bg-blue-500/5 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type something to say..."
                        className="w-full h-80 relative bg-card p-8 rounded-3xl shadow-xl border border-border resize-none outline-none text-xl leading-relaxed text-foreground"
                    />
                    {isSpeaking && (
                        <div className="absolute bottom-6 right-6 flex gap-1 items-end h-8">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-1 bg-blue-500 animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.2 + Math.random() * 0.5}s` }}></div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    )
}
