import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Download, FileText, Settings, AlertTriangle, CheckCircle, Layers } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * PdfToWebPTool - Convert PDF pages to WebP images (for web)
 */
export default function PdfToWebPTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [quality, setQuality] = useState(80) // 1-100
  const [scale, setScale] = useState(2)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [previewImages, setPreviewImages] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [outputFileName, setOutputFileName] = useState('')

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')
    setPreviewImages([])

    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setOutputFileName(f.name.replace('.pdf', ''))

    try {
      const data = await f.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data }).promise
      setPageCount(pdf.numPages)

      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise

      // Convert to webp using canvas
      const webpDataUrl = canvas.toDataURL('image/webp', quality / 100)
      setPreviewImages([webpDataUrl])

    } catch (e) {
      console.error('Error loading PDF:', e)
      setErrorMsg('Could not load PDF. Please try another file.')
    }
  }

  async function convertToWebP() {
    if (!file) return

    setBusy(true)
    setProgress(0)
    setErrorMsg('')

    try {
      const data = await file.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data }).promise
      const numPages = pdf.numPages

      const zip = new JSZip()
      const folder = zip.folder('webp_images')

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise

        // Convert to WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality / 100)
        const base64 = webpDataUrl.split(',')[1]
        folder.file(`page_${i}.webp`, base64, { base64: true })

        setProgress(Math.round((i / numPages) * 80))
      }

      setProgress(90)
      const zipContent = await zip.generateAsync({ type: 'blob' })
      setProgress(100)

      saveAs(zipContent, `${outputFileName}_webp_images.zip`)
      setSuccessMsg(`Converted ${numPages} pages to WebP!`)

    } catch (e) {
      console.error('Error converting:', e)
      setErrorMsg('Error converting PDF. Please try again.')
    }

    setBusy(false)
  }

  function handleReset() {
    setFile(null)
    setPreviewImages([])
    setErrorMsg('')
    setSuccessMsg('')
    setPageCount(0)
  }

  const qualities = [
    { value: 60, label: 'Small (60%)' },
    { value: 80, label: 'Medium (80%)' },
    { value: 90, label: 'High (90%)' },
    { value: 100, label: 'Maximum (100%)' },
  ]

  return (
    <ToolLayout title="PDF to WebP" description="Convert PDF to WebP images for web">
      <div className="max-w-4xl mx-auto">
        {!file && (
          <FileDropZone
            accept=".pdf"
            onChange={handleFileChange}
            icon={<Monitor className="w-12 h-12 text-primary" />}
            title="Upload PDF"
            subtitle="Convert PDF pages to WebP images (optimized for web)"
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
                <p className="text-sm text-muted-foreground">{pageCount} page(s)</p>
              </div>
              <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground">
                Remove
              </button>
            </div>

            {/* Preview */}
            {previewImages.length > 0 && (
              <div className="mb-6 flex justify-center">
                <img src={previewImages[0]} alt="Preview" className="max-h-48 rounded-lg border border-border" />
              </div>
            )}

            {/* Quality */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-3 block">WebP Quality: {quality}%</label>
              <div className="flex gap-2">
                {qualities.map(q => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      quality === q.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-muted'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-3 block">Resolution Scale: {scale}x</label>
              <div className="flex gap-2">
                {[1, 1.5, 2, 3].map(s => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      scale === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-muted'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="mb-4 p-3 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">
                WebP images are optimized for web use - smaller file size with good quality.
              </p>
            </div>

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
              onClick={convertToWebP}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Converting... {progress}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to WebP
                </>
              )}
            </button>

            {busy && (
              <div className="mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
