import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
// load heavy libs dynamically to keep initial bundle smaller

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (e) { console.warn('pdfjs worker not set', e) }

export default function PdfToPptTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [previews, setPreviews] = useState([]) // {dataUrl, selected}
  const [outputFileName, setOutputFileName] = useState('')

  async function loadFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreviews([])
    setOutputFileName(getDefaultFilename(f))
    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const out = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        const dataUrl = canvas.toDataURL('image/png')
        out.push({ dataUrl, selected: true })
      }
      setPreviews(out)
    } catch (err) { console.error(err); alert('Failed to render preview: ' + err.message) }
  }

  function toggle(i) {
    setPreviews(prev => prev.map((p, idx) => idx === i ? { ...p, selected: !p.selected } : p))
  }

  async function convert() {
    if (!file || previews.length === 0) return
    setBusy(true)
    try {
      const PPTX = (await import('pptxgenjs')).default
      const pres = new PPTX()
      for (const p of previews) {
        if (!p.selected) continue
        const slide = pres.addSlide()
        slide.addImage({ data: p.dataUrl, x: 0, y: 0, w: '100%', h: '100%' })
      }
      await pres.writeFile({ fileName: getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, ''), '.pptx') })
    } catch (err) { console.error(err); alert('Conversion failed: ' + err.message) }
    finally { setBusy(false) }
  }

  async function processBatchFile(f, onProgress) {
    try {
      onProgress(10)
      const data = await f.arrayBuffer()
      onProgress(20)
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const numPages = pdf.numPages
      onProgress(30)

      const PPTX = (await import('pptxgenjs')).default
      const pres = new PPTX()
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        const dataUrl = canvas.toDataURL('image/png')
        
        const slide = pres.addSlide()
        slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' })
        
        onProgress(30 + (i / numPages) * 60)
      }
      
      onProgress(90)
      const blob = await pres.write({ outputType: 'blob' })
      onProgress(100)
      return blob
    } catch (err) {
      throw new Error(`Failed to convert PDF to PPTX: ${err.message || err}`)
    }
  }

  return (
    <div>
      <h2>PDF → PPTX</h2>
      
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

      {batchMode ? (
        <div>
          <p style={{ marginBottom: 16, padding: 12, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 4 }}>
            <strong>Batch Mode:</strong> Convert multiple PDFs to PowerPoint (.pptx) files. Each page becomes a slide with an image.
            <br />
            <em style={{ fontSize: '0.9em', color: 'var(--muted)' }}>Note: Slides are exported as images — text isn't editable in PowerPoint.</em>
          </p>
          
          <UniversalBatchProcessor
            processFile={processBatchFile}
            outputFilenameSuffix=""
            acceptedFileTypes="application/pdf"
            description="Convert multiple PDFs to PowerPoint presentations"
            outputFileExtension=".pptx"
          />
        </div>
      ) : (
        <div>
          <div className="dropzone">
            <input type="file" accept="application/pdf" onChange={loadFile} />
            <div className="muted">Select a PDF — each page will become a PPTX slide (image). You can preview and deselect pages before export.</div>
            <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>Note: slides are exported as images — text isn't editable in PowerPoint.</div>
          </div>

          {previews.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="muted">Preview (click to toggle include)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, marginTop: 8 }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ border: p.selected ? '2px solid #3b82f6' : '1px solid #ddd', padding: 6, cursor: 'pointer' }} onClick={() => toggle(i)}>
                    <img src={p.dataUrl} style={{ width: '100%', height: 120, objectFit: 'cover' }} alt={`page-${i + 1}`} />
                    <div style={{ fontSize: 12, marginTop: 6, textAlign: 'center' }}>Page {i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {file && (
            <FilenameInput
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="output"
            />
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={convert} disabled={busy || previews.length === 0}>{busy ? 'Converting...' : 'Convert to PPTX'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
