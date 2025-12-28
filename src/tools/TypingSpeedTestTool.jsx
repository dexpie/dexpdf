import React, { useState, useEffect, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Keyboard, RefreshCw } from 'lucide-react'

const SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump.",
    "Sphinx of black quartz, judge my vow.",
    "Two driven jocks help fax my big quiz."
]

export default function TypingSpeedTestTool() {
    const [text, setText] = useState('')
    const [input, setInput] = useState('')
    const [startTime, setStartTime] = useState(null)
    const [wpm, setWpm] = useState(0)
    const [completed, setCompleted] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        reset()
    }, [])

    const reset = () => {
        setText(SENTENCES[Math.floor(Math.random() * SENTENCES.length)])
        setInput('')
        setStartTime(null)
        setWpm(0)
        setCompleted(false)
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const handleChange = (e) => {
        const val = e.target.value
        if (!startTime) setStartTime(Date.now())
        setInput(val)

        if (val === text) {
            setCompleted(true)
            const durationArr = (Date.now() - startTime) / 1000 / 60
            const wordCount = text.split(' ').length
            setWpm(Math.round(wordCount / durationArr))
        }
    }

    return (
        <ToolLayout title="Typing Speed Test" description="Check your typing speed (WPM).">
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center relative overflow-hidden">
                    {completed && <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />}

                    <div className="text-2xl font-serif text-slate-400 mb-6 leading-relaxed select-none">
                        {text.split('').map((char, i) => {
                            let color = 'text-slate-300'
                            if (i < input.length) {
                                color = input[i] === char ? 'text-green-500 font-bold' : 'text-red-500 font-bold bg-red-100'
                            }
                            return <span key={i} className={color}>{char}</span>
                        })}
                    </div>

                    <input
                        ref={inputRef}
                        value={input} onChange={handleChange}
                        disabled={completed}
                        className="w-full p-4 text-center text-xl font-bold bg-slate-50 rounded-xl outline-none focus:ring-2 ring-blue-500"
                        placeholder="Start typing..."
                    />
                </div>

                <div className="flex justify-center items-center gap-8">
                    <div className="text-center">
                        <div className="text-sm font-bold text-slate-400 uppercase">WPM</div>
                        <div className="text-6xl font-black text-slate-800">{wpm}</div>
                    </div>

                    <button onClick={reset} className="p-4 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
                        <RefreshCw className="w-6 h-6" />
                    </button>
                </div>

            </div>
        </ToolLayout>
    )
}
