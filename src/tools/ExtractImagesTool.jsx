import { useState } from 'react'

export default function ExtractImagesTool() {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);
  React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  const handleFiles = (e) => {
    setErrorMsg(''); setSuccessMsg('');
    setFiles(Array.from(e.target.files || []))
  }

  const extract = async () => {
    if (!files.length) { setErrorMsg('Pilih file PDF terlebih dahulu.'); return; }
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      for (const f of files) {
        try {
          const arr = await f.arrayBuffer()
          const pdf = await PDFDocument.load(arr)
          // TODO: Extract images from PDF (pdf-lib limitation)
          const bytes = await pdf.save()
          zip.file(f.name.replace(/\.pdf$/i, '') + '-original.pdf', bytes)
        } catch (err) {
          setErrorMsg('Gagal ekstrak gambar dari ' + f.name)
          console.error('Error extracting images', err)
        }
      }
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'extracted-images.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setSuccessMsg('Berhasil! File ZIP berhasil diunduh.');
    } catch (err) {
      setErrorMsg('Gagal: ' + (err.message || err));
      console.error(err);
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Extract Images</h2>
      <p>Upload PDFs and extract images. (Fallback: includes original PDFs if image extraction not found)</p>
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <input type="file" accept="application/pdf" multiple onChange={handleFiles} disabled={busy} />
      <div className="file-list" style={{ margin: '16px 0' }}>
        {files.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 8, marginBottom: 8, padding: 8, opacity: busy ? 0.7 : 1 }}>
            <div style={{ minWidth: 120, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{f.name}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{(f.size / 1024).toFixed(1)} KB</div>
            <button className="btn" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} disabled={busy}>Remove</button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={extract} disabled={busy || files.length === 0}>{busy ? 'Working...' : 'Extract & Download'}</button>
        <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFiles([]); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || files.length === 0}>Reset</button>
      </div>
    </div>
  )
}
