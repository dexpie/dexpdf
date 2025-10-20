import { useState, useRef, useEffect } from 'react'

export default function PDFInfoTool() {
  const [file, setFile] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const errorRef = useRef(null);
  const successRef = useRef(null);
  useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

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

      // Get metadata correctly from pdf-lib
      const title = pdf.getTitle() || 'No title'
      const author = pdf.getAuthor() || 'Unknown author'
      const subject = pdf.getSubject() || 'No subject'
      const creator = pdf.getCreator() || 'Unknown creator'
      const producer = pdf.getProducer() || 'Unknown producer'
      const creationDate = pdf.getCreationDate()
      const modificationDate = pdf.getModificationDate()

      setInfo({
        pages: pdf.getPageCount(),
        title,
        author,
        subject,
        creator,
        producer,
        creationDate: creationDate ? creationDate.toISOString() : 'Unknown',
        modificationDate: modificationDate ? modificationDate.toISOString() : 'Unknown',
        fileSize: f.size,
        fileName: f.name
      })
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
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
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
        <div style={{ marginTop: 16, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          {info.error ? (
            <div style={{ color: '#dc2626', fontWeight: 500 }}>{info.error}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
                📄 PDF Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, fontSize: 14 }}>
                <div style={{ fontWeight: 600, color: '#6b7280' }}>File Name:</div>
                <div style={{ color: '#1f2937', wordBreak: 'break-word' }}>{info.fileName}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>File Size:</div>
                <div style={{ color: '#1f2937' }}>
                  {(info.fileSize / 1024).toFixed(2)} KB ({(info.fileSize / (1024 * 1024)).toFixed(2)} MB)
                </div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Total Pages:</div>
                <div style={{ color: '#1f2937', fontWeight: 600 }}>{info.pages}</div>

                <div style={{ fontWeight: 600, color: '#6b7280', paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>Title:</div>
                <div style={{ color: '#1f2937', paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>{info.title}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Author:</div>
                <div style={{ color: '#1f2937' }}>{info.author}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Subject:</div>
                <div style={{ color: '#1f2937' }}>{info.subject}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Creator:</div>
                <div style={{ color: '#1f2937' }}>{info.creator}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Producer:</div>
                <div style={{ color: '#1f2937' }}>{info.producer}</div>

                <div style={{ fontWeight: 600, color: '#6b7280', paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>Created:</div>
                <div style={{ color: '#1f2937', paddingTop: 8, borderTop: '1px solid #e5e7eb', fontSize: 13 }}>
                  {info.creationDate === 'Unknown' ? 'Unknown' : new Date(info.creationDate).toLocaleString('id-ID')}
                </div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Modified:</div>
                <div style={{ color: '#1f2937', fontSize: 13 }}>
                  {info.modificationDate === 'Unknown' ? 'Unknown' : new Date(info.modificationDate).toLocaleString('id-ID')}
                </div>
              </div>
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
