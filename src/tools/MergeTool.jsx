import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) { }

export default function MergeTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('merged') // Custom filename
  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);
  React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  async function handleFiles(e) {
    setErrorMsg(''); setSuccessMsg('');
    const list = Array.from(e.target.files)
    const loaded = []
    for (const f of list) {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Semua file harus PDF.');
        continue;
      }
      if (f.size > 50 * 1024 * 1024) {
        setErrorMsg('Ukuran file terlalu besar (maks 50MB).');
        continue;
      }
      const thumb = await generatePdfThumbnail(f)
      loaded.push({ file: f, thumb })
    }
    setFiles(prev => prev.concat(loaded))
  }

  async function merge() {
    if (!files.length) return
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const merged = await PDFDocument.create()
      for (const entry of files) {
        const f = entry.file
        const bytes = await f.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const copied = await merged.copyPages(pdf, pdf.getPageIndices())
        copied.forEach(p => merged.addPage(p))
      }
      const out = await merged.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'merged')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Berhasil! File PDF berhasil digabung dan diunduh.');
    } catch (err) {
      console.error(err)
      setErrorMsg('Gagal menggabungkan: ' + (err.message || err));
    } finally { setBusy(false) }
  }

  function remove(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  function moveUp(i) {
    setFiles(prev => {
      if (i <= 0) return prev
      const copy = prev.slice()
      const t = copy[i - 1]
      copy[i - 1] = copy[i]
      copy[i] = t
      return copy
    })
  }

  function moveDown(i) {
    setFiles(prev => {
      if (i >= prev.length - 1) return prev
      const copy = prev.slice()
      const t = copy[i + 1]
      copy[i + 1] = copy[i]
      copy[i] = t
      return copy
    })
  }

  // drag-n-drop handlers
  function onDragStart(e, idx) {
    e.dataTransfer.setData('text/plain', String(idx))
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  function onDrop(e, idx) {
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    if (Number.isNaN(from)) return
    setFiles(prev => {
      const copy = prev.slice()
      const [item] = copy.splice(from, 1)
      copy.splice(idx, 0, item)
      return copy
    })
  }

  async function generatePdfThumbnail(file) {
    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      return canvas.toDataURL('image/png')
    } catch (err) {
      return null
    }
  }

  // Batch processing: For merge in batch mode, we'll merge each file with optimization
  // Note: In batch mode for "merge", each PDF could be optimized/processed individually
  // This is different from single mode where multiple PDFs are merged into one
  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)

      // Load the PDF
      const bytes = await file.arrayBuffer()
      onProgress(30)

      // Load and optimize
      const pdf = await PDFDocument.load(bytes)
      onProgress(60)

      // Save (this will optimize the PDF)
      const optimized = await pdf.save()
      onProgress(90)

      // Create blob
      const blob = new Blob([optimized], { type: 'application/pdf' })
      onProgress(100)

      return blob
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
      throw error
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Merge PDF</h2>
      
      {/* Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <button 
          className={!batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(false)}
          style={{ minWidth: 120 }}
        >
          📄 Merge Multiple
        </button>
        <button 
          className={batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(true)}
          style={{ minWidth: 120 }}
        >
          🔄 Batch Optimize
        </button>
      </div>

      {/* Batch Mode */}
      {batchMode && (
        <UniversalBatchProcessor
          toolName="Optimize PDFs"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".pdf"
          maxFiles={100}
          customOptions={
            <div style={{ padding: '12px 0' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                💡 <strong>Batch Optimize Mode:</strong> Process multiple PDFs individually with optimization.
              </div>
              <div style={{ fontSize: 13, color: '#888' }}>
                ⚡ Each PDF is optimized and compressed<br />
                📦 Download individual files or all as ZIP<br />
                💾 Original files remain unchanged
              </div>
            </div>
          }
        />
      )}

      {/* Single Merge Mode */}
      {!batchMode && (
        <div>
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <div className="dropzone" style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto', border: '2px dashed #3b82f6', borderRadius: 16, padding: 24, marginBottom: 16, background: '#f8fafc' }}>
        <input type="file" accept="application/pdf" multiple onChange={handleFiles} disabled={busy} />
        <div className="muted">Pilih beberapa file PDF. Urutan file bisa diubah sebelum digabung.</div>
      </div>
      <div className="file-list">
        {files.map((entry, i) => (
          <div className="file-item" key={i} draggable={!busy} onDragStart={e => !busy && onDragStart(e, i)} onDragOver={onDragOver} onDrop={e => !busy && onDrop(e, i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f9fafb', borderRadius: 8, marginBottom: 8, padding: 8, opacity: busy ? 0.7 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <div style={{ width: 56, height: 40, flex: 'none', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                {entry.thumb ? <img src={entry.thumb} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="thumb" /> : <div className="muted">PDF</div>}
              </div>
              <div style={{ minWidth: 120, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{entry.file.name}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{(entry.file.size / 1024).toFixed(1)} KB</div>
              <div style={{ color: '#888', fontSize: 13 }}>{entry.file.lastModified ? new Date(entry.file.lastModified).toLocaleDateString() : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => moveUp(i)} disabled={i === 0 || busy}>↑</button>
              <button className="btn" onClick={() => moveDown(i)} disabled={i === files.length - 1 || busy}>↓</button>
              <button className="btn" onClick={() => remove(i)} disabled={busy}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      {files.length > 0 && (
        <FilenameInput 
          value={outputFileName}
          onChange={(e) => setOutputFileName(e.target.value)}
          disabled={busy}
          placeholder="merged"
        />
      )}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={merge} disabled={busy || files.length === 0}>{busy ? 'Working...' : 'Merge & Download'}</button>
        <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFiles([]); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || files.length === 0}>Reset</button>
      </div>
      </div>
      )}
    </div>
  )
}
