import { useState } from 'react'

export default function PDFInfoTool() {
  const [file, setFile] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);
  React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  const handleFile = async (e) => {
    setErrorMsg(''); setSuccessMsg(''); setInfo(null);
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setBusy(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const arr = await f.arrayBuffer()
      const pdf = await PDFDocument.load(arr)
      const meta = pdf.getTitle ? { title: pdf.getTitle?.(), author: pdf.getAuthor?.() } : {}
      setInfo({ pages: pdf.getPageCount(), metadata: meta })
      setSuccessMsg('Berhasil membaca info PDF.');
    } catch (err) {
      setErrorMsg('Gagal membaca PDF: ' + (err.message || err));
      setInfo({ error: 'Could not read PDF' })
      console.error('Error reading PDF', err)
    }
    setBusy(false)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>PDF Info</h2>
      <p>Upload a PDF to view basic information (page count, metadata).</p>
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <input type="file" accept="application/pdf" onChange={handleFile} disabled={busy} />
      {file && (
        <div className="file-list" style={{ margin: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 8, marginBottom: 8, padding: 8, opacity: busy ? 0.7 : 1 }}>
            <div style={{ minWidth: 120, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{file.name}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB</div>
            <button className="btn" onClick={() => { setFile(null); setInfo(null); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy}>Remove</button>
          </div>
        </div>
      )}
      {info && (
        <div style={{ marginTop: 12 }}>
          {info.error ? <div style={{ color: '#dc2626' }}>{info.error}</div> : (
            <div>
              <div>Pages: {info.pages}</div>
              <div>Metadata: <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(info.metadata, null, 2)}</pre></div>
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFile(null); setInfo(null); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || !file}>Reset</button>
      </div>
    </div>
  )
}
