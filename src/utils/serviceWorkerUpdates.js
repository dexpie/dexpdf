export function registerServiceWorker({ onUpdateReady } = {}) {
  if (process.env.NODE_ENV !== 'production') return
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        const notifyUpdate = () => {
          onUpdateReady?.(() => {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
            window.location.reload()
          })
        }

        if (registration.waiting && navigator.serviceWorker.controller) {
          notifyUpdate()
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdate()
            }
          })
        })
      })
      .catch(error => {
        console.warn('Service worker registration failed:', error)
      })
  })
}
