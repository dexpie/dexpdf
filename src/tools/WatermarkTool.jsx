import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'

export default function WatermarkTool() {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('text') // 'text' or 'image'
  const [text, setText] = useState('Sample Watermark')
  const [opacity, setOpacity] = useState(0.25)
  const [rotation, setRotation] = useState(30) // degrees
  const [scale, setScale] = useState(1.0)
  const [tiling, setTiling] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const errorRef = useRef(null);
  const successRef = useRef(null);
  useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);
  const previewRef = useRef(null)

  useEffect(() => {
    // update preview when watermark params change
    renderPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, imageDataUrl, opacity, rotation, scale, tiling, mode])

  async function onFile(e) {
    setErrorMsg(''); setSuccessMsg('');
    const f = e.target.files?.[0]
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
  }

  async function onImageFile(e) {
    setErrorMsg(''); setSuccessMsg('');
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result)
    reader.readAsDataURL(f)
  }

  function drawWatermarkOnCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.globalAlpha = Number(opacity)
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    const s = Number(scale) || 1
    if (mode === 'text') {
      ctx.font = `${48 * s}px sans-serif`
      // use CSS variable for text color if available
      try { const css = getComputedStyle(document.documentElement); ctx.fillStyle = css.getPropertyValue('--muted') || '#444' } catch (e) { ctx.fillStyle = '#444' }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (tiling) {
        // simple tiling grid
        const gapX = 300 * s
        const gapY = 200 * s
        for (let y = -height; y < height * 2; y += gapY) {
          for (let x = -width; x < width * 2; x += gapX) {
            ctx.save()
            ctx.translate(x, y)
            ctx.fillText(text, 0, 0)
            ctx.restore()
          }
        }
      } else {
        ctx.fillText(text, 0, 0)
      }
    } else if (mode === 'image' && imageDataUrl) {
      // draw image(s)
      const img = new Image()
      img.src = imageDataUrl
      // draw when loaded
      img.onload = () => {
        const iw = img.naturalWidth * s
        const ih = img.naturalHeight * s
        if (tiling) {
          const gapX = iw + 60
          const gapY = ih + 60
          for (let y = -height; y < height * 2; y += gapY) {
            for (let x = -width; x < width * 2; x += gapX) {
              ctx.drawImage(img, x, y, iw, ih)
            }
          }
        } else {
          ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih)
        }
      }
    }
    ctx.restore()
  }

  function renderPreview() {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    // light paper background
    try { const css = getComputedStyle(document.documentElement); ctx.fillStyle = css.getPropertyValue('--paper') || '#fff'; ctx.strokeStyle = css.getPropertyValue('--border') || '#ddd' } catch (e) { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ddd' }
    ctx.fillRect(0, 0, w, h)
    // draw page border
    ctx.strokeRect(10, 10, w - 20, h - 20)
    // draw watermark centered in the inner area
    ctx.save()
    ctx.translate(w / 2, h / 2)
    drawWatermarkOnCanvas(ctx, w, h)
    ctx.restore()
  }

  async function applyWatermark() {
    if (!file) { setErrorMsg('Pilih file PDF terlebih dahulu.'); return; }
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()

      // If image mode and have an image, prepare bytes and embed
      let imgBytes = null
      let embeddedImage = null
      let isPng = false
      if (mode === 'image' && imageFile) {
        imgBytes = await imageFile.arrayBuffer()
        const t = (imageFile.type || '').toLowerCase()
        isPng = t.includes('png')
        if (isPng) embeddedImage = await pdf.embedPng(imgBytes)
        else embeddedImage = await pdf.embedJpg(imgBytes)
      }

      for (const p of pages) {
        const { width, height } = p.getSize()
        if (mode === 'text') {
          const fontSize = 48 * Number(scale || 1)
          if (tiling) {
            // tile text across page
            const gapX = 300 * Number(scale || 1)
            const gapY = 200 * Number(scale || 1)
            for (let y = -gapY; y < height + gapY; y += gapY) {
              for (let x = -gapX; x < width + gapX; x += gapX) {
                p.drawText(text, { x: x + gapX / 2, y: y + gapY / 2, size: fontSize, color: rgb(0.4, 0.4, 0.4), opacity: Number(opacity) })
              }
            }
          } else {
            p.drawText(text, { x: width / 2 - (text.length * fontSize * 0.12), y: height / 2, size: fontSize, color: rgb(0.4, 0.4, 0.4), opacity: Number(opacity) })
          }
        } else if (mode === 'image' && embeddedImage) {
          const iw = embeddedImage.width * Number(scale || 1)
          const ih = embeddedImage.height * Number(scale || 1)
          if (tiling) {
            const gapX = iw + 40
            const gapY = ih + 40
            for (let y = -gapY; y < height + gapY; y += gapY) {
              for (let x = -gapX; x < width + gapX; x += gapX) {
                p.drawImage(embeddedImage, { x, y, width: iw, height: ih, opacity: Number(opacity) })
              }
            }
          } else {
            p.drawImage(embeddedImage, { x: width / 2 - iw / 2, y: height / 2 - ih / 2, width: iw, height: ih, opacity: Number(opacity) })
          }
        }
      }

      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i, '') + '_watermarked.pdf'
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Berhasil! Watermark berhasil diterapkan dan diunduh.');
    } catch (err) { console.error(err); setErrorMsg('Gagal: ' + (err.message || err)); }
    finally { setBusy(false) }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Watermark PDF</h2>
      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}
      {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
      <div style={{ marginBottom: 8, background: '#f9fafb', borderRadius: 8, padding: 8, boxShadow: '0 1px 4px #0001' }}>
        <input type="file" accept="application/pdf" onChange={onFile} disabled={busy} />
        {file && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 500, color: '#3b82f6', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB • {file.lastModified ? new Date(file.lastModified).toLocaleString() : ''}</div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" name="mode" value="text" checked={mode === 'text'} onChange={() => setMode('text')} disabled={busy} /> Text
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" name="mode" value="image" checked={mode === 'image'} onChange={() => setMode('image')} disabled={busy} /> Image
        </label>
        {mode === 'image' && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            Image: <input type="file" accept="image/*" onChange={onImageFile} disabled={busy} />
          </label>
        )}
      </div>
      {mode === 'text' && (
        <div style={{ marginTop: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)} style={{ width: '60%' }} disabled={busy} />
        </div>
      )}
      <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Opacity
          <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => setOpacity(Number(e.target.value))} disabled={busy} />
          <div style={{ width: 48, textAlign: 'right' }}>{Math.round(opacity * 100)}%</div>
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Rotation
          <input type="number" value={rotation} onChange={e => setRotation(Number(e.target.value))} style={{ width: 80 }} disabled={busy} />
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Scale
          <input type="range" min="0.1" max="3" step="0.05" value={scale} onChange={e => setScale(Number(e.target.value))} disabled={busy} />
          <div style={{ width: 48, textAlign: 'right' }}>{scale.toFixed(2)}x</div>
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={tiling} onChange={e => setTiling(e.target.checked)} disabled={busy} /> Tiling
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="muted">Preview</div>
        <canvas aria-label="Watermark preview" ref={previewRef} width={600} height={800} style={{ width: '100%', maxWidth: 600, display: 'block', border: '1px solid var(--border)', background: 'var(--paper)' }} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={applyWatermark} disabled={busy || !file}>{busy ? 'Working...' : 'Apply Watermark'}</button>
        <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFile(null); setImageFile(null); setImageDataUrl(null); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || !file}>Reset</button>
      </div>
    </div>
  )
}
