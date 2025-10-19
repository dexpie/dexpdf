import React, { useRef, useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) { }

function Overlay({ ov, onDrag, onStartDrag, onStartResize }) {
  // ov: { x,y,w,h, page }
  return (
    <div className="sig-overlay" style={{ left: ov.x, top: ov.y, width: ov.w, height: ov.h }} onMouseDown={onStartDrag}>
      <img src={ov.dataUrl} className="sig-image" alt="sig" />
      <div className="sig-resize" onMouseDown={onStartResize} />
    </div>
  )
}

export default function SignatureTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([]) // {canvas, width, height}
  const [sigDataUrl, setSigDataUrl] = useState(null)
  const [overlays, setOverlays] = useState([]) // {page, x,y,w,h,dataUrl}
  const [selected, setSelected] = useState(null)
  const undoRef = useRef([])
  const [busy, setBusy] = useState(false)
  const containerRef = useRef(null)
  const dragRef = useRef(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('') // Custom filename

  const errorRef = useRef(null)
  const successRef = useRef(null)

  useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus() }, [errorMsg])
  useEffect(() => { if (successMsg && successRef.current) successRef.current.focus() }, [successMsg])

  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current) return
      const { type, idx, startX, startY, startW, startH, page } = dragRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      setOverlays(prev => {
        const copy = prev.slice()
        const item = { ...copy[idx] }
        if (type === 'move') {
          item.x = Math.max(0, startX + dx - copy[`_pageOffset${page}`])
          item.y = Math.max(0, startY + dy - copy[`_pageOffsetY${page}`])
        } else if (type === 'resize') {
          item.w = Math.max(10, startW + dx)
          item.h = Math.max(10, startH + dy)
        }
        copy[idx] = item
        return copy
      })
    }
    function onUp() { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  async function onFile(e) {
    const f = e.target.files?.[0]
    if (!f) return

    setErrorMsg('')
    setSuccessMsg('')

    if (!f.type.includes('pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large (max 50MB).')
      return
    }

    try {
      setFile(f)
      setOutputFileName(getDefaultFilename(f, '_signed'))
      await renderPdfPreview(f)
      setSuccessMsg('PDF loaded successfully! Upload or draw a signature.')
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
      setFile(null)
      setPages([])
    }
  }

  function onSigUpload(e) {
    const f = e.target.files?.[0]
    if (!f) return

    setErrorMsg('')

    if (!f.type.startsWith('image/')) {
      setErrorMsg('Please select an image file.')
      return
    }

    const r = new FileReader()
    r.onload = () => {
      setSigDataUrl(r.result)
      setSuccessMsg('Signature image loaded! Click "Add" on any page to place it.')
    }
    r.onerror = () => setErrorMsg('Failed to read image file.')
    r.readAsDataURL(f)
  }

  async function renderPdfPreview(file) {
    const array = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: array })
    const pdf = await loadingTask.promise
    const pgs = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      pgs.push({ canvas, width: canvas.width, height: canvas.height, viewportWidth: viewport.width, viewportHeight: viewport.height })
    }
    setPages(pgs)
    // attach small helper offsets for overlays calculation
    setOverlays([])
  }

  function startDrag(e, idx) {
    e.preventDefault();
    const ov = overlays[idx]
    const page = ov.page
    // compute page offset relative to viewport
    const pageCanvas = pages[page].canvas
    const rect = pageCanvas.getBoundingClientRect()
    // store page offsets on overlays array for mapping
    setOverlays(prev => {
      const copy = prev.slice()
      copy[`_pageOffset${page}`] = rect.left
      copy[`_pageOffsetY${page}`] = rect.top
      return copy
    })
    setSelected(idx)
    dragRef.current = { type: 'move', idx, startX: e.clientX, startY: e.clientY, page }
  }

  function startResize(e, idx) { e.preventDefault(); const ov = overlays[idx]; dragRef.current = { type: 'resize', idx, startX: e.clientX, startY: e.clientY, startW: ov.w, startH: ov.h } }

  function addOverlayToPage(pageIndex) {
    if (!sigDataUrl) {
      setErrorMsg('Please upload a signature image first.')
      return
    }
    const page = pages[pageIndex]
    if (!page) return
    const w = Math.min(200, page.width * 0.4)
    const h = Math.min(80, page.height * 0.15)
    const x = (page.width - w) / 2
    const y = (page.height - h) / 2
    setOverlays(prev => {
      const next = prev.concat({ page: pageIndex, x, y, w, h, dataUrl: sigDataUrl })
      undoRef.current.push(prev)
      return next
    })
    setSuccessMsg(`Signature added to page ${pageIndex + 1}. Drag to reposition or resize.`)
  }

  function deleteSelected() {
    if (selected === null) return
    setOverlays(prev => {
      const next = prev.slice(); next.splice(selected, 1); undoRef.current.push(prev); return next
    })
    setSelected(null)
  }

  function undo() {
    const last = undoRef.current.pop()
    if (last) setOverlays(last)
  }

  async function exportSigned() {
    if (!file) {
      setErrorMsg('Please select a PDF first.')
      return
    }
    if (overlays.length === 0) {
      setErrorMsg('Please place at least one signature before exporting.')
      return
    }

    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    try {
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const imgBytes = await (await fetch(sigDataUrl)).arrayBuffer()
      const isJpeg = String(sigDataUrl).startsWith('data:image/jpeg') || String(sigDataUrl).startsWith('data:image/jpg')
      let embedded = null
      if (isJpeg) { try { embedded = await pdf.embedJpg(imgBytes) } catch (e) { embedded = await pdf.embedPng(imgBytes) } }
      else { try { embedded = await pdf.embedPng(imgBytes) } catch (e) { embedded = await pdf.embedJpg(imgBytes) } }

      // for each overlay, map canvas pixel coords -> PDF user space (points)
      for (const ov of overlays) {
        const page = pdf.getPages()[ov.page]
        const { width: pdfW, height: pdfH } = page.getSize()
        const canvasInfo = pages[ov.page]
        const canvasW = canvasInfo.width
        const canvasH = canvasInfo.height
        const xRatio = pdfW / canvasW
        const yRatio = pdfH / canvasH
        const x = ov.x * xRatio
        // pdf-lib origin is bottom-left, while canvas is top-left
        const y = pdfH - (ov.y + ov.h) * yRatio
        const w = ov.w * xRatio
        const h = ov.h * yRatio
        page.drawImage(embedded, { x, y, width: w, height: h })
      }

      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_signed')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg(`Successfully signed PDF with ${overlays.length} signature(s) and downloaded!`)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to export signed PDF: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  async function processBatchFile(f, onProgress) {
    try {
      if (!sigDataUrl) {
        throw new Error('Please upload a signature image first.')
      }

      onProgress(10)
      const array = await f.arrayBuffer()
      onProgress(30)
      const pdf = await PDFDocument.load(array)
      onProgress(50)
      
      const imgBytes = await (await fetch(sigDataUrl)).arrayBuffer()
      const isJpeg = String(sigDataUrl).startsWith('data:image/jpeg') || String(sigDataUrl).startsWith('data:image/jpg')
      let embedded = null
      if (isJpeg) { try { embedded = await pdf.embedJpg(imgBytes) } catch (e) { embedded = await pdf.embedPng(imgBytes) } }
      else { try { embedded = await pdf.embedPng(imgBytes) } catch (e) { embedded = await pdf.embedJpg(imgBytes) } }
      
      onProgress(60)
      
      // Apply signature to all pages in bottom-right corner
      const pages = pdf.getPages()
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width: pdfW, height: pdfH } = page.getSize()
        
        // Signature dimensions: 150x60 points
        const sigW = 150
        const sigH = 60
        
        // Position in bottom-right corner with 20pt margin
        const x = pdfW - sigW - 20
        const y = 20
        
        page.drawImage(embedded, { x, y, width: sigW, height: sigH })
        onProgress(60 + (i / pages.length) * 30)
      }
      
      onProgress(90)
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      onProgress(100)
      return blob
    } catch (err) {
      throw new Error(`Failed to sign PDF: ${err.message || err}`)
    }
  }

  function handleReset() {
    setFile(null)
    setPages([])
    setSigDataUrl(null)
    setOverlays([])
    setSelected(null)
    undoRef.current = []
    setOutputFileName('')
    setErrorMsg('')
    setSuccessMsg('')
    setBatchMode(false)
  }

  return (
    <div>
      <h2>Add Signature to PDF</h2>
      <p className="muted">Upload a PDF and signature image, then place and position signatures on pages.</p>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
        <button
          onClick={() => setBatchMode(false)}
          disabled={busy}
          style={{
            padding: '8px 16px',
            backgroundColor: !batchMode ? 'var(--primary)' : 'transparent',
            color: !batchMode ? 'white' : 'var(--text)',
            border: !batchMode ? 'none' : '1px solid var(--border)',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: !batchMode ? 'bold' : 'normal'
          }}
        >
          📄 Single File
        </button>
        <button
          onClick={() => setBatchMode(true)}
          disabled={busy}
          style={{
            padding: '8px 16px',
            backgroundColor: batchMode ? 'var(--primary)' : 'transparent',
            color: batchMode ? 'white' : 'var(--text)',
            border: batchMode ? 'none' : '1px solid var(--border)',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: batchMode ? 'bold' : 'normal'
          }}
        >
          📚 Batch Process
        </button>
      </div>

      {errorMsg && (
        <div className="error-message" ref={errorRef} tabIndex={-1} role="alert">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="success-message" ref={successRef} tabIndex={-1} role="status">
          ✅ {successMsg}
        </div>
      )}

      {batchMode ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong>Upload Signature Image</strong>
              <input aria-label="Upload signature image" type="file" accept="image/*" onChange={onSigUpload} disabled={busy} />
            </label>
          </div>

          {sigDataUrl && (
            <div style={{ marginBottom: 16, padding: 12, border: '1px solid var(--border)', borderRadius: 4 }}>
              <strong>✅ Signature loaded!</strong>
              <p className="muted" style={{ marginTop: 8 }}>
                In batch mode, the signature will be automatically placed in the bottom-right corner of all pages in each PDF.
              </p>
            </div>
          )}

          <UniversalBatchProcessor
            processFile={processBatchFile}
            outputFilenameSuffix="_signed"
            acceptedFileTypes="application/pdf"
            description="Add signatures to multiple PDFs automatically"
          />
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong>1. Select PDF</strong>
              <input aria-label="Select PDF file" type="file" accept="application/pdf" onChange={onFile} disabled={busy} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong>2. Upload Signature Image</strong>
              <input aria-label="Upload signature image" type="file" accept="image/*" onChange={onSigUpload} disabled={busy} />
            </label>
          </div>

          {file && (
            <div className="file-info">
              <strong>📄 PDF:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB) |
              <strong> 📝 Signatures placed:</strong> {overlays.length}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div className="muted">Click a page's "Add" button to place signature, then drag to reposition or resize.</div>
          </div>

          <div ref={containerRef} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {pages.map((p, idx) => (
              <div key={idx} style={{ position: 'relative', border: '1px solid var(--border)', display: 'inline-block' }}>
                <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>
                  <button className="btn-ghost" onClick={() => addOverlayToPage(idx)}>Add</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    {/* attach canvas */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: p.width, height: p.height }}>
                        <div dangerouslySetInnerHTML={{ __html: '' }} />
                        {/* place the canvas element into DOM */}
                        <div ref={el => { if (el && !el.firstChild) el.appendChild(p.canvas) }} />
                      </div>
                      {/* overlays for this page */}
                      {overlays.map((ov, i) => ov.page === idx ? (
                        <Overlay key={i} ov={ov} onStartDrag={(e) => startDrag(e, i)} onStartResize={(e) => startResize(e, i)} />
                      ) : null)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {file && (
            <FilenameInput
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="signed"
            />
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn-primary" onClick={exportSigned} disabled={busy || !file || overlays.length === 0}>
              {busy ? '⏳ Processing...' : '📥 Export Signed PDF'}
            </button>
            <button className="btn-ghost" onClick={deleteSelected} disabled={selected === null || busy}>
              🗑️ Delete Selected
            </button>
            <button className="btn-ghost" onClick={undo} disabled={undoRef.current.length === 0 || busy}>
              ↶ Undo
            </button>
            <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={handleReset} disabled={busy}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
