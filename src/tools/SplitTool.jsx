import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'

export default function SplitTool() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [rotations, setRotations] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('') // Custom filename
  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);
  React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  async function loadFile(e) {
    setErrorMsg(''); setSuccessMsg('');
    const f = e.target.files[0]
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('File harus PDF.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar (maks 50MB).');
      return;
    }
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_extracted'))
    const bytes = await f.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
    setPages(new Array(pdf.getPageCount()).fill(false))
    setRotations(new Array(pdf.getPageCount()).fill(0))
  }

  function toggle(i) {
    setPages(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  function rotate(i) {
    setRotations(prev => prev.map((r, idx) => idx === i ? (r + 90) % 360 : r))
  }

  async function exportSelected() {
    if (!file) return
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const indices = pages.flatMap((v, i) => v ? [i] : [])
      if (indices.length === 0) { setErrorMsg('Pilih halaman yang ingin diekspor.'); setBusy(false); return }
      const out = await PDFDocument.create()
      const copied = await out.copyPages(src, indices)
      copied.forEach((p, idx) => {
        out.addPage(p)
        const originalIndex = indices[idx]
        const deg = rotations[originalIndex] || 0
        if (deg) {
          p.setRotation(deg)
        }
      })
      const outBytes = await out.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'extracted')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Berhasil! Halaman berhasil diekspor dan diunduh.');
    } catch (err) { console.error(err); setErrorMsg('Gagal: ' + (err.message || err)); }
    finally { setBusy(false) }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Split / Extract Pages</h2>
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <div className="dropzone" style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto', border: '2px dashed #3b82f6', borderRadius: 16, padding: 24, marginBottom: 16, background: '#f8fafc' }}>
        <input type="file" accept="application/pdf" onChange={loadFile} disabled={busy} />
        <div className="muted">Load a PDF then select pages to export.</div>
      </div>
      {file && (
        <div style={{ marginBottom: 8, background: '#f9fafb', borderRadius: 8, padding: 8, boxShadow: '0 1px 4px #0001' }}>
          <div style={{ fontWeight: 500, color: '#3b82f6', wordBreak: 'break-all' }}>{file.name}</div>
          <div style={{ color: '#888', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB • {file.lastModified ? new Date(file.lastModified).toLocaleString() : ''}</div>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        {pages.length > 0 && (
          <div>
            <div className="muted">Click pages to toggle selection. Use rotate to change orientation.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, marginTop: 8 }}>
              {pages.map((s, i) => (
                <div key={i} className="file-item" style={{ cursor: busy ? 'not-allowed' : 'pointer', background: s ? '#eef2ff' : '', opacity: busy ? 0.7 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div onClick={() => !busy && toggle(i)} style={{ flex: 1 }}>Page {i + 1} {rotations[i] ? `• ${rotations[i]}°` : ''}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn" onClick={() => rotate(i)} disabled={busy}>Rotate</button>
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
                placeholder="extracted"
              />
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={exportSelected} disabled={busy}>{busy ? 'Working...' : 'Export Selected'}</button>
              <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFile(null); setPages([]); setRotations([]); setOutputFileName(''); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy}>Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
