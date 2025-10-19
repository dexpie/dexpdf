import React, { useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
// import heavy libs only when needed

export default function PptToPdfTool() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('')
  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);
  React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  function loadFile(e) {
    setErrorMsg(''); setSuccessMsg('');
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setOutputFileName(getDefaultFilename(f))
  }

  async function convert() {
    if (!file) { setErrorMsg('Pilih file PPTX terlebih dahulu.'); return; }
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const data = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(data)
      const mediaFiles = Object.keys(zip.files).filter(k => k.startsWith('ppt/media/'))
      const images = []
      for (const m of mediaFiles) {
        const content = await zip.file(m).async('blob')
        images.push(content)
      }

      if (images.length === 0) {
        setErrorMsg('Tidak ditemukan gambar slide di PPTX. Hanya mendukung PPTX dengan gambar slide.');
        setBusy(false); return
      }

      if (images.length > 0) {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({ unit: 'px', format: 'a4' })
        for (let i = 0; i < images.length; i++) {
          const blob = images[i]
          const imgUrl = URL.createObjectURL(blob)
          const img = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.src = imgUrl })
          const w = doc.internal.pageSize.getWidth()
          const h = doc.internal.pageSize.getHeight()
          doc.addImage(img, 'PNG', 0, 0, w, h)
          if (i < images.length - 1) doc.addPage()
          URL.revokeObjectURL(imgUrl)
        }
        doc.save(getOutputFilename(outputFileName, file.name.replace(/\.pptx$/i, '')))
        setSuccessMsg('Berhasil! PDF berhasil dibuat dan diunduh.');
      } else {
        const out = new JSZip()
        for (let i = 0; i < images.length; i++) {
          const buf = await images[i].arrayBuffer()
          out.file(`slide_${i + 1}.png`, buf)
        }
        const blob = await out.generateAsync({ type: 'blob' })
        saveAs(blob, file.name.replace(/\.pptx$/i, '') + '_slides.zip')
        setSuccessMsg('Berhasil! ZIP gambar slide diunduh.');
      }

    } catch (err) {
      setErrorMsg('Gagal: ' + (err.message || err));
      console.error(err);
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>PPTX → PDF</h2>
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <div className="dropzone" style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto', border: '2px dashed #3b82f6', borderRadius: 16, padding: 24, marginBottom: 16, background: '#f8fafc' }}>
        <input type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={loadFile} disabled={busy} />
        <div className="muted">Select a PPTX. If the file contains embedded slide images, they'll be converted to PDF pages; otherwise you'll get a ZIP of extracted images.</div>
      </div>
      {file && (
        <div className="file-list" style={{ margin: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 8, marginBottom: 8, padding: 8, opacity: busy ? 0.7 : 1 }}>
            <div style={{ minWidth: 120, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{file.name}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB</div>
            <button className="btn" onClick={() => setFile(null)} disabled={busy}>Remove</button>
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
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={convert} disabled={!file || busy}>{busy ? 'Converting...' : 'Convert to PDF'}</button>
        <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFile(null); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || !file}>Reset</button>
      </div>
    </div>
  )
}
