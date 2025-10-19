import React, { useRef, useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) {/*ignore*/ }

export default function AnnotateTool() {
  const [file, setFile] = useState(null)
  const [pageImg, setPageImg] = useState(null)
  const canvasRef = useRef()
  const [drawing, setDrawing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [outputFileName, setOutputFileName] = useState('')

  async function loadFile(e) {
    const f = e.target.files[0]
    if (!f) return

    setErrorMsg('')
    setSuccessMsg('')

    if (!f.type.includes('pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    try {
      setBusy(true)
      setFile(f)
      setOutputFileName(getDefaultFilename(f, '_annotated'))
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      setPageImg(canvas.toDataURL('image/png'))
      setSuccessMsg('PDF loaded! Draw on the canvas to annotate.')
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
      setFile(null)
      setPageImg(null)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const c = canvasRef.current; if (!c || !pageImg) return
    const ctx = c.getContext('2d')
    const img = new Image(); img.onload = () => { c.width = img.width; c.height = img.height; ctx.drawImage(img, 0, 0) }; img.src = pageImg
  }, [pageImg])

  function start(e) { setDrawing(true); draw(e) }
  function stop() { setDrawing(false); }
  function draw(e) { if (!drawing) return; const c = canvasRef.current; const rect = c.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const ctx = c.getContext('2d'); ctx.fillStyle = 'rgba(255,0,0,0.6)'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill() }

  function clearCanvas() {
    if (!canvasRef.current || !pageImg) return
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0)
    img.src = pageImg
    setSuccessMsg('Canvas cleared!')
  }

  async function exportAnnotated() {
    if (!file || !canvasRef.current) return

    setErrorMsg('')
    setBusy(true)

    try {
      const blob = await new Promise(res => canvasRef.current.toBlob(res, 'image/png'))
      const pdfDoc = await PDFDocument.create()
      const imgBytes = await blob.arrayBuffer()
      const img = await pdfDoc.embedPng(imgBytes)
      const page = pdfDoc.addPage([img.width, img.height])
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
      const outBytes = await pdfDoc.save()
      const outBlob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(outBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_annotated')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Annotated PDF exported successfully!')
    } catch (err) {
      console.error(err)
      setErrorMsg('Export failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  function handleReset() {
    setFile(null)
    setPageImg(null)
    setErrorMsg('')
    setSuccessMsg('')
  }

  return (
    <div>
      <h2>Annotate PDF</h2>
      <p className="muted">Draw annotations on the first page of your PDF.</p>

      {errorMsg && (
        <div className="error-message" role="alert">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="success-message" role="status">
          ✅ {successMsg}
        </div>
      )}

      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} disabled={busy} />
        <div className="muted">Load a PDF (first page shown). Click and drag to draw annotations.</div>
      </div>

      {file && !pageImg && busy && (
        <div style={{ marginTop: 12 }}>⏳ Loading PDF...</div>
      )}

      {pageImg && (
        <div style={{ marginTop: 12 }}>
          <div style={{ border: '2px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <canvas
              ref={canvasRef}
              onMouseDown={start}
              onMouseUp={stop}
              onMouseMove={draw}
              style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
            />
          </div>
          {file && (
            <FilenameInput
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="output_annotated"
            />
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={exportAnnotated} disabled={busy}>
              {busy ? '⏳ Exporting...' : '📥 Export Annotated PDF'}
            </button>
            <button className="btn-ghost" onClick={clearCanvas} disabled={busy}>
              🧹 Clear Drawings
            </button>
            <button className="btn-ghost" style={{ color: '#dc2626' }} onClick={handleReset} disabled={busy}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
