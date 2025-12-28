import { useCallback } from 'react'

export const useSound = () => {
    // In a real app, we'd load audio files.
    // For this lighter version, we'll try to use Web Audio API synthetically 
    // OR just skip if no assets are present.
    // Let's implement a very simple synthesizer for "Beeps" to avoid external assets for now.

    const playTone = useCallback((freq, type, duration) => {
        if (typeof window === 'undefined') return
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (!AudioContext) return
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = type || 'sine'
            osc.frequency.setValueAtTime(freq, ctx.currentTime)

            gain.gain.setValueAtTime(0.05, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

            osc.connect(gain)
            gain.connect(ctx.destination)

            osc.start()
            osc.stop(ctx.currentTime + duration)
        } catch (e) {
            console.error(e)
        }
    }, [])

    const playClick = useCallback(() => playTone(800, 'sine', 0.1), [playTone])
    const playHover = useCallback(() => playTone(400, 'sine', 0.05), [playTone])
    const playSuccess = useCallback(() => {
        playTone(600, 'sine', 0.1)
        setTimeout(() => playTone(800, 'sine', 0.2), 100)
    }, [playTone])
    const playError = useCallback(() => {
        playTone(300, 'sawtooth', 0.2)
        setTimeout(() => playTone(200, 'sawtooth', 0.2), 150)
    }, [playTone])

    return { playClick, playHover, playSuccess, playError }
}
