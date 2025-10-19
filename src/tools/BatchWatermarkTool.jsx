import { useState, useRef, useEffect } from 'react'
import { createInlineModuleWorker, terminateWorker } from '../utils/workerHelpers'
import workerCode from '../workers/batchWatermarkCode'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'

export default function BatchWatermarkTool() {
  const [files, setFiles] = useState([])
  const [watermark, setWatermark] = useState('CONFIDENTIAL')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef({ aborted: false })
  const workerRef = useRef(null)
  const [fileStates, setFileStates] = useState([]) // { name, status: 'pending'|'processing'|'done'|'error', percent }
  const [outputFileName, setOutputFileName] = useState('watermarked-files')

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        try { workerRef.current.terminate() } catch (e) { }
        workerRef.current = null
      }
    }
  }, [])

  const handleFiles = (e) => {
    const f = Array.from(e.target.files || [])
    setFiles(f)
    setFileStates(f.map(file => ({ name: file.name, status: 'pending', percent: 0 })))
  }

  const applyWatermarks = async () => {
    if (!files.length) return
    setBusy(true)
    abortRef.current.aborted = false

    // Prepare ArrayBuffers for transfer
    const fileBuffers = []
    for (const f of files) {
      try {
        const buf = await f.arrayBuffer()
        fileBuffers.push({ name: f.name, buffer: buf })
      } catch (err) {
        fileBuffers.push({ name: f.name, buffer: null })
      }
    }

    // Try to use a Worker; fallback to in-thread processing
    let usedWorker = false
    try {
      // Create an inline module worker from the tracked worker code
      const worker = createInlineModuleWorker(workerCode)
      workerRef.current = worker
      usedWorker = true

      worker.onmessage = (ev) => {
        const msg = ev.data
        if (!msg) return
        if (msg.type === 'progress') {
          const { percent, message, fileIndex, filePercent } = msg
          window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { percent, message } }))
          if (typeof fileIndex === 'number') {
            setFileStates(prev => {
              const copy = prev.slice()
              copy[fileIndex] = { ...(copy[fileIndex] || {}), status: 'processing', percent: filePercent }
              return copy
            })
          }
        } else if (msg.type === 'file-done') {
          const { fileIndex } = msg
          setFileStates(prev => {
            const copy = prev.slice()
            copy[fileIndex] = { ...(copy[fileIndex] || {}), status: 'done', percent: 100 }
            return copy
          })
        } else if (msg.type === 'result') {
          const { buffer } = msg
          const blob = new Blob([buffer], { type: 'application/zip' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = getOutputFilename(outputFileName, 'watermarked-files', '.zip')
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
          setBusy(false)
          window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { end: true, message: 'Complete' } }))
          terminateWorker(workerRef.current)
          workerRef.current = null
        } else if (msg.type === 'error') {
          console.error('Worker error', msg.error)
          setBusy(false)
          window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { end: true, message: 'Error' } }))
          terminateWorker(workerRef.current)
          workerRef.current = null
        } else if (msg.type === 'cancelled') {
          setBusy(false)
          window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { end: true, message: 'Cancelled' } }))
          terminateWorker(workerRef.current)
          workerRef.current = null
        }
      }

      // Send start message with transferable buffers
      const transferList = fileBuffers.reduce((acc, f) => {
        if (f.buffer) acc.push(f.buffer)
        return acc
      }, [])
      worker.postMessage({ cmd: 'start', files: fileBuffers, watermark }, transferList)
    } catch (err) {
      console.warn('Worker not available, falling back to in-thread processing', err)
      usedWorker = false
    }

    if (!usedWorker) {
      // Fallback: existing in-thread implementation
      try {
        const { PDFDocument, rgb, degrees } = await import('pdf-lib')
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        // Calculate total pages for progress estimation
        let totalPages = 0
        const filePageCounts = []
        for (const f of files) {
          try {
            const arr = await f.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arr)
            const pages = pdfDoc.getPages()
            filePageCounts.push(pages.length)
            totalPages += pages.length
          } catch (err) {
            console.warn('Could not read file for page count', f.name, err)
            filePageCounts.push(0)
          }
        }

        window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { percent: 0, message: 'Starting batch watermark', indeterminate: false } }))

        // Throttle helper for progress events (200ms)
        let lastEmit = 0
        let emitTimer = null
        const emitThrottled = (detail) => {
          const now = Date.now()
          const send = () => {
            window.dispatchEvent(new CustomEvent('pdf-progress', { detail }))
            lastEmit = Date.now()
          }
          const elapsed = now - lastEmit
          if (elapsed >= 200 || detail.percent === 100) {
            if (emitTimer) { clearTimeout(emitTimer); emitTimer = null }
            send()
          } else {
            if (emitTimer) clearTimeout(emitTimer)
            emitTimer = setTimeout(() => { send(); emitTimer = null }, 200 - elapsed)
          }
        }

        for (let fi = 0; fi < files.length; fi++) {
          if (abortRef.current.aborted) break
          const f = files[fi]
          try {
            setFileStates(prev => {
              const copy = prev.slice()
              copy[fi] = { ...(copy[fi] || {}), status: 'processing', percent: 0 }
              return copy
            })
            const arr = await f.arrayBuffer()
            if (abortRef.current.aborted) break
            const pdfDoc = await PDFDocument.load(arr)
            const pages = pdfDoc.getPages()
            for (let pi = 0; pi < pages.length; pi++) {
              if (abortRef.current.aborted) break
              const page = pages[pi]
              const { width, height } = page.getSize()
              page.drawText(watermark, {
                x: width / 2 - 100,
                y: height / 2,
                size: 48,
                color: rgb(0.8, 0.1, 0.1),
                rotate: degrees(-45),
                opacity: 0.25,
              })

              // Emit progress per page (throttled)
              try {
                const processedSoFar = filePageCounts.slice(0, fi).reduce((a, b) => a + b, 0) + (pi + 1)
                const percent = totalPages > 0 ? Math.round((processedSoFar / totalPages) * 100) : 0
                emitThrottled({ percent, message: `Processing ${f.name} (${pi + 1}/${pages.length})` })
                const filePercent = pages.length > 0 ? Math.round(((pi + 1) / pages.length) * 100) : 0
                setFileStates(prev => {
                  const copy = prev.slice()
                  copy[fi] = { ...(copy[fi] || {}), percent: filePercent }
                  return copy
                })
              } catch (e) {
                // ignore
              }
            }

            const out = await pdfDoc.save()
            zip.file(f.name.replace(/\.pdf$/i, '') + '-watermarked.pdf', out)
            setFileStates(prev => {
              const copy = prev.slice()
              copy[fi] = { ...(copy[fi] || {}), status: 'done', percent: 100 }
              return copy
            })
          } catch (err) {
            console.error('Error watermarking', f.name, err)
            setFileStates(prev => {
              const copy = prev.slice()
              copy[fi] = { ...(copy[fi] || {}), status: 'error', percent: 0 }
              return copy
            })
          }
        }

        window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { percent: 100, message: 'Packaging ZIP', indeterminate: false } }))
        const content = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(content)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, 'watermarked-files', '.zip')
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        setBusy(false)
        window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { end: true, message: 'Complete' } }))
      } catch (e) {
        console.error('Fallback processing failed', e)
        setBusy(false)
        window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { end: true, message: 'Error' } }))
      }
    }
  }

  return (
    <div className="batch-tool">
      <h2>Batch Watermark</h2>
      <p>Upload multiple PDFs and apply a text watermark to each page. Results are returned as a ZIP.</p>
      <div>
        <label>Watermark text:</label>
        <input value={watermark} onChange={e => setWatermark(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <input type="file" accept="application/pdf" multiple onChange={handleFiles} />
      </div>
      {fileStates.length > 0 && (
        <div className="batch-file-list">
          <h3>Files</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {fileStates.map((fs, idx) => (
              <li key={idx} className="batch-file-item">
                <div className="batch-file-row">
                  <div style={{ flex: 1 }}>{fs.name}</div>
                  <div style={{ width: 120, textAlign: 'right', fontSize: 12 }}>{fs.status || 'pending'}</div>
                </div>
                <div className="progress-bar-small" style={{ marginTop: 6 }}>
                  <div className="progress-fill" style={{ width: `${fs.percent || 0}%`, background: fs.status === 'error' ? '#e53935' : undefined }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {files.length > 0 && (
        <FilenameInput
          value={outputFileName}
          onChange={(e) => setOutputFileName(e.target.value)}
          disabled={busy}
          placeholder="watermarked-files"
        />
      )}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={applyWatermarks} disabled={busy || files.length === 0}>
          {busy ? 'Processing...' : 'Apply Watermark & Download ZIP'}
        </button>
        <button
          className="btn-cancel"
          onClick={() => {
            // send abort to worker if present
            if (workerRef.current) {
              try { workerRef.current.postMessage({ cmd: 'abort' }) } catch (e) { }
              try { workerRef.current.terminate() } catch (e) { }
              workerRef.current = null
            }
            abortRef.current.aborted = true
            setBusy(false)
            // mark remaining files as pending if aborted
            setFileStates(prev => prev.map(s => s.status === 'processing' ? { ...s, status: 'pending' } : s))
            window.dispatchEvent(new CustomEvent('pdf-progress', { detail: { end: true, message: 'Cancelled' } }))
          }}
          disabled={!busy}
        >
          Cancel
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>{files.length}</strong> file(s) selected
      </div>
    </div>
  )
}
