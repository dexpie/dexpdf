import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
// load heavy libs dynamically to keep initial bundle smaller

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (e) { console.warn('pdfjs worker not set', e) }

export default function PdfToPptTool() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [previews, setPreviews] = useState([]) // {dataUrl, selected}

  async function loadFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreviews([])
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
      await pres.writeFile({ fileName: file.name.replace(/\.pdf$/i, '') + '.pptx' })
    } catch (err) { console.error(err); alert('Conversion failed: ' + err.message) }
    finally { setBusy(false) }
  }

  return (
    <div>
      <h2>PDF → PPTX</h2>
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

      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={convert} disabled={busy || previews.length === 0}>{busy ? 'Converting...' : 'Convert to PPTX'}</button>
      </div>
    </div>
  )
}
