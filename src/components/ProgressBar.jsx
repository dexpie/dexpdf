import * as React from 'react'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

export default function ProgressBar() {
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState('idle')
  const [message, setMessage] = React.useState('')
  const timerRef = React.useRef(undefined)

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
          setQuery('success')
          setMessage(d.message || 'Done')
          timerRef.current = setTimeout(() => setQuery('idle'), 1000)
          return
        }
        // show progress state
        setLoading(true)
        setQuery('progress')
        if (d.message) setMessage(d.message)
      }
    }

    window.addEventListener('pdf-progress', onProgress)
    return () => window.removeEventListener('pdf-progress', onProgress)
  }, [])

  // Render nothing when idle
  if (query === 'idle') return null

  return (
    <Box sx={{ position: 'fixed', top: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1400 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ height: 40 }}>
          <Fade in={loading} style={{ transitionDelay: loading ? '200ms' : '0ms' }} unmountOnExit>
            <CircularProgress />
          </Fade>
        </Box>
        <Box sx={{ mt: 0.5 }}>
          {query === 'success' ? (
            <Typography variant="caption">{message || 'Success'}</Typography>
          ) : (
            <Fade in={query === 'progress'} style={{ transitionDelay: query === 'progress' ? '200ms' : '0ms' }} unmountOnExit>
              <Typography variant="caption">{message || 'Working...'}</Typography>
            </Fade>
          )}
        </Box>
      </Box>
    </Box>
  )
}
