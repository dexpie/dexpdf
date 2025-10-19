import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) {/*ignore*/ }

export default function OcrTool() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [batchMode, setBatchMode] = useState(false)

  async function loadImageOrPdf(e) {
    const f = e.target.files[0]; if (!f) return
    setFile(f); setText('')
    setBusy(true)
    try {
      if (f.type === 'application/pdf') {
        const data = await f.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data }).promise; const page = await pdf.getPage(1); const viewport = page.getViewport({ scale: 2 }); const canvas = document.createElement('canvas'); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const ctx = canvas.getContext('2d'); await page.render({ canvasContext: ctx, viewport }).promise; await runOcrOnCanvas(canvas)
      } else {
        const img = new Image(); const url = URL.createObjectURL(f); img.src = url; await new Promise(res => img.onload = res); const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); await runOcrOnCanvas(canvas)
      }
    } catch (err) { console.error(err); alert('OCR failed: ' + err.message) }
    finally { setBusy(false) }
  }

  async function runOcrOnCanvas(canvas) {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker({ logger: m => {/*optionally show progress*/ } })
    await worker.load(); await worker.loadLanguage('eng'); await worker.initialize('eng')
    const { data: { text } } = await worker.recognize(canvas)
    setText(text)
    await worker.terminate()
  }

  async function processBatchFile(file) {
    let canvas
    if (file.type === 'application/pdf') {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 2 })
      canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
    } else {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url
      await new Promise(res => img.onload = res)
      canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
    }

    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker({ logger: m => {/*optionally show progress*/ } })
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const { data: { text } } = await worker.recognize(canvas)
    await worker.terminate()

    // Return text as a blob
    return new Blob([text], { type: 'text/plain' })
  }

  return (
    <div>
      <h2>OCR (Tesseract.js)</h2>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setBatchMode(!batchMode)}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: batchMode ? '#3b82f6' : '#fff',
            color: batchMode ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          {batchMode ? 'Switch to Single Mode' : 'Switch to Batch Mode'}
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          accept=".png,.jpg,.jpeg,application/pdf"
          processFile={processBatchFile}
          outputNameSuffix="_ocr.txt"
          taskName="OCR Text Extraction"
        />
      ) : (
        <>
          <div className="dropzone">
            <input type="file" accept=".png,.jpg,.jpeg,application/pdf" onChange={loadImageOrPdf} />
            <div className="muted">Select an image or scanned PDF. Large files may take time; Tesseract runs locally in your browser.</div>
          </div>
          <div style={{ marginTop: 12 }}>
            {busy ? <div className="muted">Recognizing... (this may take a while)</div> : <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>}
          </div>
        </>
      )}
    </div>
  )
}
