'use client'

import * as React from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProgressBar() {
  const [status, setStatus] = React.useState('idle') // idle, progress, success
  const [message, setMessage] = React.useState('')
  const timerRef = React.useRef(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  React.useEffect(() => {
    const onProgress = (e) => {
      const d = e.detail || {}
      if (d && typeof d === 'object') {
        if (d.end) {
          setStatus('success')
          setMessage(d.message || 'Done')
          timerRef.current = setTimeout(() => {
            setStatus('idle')
          }, 2000)
          return
        }
        setStatus('progress')
        if (d.message) setMessage(d.message)
      }
    }

    window.addEventListener('pdf-progress', onProgress)
    return () => window.removeEventListener('pdf-progress', onProgress)
  }, [])

  return (
    <div
      className={cn(
        "progress-toast flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border",
        status !== 'idle' ? 'visible' : '',
        status === 'success'
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-white border-slate-200 text-slate-700"
      )}
    >
      {status === 'progress' ? (
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      )}

      <span className="font-medium text-sm">
        {message || (status === 'progress' ? 'Processing...' : 'Success')}
      </span>
    </div>
  )
}
