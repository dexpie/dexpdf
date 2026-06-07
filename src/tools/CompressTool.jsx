import React, { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { Settings, Zap, CloudLightning, FileText, CheckCircle, AlertCircle, Target, ArrowDown, ArrowUp, FileOutput } from 'lucide-react'
import { motion } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * CompressTool - Compress PDF with quality settings
 * Features: Multiple compression levels, target size, progress tracking
 */
export default function CompressTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quality, setQuality] = useState(0.7) // 0-1, lower = more compression
  const [scale, setScale] = useState(1)
  const [imgFormat, setImgFormat] = useState('jpeg')
  const [compressionMode, setCompressionMode] = useState('balanced') // 'balanced', 'maximum', 'least'
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)

  // Check WebP support
  useEffect(() => {
    const test = document.createElement('canvas')
    if (test.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      setImgFormat('webp')
    }
  }, [])

  // Compression presets
  const presets = {
    least: { quality: 0.9, scale: 1.0, label: 'Less Compression', desc: 'Best quality, larger file' },
    balanced: { quality: 0.7, scale: 1.0, label: 'Balanced', desc: 'Good quality, smaller file' },
    maximum: { quality: 0.5, scale: 0.75, label: 'More Compression', desc: 'Smaller file, lower quality' },
  }

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey]
    setCompressionMode(presetKey)
    setQuality(preset.quality)
    setScale(preset.scale)
  }

  async function onFile(files) {
    setErrorMsg('')
    setSuccessMsg('')
    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('File is too large (max 50MB).')
      return
    }

    setFile(f)
    setOriginalSize(f.size)
    setOutputFileName(getDefaultFilename(f, '_compressed'))

    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      setPages(pdf.numPages)
    } catch (err) {
      console.error(err)
      setErrorMsg('Unable to read PDF: ' + (err.message || err))
    }
  }

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  function getSavingsPercent() {
    if (!originalSize || !compressedSize) return 0
    return Math.round((1 - compressedSize / originalSize) * 100)
  }

  async function compress() {
    if (!file) return
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgress(0)

    try {
      setProgress(10)
      const inputBuffer = await file.arrayBuffer()
      const source = await pdfjsLib.getDocument({ data: inputBuffer }).promise
      const newPdf = await PDFDocument.create()

      // Raster compression makes image quality and scale controls effective.
      // It intentionally flattens interactive content and selectable text.
      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
        setProgress(15 + Math.round((pageNumber / source.numPages) * 70))
        const sourcePage = await source.getPage(pageNumber)
        const baseViewport = sourcePage.getViewport({ scale: 1 })
        const renderViewport = sourcePage.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(renderViewport.width)
        canvas.height = Math.ceil(renderViewport.height)
        const context = canvas.getContext('2d', { alpha: false })
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        await sourcePage.render({ canvasContext: context, viewport: renderViewport }).promise
        const jpegBlob = await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode page image.')), 'image/jpeg', quality))
        const image = await newPdf.embedJpg(await jpegBlob.arrayBuffer())
        const outputPage = newPdf.addPage([baseViewport.width, baseViewport.height])
        outputPage.drawImage(image, { x: 0, y: 0, width: baseViewport.width, height: baseViewport.height })
      }

      setProgress(85)
      const compressedBytes = await newPdf.save({ useObjectStreams: true, objectsPerTick: 50 })
      setProgress(95)

      // Create download
      const blob = new Blob([compressedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setCompressedSize(blob.size)
      setProgress(100)

      // Download
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'pdf')
      a.click()

      setDownloadUrl(url)
      triggerConfetti()
      setSuccessMsg('PDF Compressed Successfully!')
    } catch (err) {
      console.error(err)
      setErrorMsg('Compression failed: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout
      title="Compress PDF"
      description="Raster-compress PDF pages with adjustable image quality. Interactive content will be flattened."
    >
      <div className="flex flex-col gap-6">
        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Success State */}
        {successMsg ? (
          <ResultPage
            title="PDF Compressed Successfully!"
            description="Your compressed PDF is ready. Download it below."
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: file?.name || 'compressed.pdf',
              size: compressedSize,
              type: 'application/pdf'
            }}
            toolId="compress"
            stats={[
              { label: 'Original', value: formatBytes(originalSize) },
              { label: 'Compressed', value: formatBytes(compressedSize) },
              { label: 'Savings', value: `${getSavingsPercent()}%`, highlight: true },
            ]}
            onReset={() => {
              setFile(null)
              setSuccessMsg('')
              setDownloadUrl(null)
              setCompressedSize(0)
            }}
          />
        ) : (
          <>
            {/* Upload Zone */}
            <FileDropZone
              onFiles={onFile}
              accept="application/pdf"
              disabled={busy}
              hint="Select a PDF file to compress"
            />

            {/* File Info & Settings */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                {/* File Info Header */}
                <div className="p-4 bg-secondary/50 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground truncate">{file.name}</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{pages} {pages === 1 ? 'page' : 'pages'}</span>
                        <span>·</span>
                        <span>{formatBytes(file.size)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {busy && (
                  <div className="h-1 bg-secondary">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Compression Settings */}
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Compression Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {Object.entries(presets).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => applyPreset(key)}
                          disabled={busy}
                          className={`
                            p-4 rounded-xl border text-left transition-all
                            ${compressionMode === key
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                              : 'border-border hover:border-primary/30'
                            }
                          `}
                        >
                          <div className="font-medium text-foreground text-sm">{preset.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{preset.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-foreground">
                        Image Quality
                      </label>
                      <span className="text-sm font-mono text-primary">{Math.round(quality * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.1"
                      value={quality}
                      onChange={(e) => {
                        setQuality(parseFloat(e.target.value))
                        setCompressionMode('custom')
                      }}
                      disabled={busy}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Smaller file</span>
                      <span>Better quality</span>
                    </div>
                    <p className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                      Compression rasterizes pages. Links, forms, and selectable text will be flattened.
                    </p>
                  </div>

                  {/* Output Filename */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Output Filename
                    </label>
                    <FilenameInput
                      value={outputFileName}
                      onChange={e => setOutputFileName(e.target.value)}
                      placeholder="compressed"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border bg-secondary/30 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => { setFile(null); setErrorMsg(''); }}
                    disabled={busy}
                    className="px-5 py-2.5 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors disabled:opacity-50"
                  >
                    Choose Different File
                  </button>
                  <button
                    onClick={compress}
                    disabled={busy || !file}
                    className="flex-1 sm:flex-none px-8 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {busy ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Compressing... {progress}%
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Compress PDF
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
