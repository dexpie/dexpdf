import confetti from 'canvas-confetti'

export function triggerConfetti() {
    const duration = 3000
    const end = Date.now() + duration

        // Frame loop for "School Pride" style confetti
        ; (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#2563eb', '#9333ea', '#db2777'] // Blue, Purple, Pink
            })
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#2563eb', '#9333ea', '#db2777']
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        })()
}

export function triggerFireworks() {
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const random = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
            return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        // since particles fall down, start a bit higher than random
        confetti(
            Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } })
        )
        confetti(
            Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } })
        )
    }, 250)
}
