'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProgressBar() {
  const [loading, setLoading] = React.useState(false)
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
            setLoading(false)
          }, 2000)
          return
        }
        // show progress state
        setLoading(true)
        setStatus('progress')
        if (d.message) setMessage(d.message)
      }
    }

    window.addEventListener('pdf-progress', onProgress)
    return () => window.removeEventListener('pdf-progress', onProgress)
  }, [])

  return (
    <AnimatePresence>
      {(status !== 'idle') && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className={cn(
            "fixed top-4 left-1/2 z-[1400] flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border backdrop-blur-md",
            status === 'success'
              ? "bg-green-50/90 border-green-200 text-green-700"
              : "bg-white/90 border-slate-200 text-slate-700"
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
