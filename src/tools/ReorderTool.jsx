import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) {/*ignore*/ }

function move(arr, from, to) { const a = arr.slice(); const v = a.splice(from, 1)[0]; a.splice(to, 0, v); return a }

export default function ReorderTool() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([]) // {thumb, index}
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('')
  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);
  React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  async function loadFile(e) {
    setErrorMsg(''); setSuccessMsg('');
    const f = e.target.files[0]; if (!f) return
    setFile(f); setPages([])
    setOutputFileName(getDefaultFilename(f, '_reordered'))
    setBusy(true)
    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const out = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        out.push({ thumb: canvas.toDataURL('image/png'), idx: i - 1 })
      }
      setPages(out)
      setSuccessMsg('Berhasil memuat PDF.');
    } catch (err) {
      setErrorMsg('Gagal memuat PDF: ' + (err.message || err));
      console.error(err);
    }
    setBusy(false)
  }

  function onDragStart(e, idx) { e.dataTransfer.setData('text/plain', idx) }
  function onDrop(e, idx) { e.preventDefault(); const from = parseInt(e.dataTransfer.getData('text/plain'), 10); setPages(p => move(p, from, idx)) }

  async function exportPdf() {
    if (!file) { setErrorMsg('Pilih file PDF terlebih dahulu.'); return; }
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const out = await PDFDocument.create()
      const order = pages.map(p => p.idx)
      const copied = await out.copyPages(src, order)
      copied.forEach(p => out.addPage(p))
      const outBytes = await out.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_reordered'); a.click(); URL.revokeObjectURL(url)
      setSuccessMsg('Berhasil! PDF berhasil diekspor dan diunduh.');
    } catch (err) {
      setErrorMsg('Gagal ekspor PDF: ' + (err.message || err));
      console.error(err);
    }
    setBusy(false)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Reorder Pages</h2>
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <div className="dropzone" style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto', border: '2px dashed #3b82f6', borderRadius: 16, padding: 24, marginBottom: 16, background: '#f8fafc' }}>
        <input type="file" accept="application/pdf" onChange={loadFile} disabled={busy} />
        <div className="muted">Drag thumbnails to reorder pages, then export.</div>
      </div>
      {file && (
        <div className="file-list" style={{ margin: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 8, marginBottom: 8, padding: 8, opacity: busy ? 0.7 : 1 }}>
            <div style={{ minWidth: 120, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{file.name}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB</div>
            <button className="btn" onClick={() => { setFile(null); setPages([]); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy}>Remove</button>
          </div>
        </div>
      )}
      {pages.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: 8 }}>
            {pages.map((p, i) => (
              <div key={i} className="file-item" draggable={!busy} onDragStart={e => !busy && onDragStart(e, i)} onDragOver={e => e.preventDefault()} onDrop={e => !busy && onDrop(e, i)} style={{ textAlign: 'center', opacity: busy ? 0.7 : 1 }}>
                <img src={p.thumb} style={{ width: '100%', height: 100, objectFit: 'cover' }} alt={`page-${i + 1}`} />
                <div style={{ fontSize: 12, marginTop: 6 }}>Pos {i + 1}</div>
              </div>
            ))}
          </div>
          {file && (
            <FilenameInput
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="output_reordered"
            />
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={exportPdf} disabled={busy}>{busy ? 'Exporting...' : 'Export Reordered PDF'}</button>
            <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFile(null); setPages([]); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || !file}>Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}
