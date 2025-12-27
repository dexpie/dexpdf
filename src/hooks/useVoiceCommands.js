import { useState, useEffect } from 'react'

export function useVoiceCommands() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [supported, setSupported] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            setSupported(true)
        }
    }, [])

    const startListening = () => {
        if (!supported) return

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onresult = (event) => {
            const current = event.resultIndex
            const transcript = event.results[current][0].transcript
            setTranscript(transcript)
        }

        recognition.start()
    }

    return { isListening, transcript, startListening, supported }
}
