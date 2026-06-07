import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Settings, Image as ImageIcon, Type, Grid, CheckCircle, AlertTriangle, Stamp, FileOutput, FileText, Upload, X } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

/**
 * WatermarkTool - Add text or image watermarks to PDF
 * Supports: text/image mode, opacity, rotation, tiling
 */
export default function WatermarkTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('text') // 'text' or 'image'
  const [text, setText] = useState('WATERMARK')
  const [opacity, setOpacity] = useState(0.3)
  const [rotation, setRotation] = useState(45)
  const [scale, setScale] = useState(1)
  const [tiling, setTiling] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const previewRef = useRef(null)

  // Real-time preview
  useEffect(() => {
    renderPreview()
  }, [text, imageDataUrl, opacity, rotation, scale, tiling, mode])

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')

    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_watermarked'))

    // Get page count and thumbnail
    try {
      const data = await f.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data }).promise
      setPageCount(pdf.numPages)

      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.4 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      setThumbnail(canvas.toDataURL('image/jpeg', 0.7))
    } catch (e) {
      console.warn('Could not generate thumbnail', e)
    }
  }

  async function handleImageFile(e) {
    setErrorMsg('')
    const f = e.target.files?.[0]
    if (!f) return

    // Validate image type
    if (!f.type.startsWith('image/')) {
      setErrorMsg('Please select an image file.')
      return
    }

    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg('Image is too large (max 10MB).')
      return
    }

    setImageFile(f)
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result)
    reader.readAsDataURL(f)
  }

  function clearImage() {
    setImageFile(null)
    setImageDataUrl(null)
  }

  function drawWatermarkOnCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.globalAlpha = Number(opacity)

    const rad = (rotation * Math.PI) / 180

    if (tiling) {
      const s = Number(scale) || 1
      let gapX, gapY
      if (mode === 'text') {
        ctx.font = `${36 * s}px sans-serif`
        ctx.fillStyle = '#94a3b8'
        gapX = 250 * s
        gapY = 150 * s
      } else if (mode === 'image' && imageDataUrl) {
        gapX = (150 * s) + 60
        gapY = (150 * s) + 60
      }

      for (let y = -height; y < height * 2; y += (gapY || 200)) {
        for (let x = -width; x < width * 2; x += (gapX || 300)) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(rad)
          if (mode === 'text') {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(text, 0, 0)
          } else if (imageDataUrl) {
            const img = new Image()
            img.src = imageDataUrl
            const iw = 100 * s
            const ih = 100 * s
            ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih)
          }
          ctx.restore()
        }
      }
    } else {
      // Single centered
      ctx.translate(width / 2, height / 2)
      ctx.rotate(rad)
      const s = Number(scale) || 1

      if (mode === 'text') {
        ctx.font = `${48 * s}px sans-serif`
        ctx.fillStyle = '#94a3b8'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, 0, 0)
      } else if (imageDataUrl) {
        const img = new Image()
        img.src = imageDataUrl
        const iw = 150 * s
        const ih = 150 * s
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

    // Paper background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    // Content placeholder
    ctx.fillStyle = '#f1f5f9'
    for (let i = 40; i < h - 40; i += 25) {
      ctx.fillRect(40, i, w - 80, 8)
    }

    ctx.save()
    drawWatermarkOnCanvas(ctx, w, h)
    ctx.restore()
  }

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  async function applyWatermark() {
    if (!file) {
      setErrorMsg('Please select a PDF file first.')
      return
    }
    if (mode === 'image' && !imageFile) {
      setErrorMsg('Please upload a watermark image.')
      return
    }

    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgress(0)

    try {
      setProgress(10)
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)

      setProgress(25)
      const pages = pdf.getPages()

      let imgBytes = null
      let embeddedImage = null
      if (mode === 'image' && imageFile) {
        imgBytes = await imageFile.arrayBuffer()
        const t = (imageFile.type || '').toLowerCase()
        if (t.includes('png')) embeddedImage = await pdf.embedPng(imgBytes)
        else embeddedImage = await pdf.embedJpg(imgBytes)
      }

      setProgress(40)
      const totalPages = pages.length

      for (let i = 0; i < totalPages; i++) {
        const p = pages[i]
        const { width, height } = p.getSize()
        const progressPercent = 40 + Math.round((i / totalPages) * 40)
        setProgress(progressPercent)

        if (mode === 'text') {
          const fontSize = 48 * Number(scale || 1)
          if (tiling) {
            const gapX = 250 * Number(scale || 1)
            const gapY = 150 * Number(scale || 1)
            for (let y = -gapY; y < height + gapY; y += gapY) {
              for (let x = -gapX; x < width + gapX; x += gapX) {
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
            p.drawText(text, {
              x: width / 2 - (text.length * fontSize * 0.3),
              y: height / 2,
              size: fontSize,
              color: rgb(0.5, 0.5, 0.5),
              opacity: Number(opacity),
              rotate: { type: 'degrees', angle: rotation }
            })
          }
        } else if (mode === 'image' && embeddedImage) {
          const iw = embeddedImage.width * Number(scale || 1) * 0.5
          const ih = embeddedImage.height * Number(scale || 1) * 0.5

          if (tiling) {
            const gapX = iw + 60
            const gapY = ih + 60
            for (let y = -gapY; y < height + gapY; y += gapY) {
              for (let x = -gapX; x < width + gapX; x += gapX) {
                p.drawImage(embeddedImage, {
                  x, y,
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

      setProgress(90)
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setDownloadUrl(url)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'pdf')
      a.click()

      setSuccessMsg('Watermark applied successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to apply watermark: ' + err.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const processBatchFile = async (f, index, onProgress) => {
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

      let embeddedImage = null
      if (mode === 'image' && imageFile) {
        const imgBytes = await imageFile.arrayBuffer()
        const t = (imageFile.type || '').toLowerCase()
        if (t.includes('png')) embeddedImage = await pdf.embedPng(imgBytes)
        else embeddedImage = await pdf.embedJpg(imgBytes)
      }

      onProgress(60)

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]
        const { width, height } = p.getSize()
        const fontSize = 36

        p.drawText(text, {
          x: 50,
          y: height - 50,
          size: fontSize,
          color: rgb(0.5, 0.5, 0.5),
          opacity: Number(opacity),
          rotate: { type: 'degrees', angle: rotation }
        })

        onProgress(60 + (i / pages.length) * 30)
      }

      onProgress(90)
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      onProgress(100)
      return blob
    } catch (err) {
      throw new Error(`Failed to watermark PDF: ${err.message}`)
    }
  }

  const resetFile = () => {
    setFile(null)
    setThumbnail(null)
    setPageCount(0)
    setOutputFileName('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  return (
    <ToolLayout
      title="Watermark PDF"
      description="Add text or image watermarks to your PDF documents"
    >
      {/* Mode Toggle */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setBatchMode(false)}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            !batchMode
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-muted-foreground hover:bg-muted'
          }`}
        >
          📄 Single File
        </button>
        <button
          onClick={() => setBatchMode(true)}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            batchMode
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-muted-foreground hover:bg-muted'
          }`}
        >
          🔄 Batch Watermark
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          toolName="Watermark PDF"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".pdf"
          maxFiles={50}
        />
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {errorMsg}
            </motion.div>
          )}

          {/* Success State */}
          {successMsg && downloadUrl && (
            <ResultPage
              title="Watermark Applied Successfully!"
              description="Your watermarked PDF is ready."
              downloadUrl={downloadUrl}
              downloadFilename={getOutputFilename(outputFileName, 'pdf')}
              sourceFile={{
                name: file?.name || 'watermarked.pdf',
                size: file?.size || 0,
                type: 'application/pdf'
              }}
              toolId="watermark"
              onReset={resetFile}
            />
          )}

          {/* Upload Zone */}
          {!file && (
            <FileDropZone
              onFiles={handleFileChange}
              accept="application/pdf"
              disabled={busy}
              hint="Upload PDF to add watermark"
            />
          )}

          {/* Editor */}
          {file && !successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* File Info */}
              <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-secondary rounded-lg border border-border flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground truncate max-w-[200px]">{file.name}</div>
                    <div className="text-sm text-muted-foreground">{formatBytes(file.size)} • {pageCount} pages</div>
                  </div>
                </div>
                <button
                  onClick={resetFile}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Progress Bar */}
              {busy && (
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Watermark Type Selection */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground font-semibold mb-4">
                    <Stamp className="w-5 h-5 text-primary" />
                    <span>Watermark Type</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMode('text')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        mode === 'text'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <Type className={`w-6 h-6 mx-auto mb-2 ${mode === 'text' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="text-sm font-medium text-foreground">Text</div>
                    </button>
                    <button
                      onClick={() => setMode('image')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        mode === 'image'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <ImageIcon className={`w-6 h-6 mx-auto mb-2 ${mode === 'image' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="text-sm font-medium text-foreground">Image</div>
                    </button>
                  </div>

                  {/* Text Input */}
                  {mode === 'text' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">Watermark Text</label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter watermark text"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  )}

                  {/* Image Upload */}
                  {mode === 'image' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">Upload Image</label>
                      {imageDataUrl ? (
                        <div className="relative">
                          <img src={imageDataUrl} alt="Watermark" className="w-32 h-32 object-contain border border-border rounded-xl" />
                          <button
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Upload</span>
                          <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground font-semibold mb-4">
                    <Settings className="w-5 h-5 text-primary" />
                    <span>Settings</span>
                  </div>

                  {/* Opacity */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-foreground">Opacity</span>
                      <span className="text-primary font-medium">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Rotation */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-foreground">Rotation</span>
                      <span className="text-primary font-medium">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="15"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Scale */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-foreground">Size</span>
                      <span className="text-primary font-medium">{Math.round(scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Tiling */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tiling}
                      onChange={(e) => setTiling(e.target.checked)}
                      className="w-5 h-5 rounded accent-primary"
                    />
                    <span className="text-foreground">Repeat across all pages (tiling)</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="text-foreground font-semibold mb-4">Preview</div>
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                  <canvas
                    ref={previewRef}
                    width={400}
                    height={280}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Output Filename */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <FilenameInput
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  disabled={busy}
                  placeholder="watermarked"
                  label="Output Filename"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={applyWatermark}
                disabled={busy || (mode === 'image' && !imageFile)}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Applying... {progress}%
                  </>
                ) : (
                  <>
                    <Stamp className="w-5 h-5" />
                    Apply Watermark
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
