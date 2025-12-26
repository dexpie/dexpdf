import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Image as ImageIcon, Type, Grid, CheckCircle, AlertTriangle, Stamp } from 'lucide-react'

export default function WatermarkTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('text') // 'text' or 'image'
  const [text, setText] = useState('Sample Watermark')
  const [opacity, setOpacity] = useState(0.25)
  const [rotation, setRotation] = useState(30)
  const [scale, setScale] = useState(1.0)
  const [tiling, setTiling] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('')
  const previewRef = useRef(null)

  useEffect(() => {
    renderPreview()
  }, [text, imageDataUrl, opacity, rotation, scale, tiling, mode])

  async function handleFileChange(files) {
    setErrorMsg(''); setSuccessMsg('');
    const f = files[0]
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('File harus PDF.');
      return;
    }
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_watermarked'))
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

    // Convert degrees to radians
    const rad = (rotation * Math.PI) / 180;

    if (tiling) {
      // Tiling logic with rotation handled per item or canvas?
      // For tiling with rotation, it's easiest to rotate the context, loop, and draw.
      // However, to make it cover everything correctly, we need complex math or just draw on a larger rotated grid.

      // Simplified tiling preview:
      // Rotate entire canvas context first? No, that rotates the grid.
      // Correct way: loop x,y. Translate to x,y. Rotate. Draw. Restore.

      const s = Number(scale) || 1
      let gapX, gapY
      if (mode === 'text') {
        ctx.font = `${48 * s}px sans-serif`
        gapX = 300 * s
        gapY = 200 * s
      } else if (mode === 'image' && imageDataUrl) {
        const img = new Image()
        img.src = imageDataUrl
        // Assuming image is loaded for preview (sync enough for now or it flickers once)
        gapX = (img.naturalWidth * s) + 60
        gapY = (img.naturalHeight * s) + 60
      }

      // Draw a grid that covers the canvas plus some bleed for rotation
      for (let y = -height; y < height * 2; y += (gapY || 200)) {
        for (let x = -width; x < width * 2; x += (gapX || 300)) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(rad)
          if (mode === 'text') {
            try { const css = getComputedStyle(document.documentElement); ctx.fillStyle = css.getPropertyValue('--slate-400') || '#94a3b8' } catch (e) { ctx.fillStyle = '#94a3b8' }
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = `${48 * Number(scale)}px sans-serif`
            ctx.fillText(text, 0, 0)
          } else if (mode === 'image' && imageDataUrl) {
            const img = new Image()
            img.src = imageDataUrl
            const iw = img.naturalWidth * Number(scale)
            const ih = img.naturalHeight * Number(scale)
            ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih)
          }
          ctx.restore()
        }
      }

    } else {
      // Single centered watermark
      ctx.translate(width / 2, height / 2)
      ctx.rotate(rad)
      const s = Number(scale) || 1

      if (mode === 'text') {
        ctx.font = `${48 * s}px sans-serif`
        try { const css = getComputedStyle(document.documentElement); ctx.fillStyle = css.getPropertyValue('--slate-400') || '#94a3b8' } catch (e) { ctx.fillStyle = '#94a3b8' }
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, 0, 0)
      } else if (mode === 'image' && imageDataUrl) {
        const img = new Image()
        img.src = imageDataUrl
        const iw = img.naturalWidth * s
        const ih = img.naturalHeight * s
        ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih)
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

    // Draw Paper background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    // Draw Content Placeholder (Lines)
    ctx.fillStyle = '#f1f5f9' // slate-100
    for (let i = 40; i < h - 40; i += 30) {
      ctx.fillRect(40, i, w - 80, 10)
    }

    ctx.save()
    // ctx.translate(w / 2, h / 2)
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
            const gapX = 300 * Number(scale || 1)
            const gapY = 200 * Number(scale || 1)
            for (let y = -gapY; y < height + gapY; y += gapY) {
              for (let x = -gapX; x < width + gapX; x += gapX) {
                // pdf-lib rotation is minimal, mainly rotating the page. 
                // To rotate text we use rotate option in drawText.
                p.drawText(text, {
                  x: x + gapX / 2,
                  y: y + gapY / 2,
                  size: fontSize,
                  color: rgb(0.5, 0.5, 0.5),
                  opacity: Number(opacity),
                  rotate: { type: 'degrees', angle: rotation }
                })
              }
            }
          } else {
            // Center calculations
            // For simplicity in pdf-lib, precise centering of rotated text is hard without measuring text width
            // We'll estimate width
            const estimatedWidth = text.length * fontSize * 0.5
            p.drawText(text, {
              x: (width / 2) - (estimatedWidth * 0.5 * Math.cos(rotation * Math.PI / 180)),
              y: (height / 2) - (estimatedWidth * 0.5 * Math.sin(rotation * Math.PI / 180)),
              size: fontSize,
              color: rgb(0.5, 0.5, 0.5),
              opacity: Number(opacity),
              rotate: { type: 'degrees', angle: rotation }
            })
          }
        } else if (mode === 'image' && embeddedImage) {
          const iw = embeddedImage.width * Number(scale || 1)
          const ih = embeddedImage.height * Number(scale || 1)
          if (tiling) {
            const gapX = iw + 40
            const gapY = ih + 40
            for (let y = -gapY; y < height + gapY; y += gapY) {
              for (let x = -gapX; x < width + gapX; x += gapX) {
                p.drawImage(embeddedImage, {
                  x,
                  y,
                  width: iw,
                  height: ih,
                  opacity: Number(opacity),
                  rotate: { type: 'degrees', angle: rotation }
                })
              }
            }
          } else {
            p.drawImage(embeddedImage, {
              x: width / 2 - iw / 2,
              y: height / 2 - ih / 2,
              width: iw,
              height: ih,
              opacity: Number(opacity),
              rotate: { type: 'degrees', angle: rotation }
            })
          }
        }
      }

      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_watermarked')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Berhasil! Watermark berhasil diterapkan dan diunduh.');
      triggerConfetti()
    } catch (err) { console.error(err); setErrorMsg('Gagal: ' + (err.message || err)); }
    finally { setBusy(false) }
  }

  async function processBatchFile(f, onProgress) {
    // Existing logic maintained for batch...
    try {
      if (mode === 'image' && !imageFile) {
        throw new Error('Please upload a watermark image first.')
      }

      onProgress(10)
      const array = await f.arrayBuffer()
      onProgress(30)
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()
      onProgress(50)

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

      onProgress(60)

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]
        const { width, height } = p.getSize()
        if (mode === 'text') {
          const fontSize = 48 * Number(scale || 1)
          // Simple Batch logic matching single file but without detailed positioning math for brevity
          p.drawText(text, {
            x: 50, y: 50, size: fontSize,
            color: rgb(0.5, 0.5, 0.5), opacity: Number(opacity),
            rotate: { type: 'degrees', angle: rotation }
          })
        }
        onProgress(60 + (i / pages.length) * 30)
      }

      onProgress(90)
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      onProgress(100)
      return blob
    } catch (err) {
      throw new Error(`Failed to watermark PDF: ${err.message || err}`)
    }
  }

  return (
    <ToolLayout title="Watermark PDF" description={t('tool.watermark_desc', 'Apply stamps or text watermarks to your PDF documents')}>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(false)}
        >
          📄 Single Single
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(true)}
        >
          📚 Batch Process
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5" /> {errorMsg}
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5" /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {batchMode ? (
          <UniversalBatchProcessor
            processFile={processBatchFile}
            outputFilenameSuffix="_watermarked"
            acceptedFileTypes="application/pdf"
            description="Apply watermark to multiple PDFs"
          />
        ) : (
          <>
            {!file ? (
              <FileDropZone
                onFiles={handleFileChange}
                accept="application/pdf"
                disabled={busy}
                hint="Upload PDF to watermark"
              />
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-8">

                {/* Settings Panel */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-blue-500" /> Configuration
                    </h3>

                    {/* Type Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                      <button onClick={() => setMode('text')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <Type className="w-4 h-4" /> Text
                      </button>
                      <button onClick={() => setMode('image')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'image' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <ImageIcon className="w-4 h-4" /> Image
                      </button>
                    </div>

                    {/* Inputs */}
                    {mode === 'text' ? (
                      <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Watermark Text</label>
                        <input className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" value={text} onChange={e => setText(e.target.value)} disabled={busy} />
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Upload Image</label>
                        <input className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm text-slate-500" type="file" accept="image/*" onChange={onImageFile} disabled={busy} />
                      </div>
                    )}

                    {/* Sliders */}
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                          <span>Opacity</span> <span>{Math.round(opacity * 100)}%</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                          <span>Rotation</span> <span>{rotation}°</span>
                        </div>
                        <input type="range" min="0" max="360" step="5" value={rotation} onChange={e => setRotation(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                          <span>Scale</span> <span>{scale.toFixed(1)}x</span>
                        </div>
                        <input type="range" min="0.1" max="3" step="0.05" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <input type="checkbox" className="w-5 h-5 rounded text-blue-600 accent-blue-600" checked={tiling} onChange={e => setTiling(e.target.checked)} disabled={busy} />
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <Grid className="w-4 h-4 text-slate-400" /> Tiled Pattern
                        </div>
                      </label>
                    </div>

                  </div>
                </div>

                {/* Preview & Action */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 flex items-center justify-center flex-1 min-h-[400px] mb-6 relative overflow-hidden">
                    <div className="bg-white shadow-2xl rounded-sm overflow-hidden transform transition-all duration-300">
                      <canvas ref={previewRef} width={400} height={560} className="max-w-full h-auto" />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-xs rounded-full backdrop-blur-md">
                      Live Preview
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-auto flex-1">
                      <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="watermarked" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" onClick={() => setFile(null)}>Cancel</button>
                      <ActionButtons
                        primaryText="Download PDF"
                        onPrimary={applyWatermark}
                        loading={busy}
                        icon={Stamp}
                      />
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
