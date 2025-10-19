import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

export default function RotateTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [batchRotation, setBatchRotation] = useState(90) // 90, 180, 270
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('') // Custom filename
  
  const errorRef = useRef(null)
  const successRef = useRef(null)
  
  useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus() }, [errorMsg])
  useEffect(() => { if (successMsg && successRef.current) successRef.current.focus() }, [successMsg])

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
      setOutputFileName(getDefaultFilename(f, '_rotated'))
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setPages(new Array(pdf.getPageCount()).fill(false))
      setSuccessMsg(`Loaded ${pdf.getPageCount()} pages successfully!`)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
      setFile(null)
      setPages([])
    }
  }

  function toggle(i) { setPages(prev => prev.map((v, idx) => idx === i ? !v : v)) }

  async function rotateAll(direction) {
    if (!file) return
    
    const selectedCount = pages.filter(p => p).length
    if (selectedCount === 0) {
      setErrorMsg('Please select at least one page to rotate.')
      return
    }
    
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    
    try {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const out = await PDFDocument.create()
      const count = src.getPageCount()
      const pagesToCopy = [...Array(count).keys()]
      const copied = await out.copyPages(src, pagesToCopy)
      
      copied.forEach((p, idx) => {
        const should = pages[idx]
        if (should) {
          const deg = direction === 'cw' ? 90 : 270
          p.setRotation(deg)
        }
        out.addPage(p)
      })
      
      const outBytes = await out.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_rotated')
      a.click()
      URL.revokeObjectURL(url)
      
      setSuccessMsg(`Successfully rotated ${selectedCount} page(s) and downloaded!`)
    } catch (err) {
      console.error(err)
      setErrorMsg('Rotation failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }
  
  function handleReset() {
    setFile(null)
    setPages([])
    setOutputFileName('')
    setErrorMsg('')
    setSuccessMsg('')
  }

  // Batch processing: Rotate all pages in multiple PDFs
  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)

      // Load the PDF
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      onProgress(30)

      // Rotate all pages
      const pageCount = pdf.getPageCount()
      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i)
        page.setRotation({ angle: batchRotation })
        onProgress(30 + (i / pageCount) * 50)
      }

      onProgress(80)

      // Save
      const pdfBytes = await pdf.save()
      onProgress(95)

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      onProgress(100)

      return blob
    } catch (error) {
      console.error(`Error rotating ${file.name}:`, error)
      throw error
    }
  }

  return (
    <div>
      <h2>Rotate Pages</h2>
      <p className="muted">Select pages and rotate them clockwise or counter-clockwise.</p>
      
      {/* Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <button 
          className={!batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(false)}
          style={{ minWidth: 120 }}
        >
          📄 Single PDF
        </button>
        <button 
          className={batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(true)}
          style={{ minWidth: 120 }}
        >
          🔄 Batch Rotate
        </button>
      </div>

      {/* Batch Mode */}
      {batchMode && (
        <UniversalBatchProcessor
          toolName="Rotate PDFs"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".pdf"
          maxFiles={100}
          customOptions={
            <div style={{ padding: '12px 0' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                💡 <strong>Batch Rotate Mode:</strong> Rotate all pages in multiple PDFs at once.
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  Rotation:
                  <select 
                    value={batchRotation} 
                    onChange={e => setBatchRotation(Number(e.target.value))}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd' }}
                  >
                    <option value={90}>90° (Clockwise)</option>
                    <option value={180}>180° (Upside Down)</option>
                    <option value={270}>270° (Counter-clockwise)</option>
                  </select>
                </label>
              </div>
              <div style={{ fontSize: 13, color: '#888' }}>
                🔄 All pages in each PDF will be rotated<br />
                📦 Download individual files or all as ZIP<br />
                ⚡ Process up to 100 PDFs simultaneously
              </div>
            </div>
          }
        />
      )}

      {/* Single File Mode */}
      {!batchMode && (
        <div>
      
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
      
      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} disabled={busy} aria-label="Upload PDF to rotate" />
        <div className="muted">Load a PDF then select pages to rotate.</div>
      </div>

      {file && (
        <div className="file-info">
          <strong>📄 File:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}

      {pages.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="muted" style={{ marginBottom: 12 }}>
            Click pages to toggle selection for rotation. Selected: {pages.filter(p => p).length} / {pages.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, marginBottom: 16 }}>
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
                role="checkbox"
                aria-checked={s}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(i) }}
              >
                📄 Page {i + 1}
              </div>
            ))}
          </div>
          
          {file && (
            <FilenameInput 
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="rotated"
            />
          )}
          
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn" onClick={() => rotateAll('cw')} disabled={busy || pages.filter(p => p).length === 0}>
              {busy ? '⏳ Processing...' : '↻ Rotate Clockwise'}
            </button>
            <button className="btn" onClick={() => rotateAll('ccw')} disabled={busy || pages.filter(p => p).length === 0}>
              {busy ? '⏳ Processing...' : '↺ Rotate Counter-Clockwise'}
            </button>
            <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={handleReset} disabled={busy}>
              Reset
            </button>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}
