import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AlignLeft, AlignCenter, AlignRight, Type, Settings, Save, X, FileText, AlertTriangle } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

/**
 * HeaderFooterTool - Add header or footer to PDF pages
 */
export default function HeaderFooterTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [fontSize, setFontSize] = useState(12)
  const [alignment, setAlignment] = useState('center') // left, center, right
  const [position, setPosition] = useState('both') // header, footer, both
  const [margin, setMargin] = useState(30)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [thumbnail, setThumbnail] = useState(null)

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
    setOutputFileName(f.name.replace('.pdf', '_header_footer.pdf'))

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

  async function processPdf() {
    if (!file) return
    if (!headerText && !footerText) {
      setErrorMsg('Please enter header or footer text.')
      return
    }

    setBusy(true)
    setProgress(0)
    setErrorMsg('')

    try {
      const data = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(data)
      const pages = pdfDoc.getPages()
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

      setProgress(20)

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize()
        const textSize = fontSize

        // Add header
        if ((position === 'header' || position === 'both') && headerText) {
          let x
          if (alignment === 'left') x = margin
          else if (alignment === 'right') x = width - helveticaFont.widthOfTextAtSize(headerText, textSize) - margin
          else x = (width - helveticaFont.widthOfTextAtSize(headerText, textSize)) / 2

          page.drawText(headerText, {
            x,
            y: height - margin - textSize,
            size: textSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          })
        }

        // Add footer
        if ((position === 'footer' || position === 'both') && footerText) {
          let x
          if (alignment === 'left') x = margin
          else if (alignment === 'right') x = width - helveticaFont.widthOfTextAtSize(footerText, textSize) - margin
          else x = (width - helveticaFont.widthOfTextAtSize(footerText, textSize)) / 2

          page.drawText(footerText, {
            x,
            y: margin,
            size: textSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          })
        }

        setProgress(20 + ((idx + 1) / pages.length) * 60)
      })

      setProgress(90)
      const modifiedPdfBytes = await pdfDoc.save()
      setProgress(100)

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setSuccessMsg('Header and footer added successfully!')

    } catch (e) {
      console.error('Error adding header/footer:', e)
      setErrorMsg('Error processing PDF. Please try again.')
    }

    setBusy(false)
  }

  function handleReset() {
    setFile(null)
    setHeaderText('')
    setFooterText('')
    setDownloadUrl(null)
    setErrorMsg('')
    setSuccessMsg('')
    setThumbnail(null)
  }

  const alignments = [
    { id: 'left', icon: AlignLeft, label: 'Left' },
    { id: 'center', icon: AlignCenter, label: 'Center' },
    { id: 'right', icon: AlignRight, label: 'Right' },
  ]

  const positions = [
    { id: 'header', label: 'Header Only' },
    { id: 'footer', label: 'Footer Only' },
    { id: 'both', label: 'Both' },
  ]

  if (downloadUrl) {
    return (
      <ResultPage
        title="Header & Footer Added!"
        message={successMsg}
        downloadUrl={downloadUrl}
        outputFilename={outputFileName}
        onReset={handleReset}
        thumbnail={thumbnail}
      />
    )
  }

  return (
    <ToolLayout title="Header & Footer" description="Add header or footer to PDF pages">
      <div className="max-w-4xl mx-auto">
        {!file && (
          <FileDropZone
            accept=".pdf"
            onChange={handleFileChange}
            icon={<AlignCenter className="w-12 h-12 text-primary" />}
            title="Upload PDF"
            subtitle="Add header or footer text to all pages"
          />
        )}

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">{file.name}</h3>
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

            {/* Position */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Add To</label>
              <div className="flex gap-2">
                {positions.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      position === pos.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-muted'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Header Text */}
            {(position === 'header' || position === 'both') && (
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Header Text</label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Enter header text..."
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}

            {/* Footer Text */}
            {(position === 'footer' || position === 'both') && (
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Footer Text</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Enter footer text..."
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}

            {/* Alignment */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Alignment</label>
              <div className="flex gap-2">
                {alignments.map(align => (
                  <button
                    key={align.id}
                    onClick={() => setAlignment(align.id)}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                      alignment === align.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-muted'
                    }`}
                  >
                    <align.icon className="w-4 h-4" />
                    {align.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Font Size: {fontSize}px</label>
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Margin */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">Margin: {margin}px</label>
              <input
                type="range"
                min="10"
                max="100"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-destructive/10 dark:bg-red-950/30 border border-red-200 rounded-lg flex items-center gap-2 text-red-600"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action */}
            <button
              onClick={processPdf}
              disabled={busy || (!headerText && !footerText)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Add Header & Footer
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