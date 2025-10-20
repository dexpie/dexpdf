import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) { }

export default function PdfToTextTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dropped, setDropped] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('')
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
    setOutputFileName(getDefaultFilename(f))
  }

  function onDragEnter(e) { e.preventDefault(); if (!busy) setDragging(true) }
  function onDragOverZone(e) { e.preventDefault(); if (!busy) e.dataTransfer.dropEffect = 'copy' }
  function onDragLeave(e) { e.preventDefault(); if (!busy) setDragging(false) }
  async function onDropZone(e) { e.preventDefault(); if (busy) return; setDragging(false); const f = e.dataTransfer?.files?.[0]; if (f) { setFile(f); setDropped(true); setTimeout(() => setDropped(false), 1500); } }

  async function extract() {
    if (!file) { setErrorMsg('Pilih file PDF terlebih dahulu.'); return; }
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      let out = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const txtContent = await page.getTextContent()
        const strings = txtContent.items.map(it => it.str)
        out += `\n--- Page ${i} ---\n` + strings.join(' ') + '\n'
      }
      const blob = new Blob([out], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, ''), '.txt')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Berhasil! Teks berhasil diekstrak dan diunduh.');
    } catch (err) { console.error(err); setErrorMsg('Gagal: ' + (err.message || err)); }
    finally { setBusy(false) }
  }

  // Batch processing: Extract text from multiple PDFs
  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)

      // Load PDF
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      onProgress(25)

      // Extract text from all pages
      let out = ''
      const numPages = pdf.numPages

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const txtContent = await page.getTextContent()
        const strings = txtContent.items.map(it => it.str)
        out += `\n--- Page ${i} ---\n` + strings.join(' ') + '\n'

        // Update progress for each page
        onProgress(25 + (i / numPages) * 65)
      }

      onProgress(90)

      // Create text blob
      const blob = new Blob([out], { type: 'text/plain' })
      onProgress(100)

      return blob
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error)
      throw error
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>PDF → Text</h2>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <button
          className={!batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(false)}
          style={{ minWidth: 120 }}
        >
          📄 Single File
        </button>
        <button
          className={batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(true)}
          style={{ minWidth: 120 }}
        >
          🔄 Batch Extract
        </button>
      </div>

      {/* Batch Mode */}
      {batchMode && (
        <UniversalBatchProcessor
          toolName="Extract Text"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".txt"
          maxFiles={100}
          customOptions={
            <div style={{ padding: '12px 0' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                💡 <strong>Batch Extract Mode:</strong> Extract text from multiple PDFs at once.
              </div>
              <div style={{ fontSize: 13, color: '#888' }}>
                📝 Plain text extraction with page separators<br />
                📦 Download individual .txt files or all as ZIP<br />
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
            <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
          )}
          {successMsg && (
            <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
          )}
          {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
          <div className={`dropzone ${dragging ? 'dragover' : ''}`} onDragEnter={onDragEnter} onDragOver={onDragOverZone} onDragLeave={onDragLeave} onDrop={onDropZone} style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto', border: '2px dashed #3b82f6', borderRadius: 16, padding: 24, marginBottom: 16, background: '#f8fafc' }}>
            <input type="file" accept="application/pdf" onChange={loadFile} disabled={busy} />
            <div className="muted">Select a PDF to extract text (plain text).</div>
            {dropped && <div className="drop-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(59,130,246,0.1)', color: '#2563eb', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}>✓ Uploaded</div>}
          </div>
          {file && (
            <div style={{ marginBottom: 8, background: '#f9fafb', borderRadius: 8, padding: 8, boxShadow: '0 1px 4px #0001' }}>
              <div style={{ fontWeight: 500, color: '#3b82f6', wordBreak: 'break-all' }}>{file.name}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB • {file.lastModified ? new Date(file.lastModified).toLocaleString() : ''}</div>
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
            <button className="btn-primary" onClick={extract} disabled={busy || !file}>{busy ? 'Working...' : 'Extract Text'}</button>
            <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFile(null); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || !file}>Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}
