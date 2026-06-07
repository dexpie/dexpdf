import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Globe, Printer, Settings, Save, FileText, AlertTriangle } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

/**
 * Rebuild PDF object structure and optionally clear standard metadata.
 */
export default function PdfOptimizeTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [optimizeMode, setOptimizeMode] = useState('web') // web, print, custom
  const [removeMetadata, setRemoveMetadata] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [optimizedSize, setOptimizedSize] = useState(0)

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')
    setDownloadUrl(null)

    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setOriginalSize(f.size)
    setOutputFileName(f.name.replace('.pdf', '_optimized.pdf'))

    try {
      const data = await f.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data }).promise

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

  async function optimizePdf() {
    if (!file) return

    setBusy(true)
    setProgress(0)
    setErrorMsg('')

    try {
      const data = await file.arrayBuffer()
      setProgress(10)

      const pdfDoc = await PDFDocument.load(data)
      setProgress(30)

      // Remove metadata if requested
      if (removeMetadata) {
        pdfDoc.setTitle('')
        pdfDoc.setAuthor('')
        pdfDoc.setSubject('')
        pdfDoc.setKeywords([])
        pdfDoc.setProducer('')
        pdfDoc.setCreator('')
      }

      setProgress(50)

      // For web optimization, use object streams for compression
      let saveOptions = { useObjectStreams: true }

      // For print, keep higher quality
      if (optimizeMode === 'print') {
        saveOptions = { useObjectStreams: false }
      }

      setProgress(70)
      const optimizedBytes = await pdfDoc.save(saveOptions)
      setOptimizedSize(optimizedBytes.length)
      setProgress(90)

      const blob = new Blob([optimizedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      const savedKB = Math.round((originalSize - optimizedBytes.length) / 1024)
      const savedPercent = Math.round((1 - optimizedBytes.length / originalSize) * 100)

      if (savedPercent > 0) {
        setSuccessMsg(`Optimized! Saved ${savedKB}KB (${savedPercent}% smaller)`)
      } else {
        setSuccessMsg('PDF is already optimized!')
      }

      setProgress(100)

    } catch (e) {
      console.error('Error optimizing PDF:', e)
      setErrorMsg('Error optimizing PDF. Please try again.')
    }

    setBusy(false)
  }

  function handleReset() {
    setFile(null)
    setDownloadUrl(null)
    setErrorMsg('')
    setSuccessMsg('')
    setThumbnail(null)
    setOriginalSize(0)
    setOptimizedSize(0)
  }

  const modes = [
    {
      id: 'web',
      icon: Globe,
      label: 'Web Optimize',
      desc: 'Use compressed object streams'
    },
    {
      id: 'print',
      icon: Printer,
      label: 'Print Optimize',
      desc: 'Preserve classic PDF structure'
    },
    {
      id: 'custom',
      icon: Settings,
      label: 'Custom',
      desc: 'Choose specific options'
    },
  ]

  if (downloadUrl) {
    return (
      <ResultPage
        title="PDF Optimized!"
        message={successMsg}
        downloadUrl={downloadUrl}
        outputFilename={outputFileName}
        onReset={handleReset}
        thumbnail={thumbnail}
      />
    )
  }

  return (
    <ToolLayout title="Optimize PDF Structure" description="Rebuild PDF object structure and optionally clear standard metadata">
      <div className="max-w-4xl mx-auto">
        {!file && (
          <FileDropZone
            accept=".pdf"
            onChange={handleFileChange}
            icon={<Zap className="w-12 h-12 text-primary" />}
            title="Upload PDF"
            subtitle="Rebuild object structure without changing page appearance"
          />
        )}

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">{file.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Original: {(originalSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground">
                Remove
              </button>
            </div>

            {/* Thumbnail */}
            {thumbnail && (
              <div className="mb-6 flex justify-center">
                <img src={thumbnail} alt="Preview" className="max-h-32 rounded-lg border border-border" />
              </div>
            )}

            {/* Mode Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-3 block">Optimization Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setOptimizeMode(mode.id)}
                    className={`p-4 rounded-xl border transition-all ${
                      optimizeMode === mode.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    <mode.icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium text-sm">{mode.label}</div>
                    <div className={`text-xs ${optimizeMode === mode.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {mode.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Options */}
            {optimizeMode === 'custom' && (
              <div className="mb-6 space-y-3 p-4 bg-secondary rounded-xl">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={removeMetadata}
                    onChange={(e) => setRemoveMetadata(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-foreground">Remove metadata (author, title, creator, and subject)</span>
                </label>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg flex items-center gap-2 text-red-600"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action */}
            <button
              onClick={optimizePdf}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Optimize PDF
                </>
              )}
            </button>

            {busy && (
              <div className="mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 text-center">{progress}%</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
