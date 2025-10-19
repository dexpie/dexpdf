import React, { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import jsPDF from 'jspdf'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'

// set worker (best-effort like other tools)
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (e) { console.warn('pdfjs worker not set', e) }

export default function CompressTool() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dropped, setDropped] = useState(false)
  const [quality, setQuality] = useState(0.9) // default: high quality
  const [scale, setScale] = useState(1) // default: full scale
  const [imgFormat, setImgFormat] = useState('jpeg') // 'jpeg' or 'webp'
  // Check WebP support once
  useEffect(() => {
    const test = document.createElement('canvas')
    if (test.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      setImgFormat('webp')
    }
  }, [])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [originalSize, setOriginalSize] = useState(null)
  const [estimateSize, setEstimateSize] = useState(null)
  const [estimating, setEstimating] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [backendStatus, setBackendStatus] = useState('idle') // idle, checking, online, sleeping, error
  const [outputFileName, setOutputFileName] = useState('') // Custom filename

  // For accessibility: focus error/success
  const errorRef = useRef(null);
  const successRef = useRef(null);
  useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  // refs for cancelling only (no cache for ArrayBuffer)
  const estimateReqRef = useRef(0)
  const debounceRef = useRef(null)

  async function onFile(e) {
    setErrorMsg(''); setSuccessMsg('');
    const f = e.target.files?.[0]
    if (!f) return
    // Validate file type
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('File harus PDF.');
      return;
    }
    // Optional: validate size (misal max 50MB)
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar (maks 50MB).');
      return;
    }
    setFile(f)
    setOriginalSize(f.size)
    setEstimateSize(null)
    setProgressText('')
    setPreviewUrl(null)
    // Set default filename from original file
    setOutputFileName(getDefaultFilename(f, '_compressed'))
    try {
      const data = await f.arrayBuffer()
      // always use a fresh copy for pdfjsLib
      const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise
      setPages(pdf.numPages)
    } catch (err) { console.error(err); setErrorMsg('Unable to read PDF: ' + (err.message || err)) }
  }

  function onDragEnter(e) { e.preventDefault(); if (!busy) setDragging(true) }
  function onDragOverZone(e) { e.preventDefault(); if (!busy) e.dataTransfer.dropEffect = 'copy' }
  function onDragLeave(e) { e.preventDefault(); if (!busy) setDragging(false) }
  async function onDropZone(e) {
    e.preventDefault();
    if (busy) return;
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      setFile(f);
      setOriginalSize(f.size);
      setEstimateSize(null);
      setProgressText('');
      setPreviewUrl(null);
      const data = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
      setPages(pdf.numPages);
      setDropped(true);
      setTimeout(() => setDropped(false), 1500);
    }
  }


  function pxToMm(px) {
    // assume 96 DPI for canvas pixels -> mm
    return px * 25.4 / 96
  }

  async function compressAndDownload({ download = true } = { download: true }) {
    setErrorMsg(''); setSuccessMsg('');
    if (!file) { setErrorMsg('Select a PDF to compress'); return; }
    setBusy(true);
    setBackendStatus('checking');
    try {
      // Cek backend status (wake up)
      const ping = await fetch('https://dexpdfbackend-production.up.railway.app/', { method: 'GET' });
      setBackendStatus('online');
    } catch {
      setBackendStatus('sleeping');
    }
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const response = await fetch('https://dexpdfbackend-production.up.railway.app/compress', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Compression failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getOutputFilename(outputFileName, 'compressed');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg('Berhasil! File terdownload.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Compression failed: ' + (err.message || err));
    } finally {
      setBusy(false);
      setBackendStatus('idle');
    }
  }

  // Estimate compressed size by rasterizing first page and extrapolating
  async function estimateSample() {
    if (!file) return alert('Select a PDF first')
    setEstimating(true)
    setEstimateSize(null)
    setProgressText('Preparing...')
    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise
      const num = pdf.numPages
      setPages(num)
      setProgressText('Rendering sample page...')
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise

      const blob = await new Promise(res => canvas.toBlob(res, imgFormat === 'webp' ? 'image/webp' : 'image/jpeg', Number(quality)))
      const sampleSize = blob ? blob.size : 0
      // naive estimate: sampleSize * numPages (plus small pdf overhead)
      const overhead = 2000
      const est = Math.max(0, Math.round(sampleSize * num + overhead))
      setEstimateSize(est)
      setProgressText('Estimated using sample page at current settings')
      // cleanup
      canvas.width = 0; canvas.height = 0
    } catch (err) { console.error(err); alert('Estimate failed: ' + (err.message || err)) }
    finally { setEstimating(false) }
  }

  // Render first page at specific settings and return estimated total size
  async function estimateForSettings(q, s) {
    // try to reuse cached pdf/doc
    const data = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise
    const num = pdf.numPages
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: s })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
    const blob = await new Promise(res => canvas.toBlob(res, imgFormat === 'webp' ? 'image/webp' : 'image/jpeg', Number(q)))
    const sampleSize = blob ? blob.size : 0
    const overhead = 2000
    canvas.width = 0; canvas.height = 0
    return Math.max(0, Math.round(sampleSize * num + overhead))
  }

  // Estimate a min/current/max range using representative settings
  async function estimateRange() {
    if (!file) return alert('Select a PDF first')
    setEstimating(true)
    setProgressText('Estimating range...')
    try {
      // reuse cached PDF when available
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise
      const num = pdf.numPages
      setPages(num)

      // define representative extremes
      const minQ = 0.1, minS = 0.5
      const maxQ = 1.0, maxS = 1.0
      const curQ = Number(quality), curS = Number(scale)

      setProgressText('Rendering low-quality sample...')
      const currentReq = ++estimateReqRef.current
      const low = await estimateForSettings(minQ, minS)
      if (currentReq !== estimateReqRef.current) throw new Error('Cancelled')
      setProgressText('Rendering current settings sample...')
      const cur = await estimateForSettings(curQ, curS)
      if (currentReq !== estimateReqRef.current) throw new Error('Cancelled')
      setProgressText('Rendering high-quality sample...')
      const high = await estimateForSettings(maxQ, maxS)
      if (currentReq !== estimateReqRef.current) throw new Error('Cancelled')

      // store as object for UI
      setEstimateSize({ low, cur, high })
      setProgressText('Range estimated using first-page extrapolation')
    } catch (err) { console.error(err); alert('Range estimate failed: ' + (err.message || err)) }
    finally { setEstimating(false) }
  }

  // Live estimations: debounce when quality/scale or file changes
  useEffect(() => {
    if (!file) return
    // clear pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)
    // schedule estimate of current settings after short delay
    debounceRef.current = setTimeout(() => {
      // increment request id to allow cancellation
      estimateReqRef.current++
      // perform lightweight sample estimate (current settings)
      (async () => {
        try {
          setEstimating(true)
          setProgressText('Estimating...')
          const cur = await estimateForSettings(Number(quality), Number(scale))
          // if cancelled, bail
          if (estimateReqRef.current === 0) return
          setEstimateSize({ cur })
          setProgressText('Live estimate updated')
        } catch (err) { if (err.message !== 'Cancelled') console.error(err) }
        finally { setEstimating(false) }
      })()
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [file, quality, scale])

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Compress PDF</h2>
      {/* Error & Success messages with aria-live for accessibility */}
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {backendStatus === 'sleeping' && <div style={{ color: '#b45309', marginBottom: 8, background: '#fef3c7', padding: 8, borderRadius: 6 }}>Backend sedang bangun (sleeping), mohon tunggu beberapa detik lalu coba lagi.</div>}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <div className={`dropzone big-dropzone ${dragging ? 'dragover' : ''}`} onDragEnter={onDragEnter} onDragOver={onDragOverZone} onDragLeave={onDragLeave} onDrop={onDropZone} style={{
        border: '2px dashed #3b82f6',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center',
        background: dragging ? '#e0f2fe' : '#f8fafc',
        position: 'relative',
        marginBottom: 16,
        transition: 'background 0.2s',
        opacity: busy ? 0.6 : 1,
        pointerEvents: busy ? 'none' : 'auto',
      }}>
        <input type="file" accept="application/pdf" onChange={onFile} style={{ display: 'none' }} id="pdf-upload-input" disabled={busy} />
        <label htmlFor="pdf-upload-input" style={{ cursor: busy ? 'not-allowed' : 'pointer', display: 'block' }}>
          <div style={{ fontSize: 48, color: '#3b82f6', marginBottom: 8 }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="#3b82f6" d="M12 16V4m0 0-4 4m4-4 4 4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="4" y="16" width="16" height="4" rx="2" fill="#3b82f6" opacity=".15" /></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>Drop PDF here or click to upload</div>
          <div className="muted" style={{ marginTop: 6, color: '#555' }}>
            Kompres PDF: <b>Ukuran kecil, kualitas tetap tinggi</b>.<br />
            <b>Tips:</b> Pilih kualitas tinggi untuk hasil tajam, atau turunkan untuk file lebih kecil.<br />
            {imgFormat === 'webp' ? 'WebP mode aktif (hasil lebih kecil & tajam)' : 'JPEG mode (WebP tidak didukung browser)'}
          </div>
        </label>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-ghost" style={{ minWidth: 110 }} onClick={() => { setQuality(0.95); setScale(1); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy}>High Quality</button>
          <button className="btn-ghost" style={{ minWidth: 110 }} onClick={() => { setQuality(0.8); setScale(0.9); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy}>Balanced</button>
          <button className="btn-ghost" style={{ minWidth: 110 }} onClick={() => { setQuality(0.5); setScale(0.7); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy}>Smallest Size</button>
        </div>
        {dropped && <div className="drop-overlay" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(59,130,246,0.1)',
          color: '#2563eb',
          fontSize: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16
        }}>✓ Uploaded</div>}
      </div>

      {file && (
        <div style={{ marginTop: 12, background: '#f9fafb', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px #0001' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, wordBreak: 'break-all' }}>
            <span style={{ color: '#3b82f6' }}>{file.name}</span> — {pages} pages
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#888' }}>Original:</span> <span style={{ fontWeight: 500 }}>{formatBytes(originalSize)}</span>
            <span style={{ color: '#888' }}>Type:</span> <span style={{ fontWeight: 500 }}>{file.type || 'application/pdf'}</span>
            <span style={{ color: '#888' }}>Last modified:</span> <span style={{ fontWeight: 500 }}>{file.lastModified ? new Date(file.lastModified).toLocaleString() : '-'}</span>
            {estimateSize && typeof estimateSize === 'object' && estimateSize.cur && (
              <>
                <span style={{ color: '#888' }}>→ Compressed:</span> <span style={{ fontWeight: 500, color: '#059669' }}>{formatBytes(estimateSize.cur)}</span>
                <span style={{ color: '#888' }}>({originalSize ? Math.round(100 - (estimateSize.cur / originalSize) * 100) : 0}% smaller)</span>
              </>
            )}
          </div>
          {/* Estimasi hanya berlaku untuk mode browser, bukan backend */}
          {estimateSize && (
            <div style={{ marginTop: 8, color: '#b45309', background: '#fef3c7', padding: 8, borderRadius: 6 }}>
              Estimasi ukuran hanya berlaku untuk mode compress di browser, bukan backend Railway.<br />
              Hasil compress backend biasanya lebih optimal.
            </div>
          )}
          {progressText && (
            <div style={{ marginTop: 8, color: '#6b7280', width: '100%' }}>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
                {(estimating || busy) ? (
                  <div style={{ width: '100%', height: '100%', background: '#3b82f6', animation: 'progressBarAnim 1.2s linear infinite' }} />
                ) : null}
              </div>
              <span>{progressText}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              JPEG Quality:
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(Number(e.target.value))} disabled={busy} />
              <div style={{ width: 44, textAlign: 'right' }}>{Math.round(quality * 100)}%</div>
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              Render Scale:
              <select value={scale} onChange={e => setScale(Number(e.target.value))} disabled={busy}>
                <option value={1}>100%</option>
                <option value={0.9}>90%</option>
                <option value={0.8}>80%</option>
                <option value={0.7}>70%</option>
                <option value={0.6}>60%</option>
                <option value={0.5}>50%</option>
              </select>
            </label>
          </div>
          {/* Custom filename input */}
          <FilenameInput 
            value={outputFileName}
            onChange={(e) => setOutputFileName(e.target.value)}
            disabled={busy}
            placeholder="compressed"
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => compressAndDownload({ download: true })} disabled={busy}>{busy ? 'Compressing...' : 'Compress & Download'}</button>
            {/* Preview hanya untuk mode browser, nonaktifkan jika pakai backend */}
            <button className="btn-outline" disabled title="Preview hanya untuk mode browser">Preview</button>
            <button className="btn-ghost" onClick={estimateSample} disabled={estimating || busy}>{estimating ? 'Estimating...' : 'Estimate size'}</button>
            <button className="btn-ghost" onClick={estimateRange} disabled={estimating || busy}>{estimating ? 'Estimating...' : 'Estimate range (min/cur/max)'}</button>
            <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFile(null); setPages(0); setEstimateSize(null); setOriginalSize(null); setPreviewUrl(null); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy}>Reset</button>
          </div>
          {previewUrl && (
            <div style={{ marginTop: 12 }}>
              <div className="muted">Preview (close tab/window to dismiss):</div>
              <iframe title="compress-preview" src={previewUrl} style={{ width: '100%', height: 400, border: '1px solid #ddd' }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
