import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'

// Ensure worker is set from pdfjs-dist
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (e) { console.warn('pdfjs worker not set', e) }

export default function PdfToImagesTool() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(0.92)
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
    
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large (max 50MB).')
      return
    }
    
    try {
      setFile(f)
      setOutputFileName(getDefaultFilename(f))
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      setPages(new Array(pdf.numPages).fill(false))
      setSuccessMsg(`Loaded ${pdf.numPages} pages. Select pages to export.`)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
      setFile(null)
      setPages([])
    }
  }

  function toggle(i) { setPages(prev => prev.map((v, idx) => idx === i ? !v : v)) }

  async function renderAndDownload() {
    if (!file) return
    
    const indices = pages.flatMap((v, i) => v ? [i + 1] : [])
    if (indices.length === 0) {
      setErrorMsg('Please select at least one page to export.')
      return
    }
    
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    
    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const toZip = []
      for (const pnum of indices) {
        const page = await pdf.getPage(pnum)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg'
        const blob = await new Promise(res => 
          format === 'png' ? canvas.toBlob(res, 'image/png') : canvas.toBlob(res, mimeType, quality)
        )
        toZip.push({ pnum, blob })
      }

      const ext = format === 'png' ? '.png' : format === 'webp' ? '.webp' : '.jpg'
      
      if (indices.length === 1) {
        // single file: download directly
        const b = toZip[0].blob
        const url = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + `_page_${toZip[0].pnum}`, ext)
        a.click()
        URL.revokeObjectURL(url)
        setSuccessMsg(`Exported 1 page as ${format.toUpperCase()}!`)
      } else {
        // multiple: create zip
        const zip = new JSZip()
        for (const item of toZip) {
          const arr = await item.blob.arrayBuffer()
          zip.file(`${file.name.replace(/\.pdf$/i, '')}_page_${item.pnum}${ext}`, arr)
        }
        const content = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(content)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_pages', '.zip')
        a.click()
        URL.revokeObjectURL(url)
        setSuccessMsg(`Exported ${indices.length} pages as ${format.toUpperCase()} in ZIP!`)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Export failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }
  
  function handleReset() {
    setFile(null)
    setPages([])
    setErrorMsg('')
    setSuccessMsg('')
  }

  return (
    <div>
      <h2>PDF → Images</h2>
      <p className="muted">Convert PDF pages to image files (PNG, JPEG, or WEBP).</p>
      
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
        <div className="muted">Select a PDF, then choose pages and format to export.</div>
      </div>
      
      {file && (
        <div className="file-info">
          <strong>📄 File:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}
      
      {pages.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 300 }}>
              <strong>Output Format:</strong>
              <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={busy} className="select">
                <option value="png">PNG (Lossless, larger file)</option>
                <option value="jpeg">JPEG (Compressed, smaller file)</option>
                <option value="webp">WEBP (Modern, best quality/size)</option>
              </select>
            </label>
            
            {format !== 'png' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, maxWidth: 300 }}>
                <strong>Quality: {Math.round(quality * 100)}%</strong>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1" 
                  step="0.05" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))} 
                  disabled={busy}
                />
              </label>
            )}
          </div>
          
          <div className="muted" style={{ marginBottom: 8 }}>
            Click pages to select. Selected: {pages.filter(p => p).length} / {pages.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))', gap: 8, marginBottom: 16 }}>
            {pages.map((s, i) => (
              <div 
                key={i} 
                className="file-item" 
                onClick={() => toggle(i)} 
                style={{ 
                  cursor: 'pointer', 
                  background: s ? '#eef2ff' : '',
                  border: s ? '2px solid #4f46e5' : '1px solid var(--border)',
                  fontWeight: s ? '600' : '400'
                }}
              >
                📄 {i + 1}
              </div>
            ))}
          </div>
          {file && (
            <FilenameInput
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="output"
            />
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={renderAndDownload} disabled={busy || pages.filter(p => p).length === 0}>
              {busy ? '⏳ Rendering...' : `📥 Export as ${format.toUpperCase()}`}
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
