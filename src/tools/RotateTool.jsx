import React, { useState, useEffect, useCallback } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw, RotateCcw, RefreshCw, FileText, CheckCircle, AlertTriangle, X, ArrowLeftRight, Layers, Grid, CheckSquare, Square } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

/**
 * RotateTool - Rotate PDF pages with visual editor
 */
export default function RotateTool() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([]) // { thumb, rotation, selected }
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [selectedCount, setSelectedCount] = useState(0)
  const [isSelecting, setIsSelecting] = useState(false)

  async function loadFile(files) {
    const f = files[0]
    if (!f) return

    setErrorMsg('')
    setSuccessMsg('')

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large (max 50MB).')
      return
    }

    try {
      setFile(f)
      setOutputFileName(getDefaultFilename(f, '_rotated'))

      // Generate thumbnails with rotations
      const data = await f.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data }).promise
      const numPages = pdf.numPages

      const loadedPages = []
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.35 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise

        loadedPages.push({
          id: `page-${i}-${Date.now()}`,
          pageNumber: i,
          thumb: canvas.toDataURL('image/jpeg', 0.7),
          rotation: 0,
          selected: true // All selected by default
        })
      }
      setPages(loadedPages)
      setSelectedCount(numPages)
      setSuccessMsg(`Loaded ${numPages} pages`)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
      setFile(null)
      setPages([])
    }
  }

  // Selection handlers
  const handlePageClick = useCallback((index, e) => {
    if (e.shiftKey && pages.length > 0) {
      // Range select
      const lastSelected = pages.findIndex(p => p.selected)
      const start = Math.min(lastSelected, index)
      const end = Math.max(lastSelected, index)
      setPages(prev => prev.map((p, i) => ({
        ...p,
        selected: i >= start && i <= end
      })))
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle
      setPages(prev => prev.map((p, i) =>
        i === index ? { ...p, selected: !p.selected } : p
      ))
    } else {
      // Single select
      setPages(prev => prev.map((p, i) => ({
        ...p,
        selected: i === index
      })))
    }
  }, [pages])

  const handleMouseDown = (index, e) => {
    if (e.target.closest('.page-actions')) return
    setIsSelecting(true)
    handlePageClick(index, e)
  }

  const handleMouseEnter = (index) => {
    if (isSelecting) {
      setPages(prev => prev.map((p, i) =>
        i === index ? { ...p, selected: true } : p
      ))
    }
  }

  const handleMouseUp = () => {
    setIsSelecting(false)
  }

  // Update selected count
  useEffect(() => {
    setSelectedCount(pages.filter(p => p.selected).length)
  }, [pages])

  // Rotation
  const rotateSelected = (degrees) => {
    setPages(prev => prev.map(p => {
      if (p.selected) {
        return { ...p, rotation: (p.rotation + degrees + 360) % 360 }
      }
      return p
    }))
  }

  const rotatePage = (index, degrees) => {
    setPages(prev => prev.map((p, i) => {
      if (i === index) {
        return { ...p, rotation: (p.rotation + degrees + 360) % 360 }
      }
      return p
    }))
  }

  // Selection helpers
  const selectAll = () => setPages(prev => prev.map(p => ({ ...p, selected: true })))
  const selectNone = () => setPages(prev => prev.map(p => ({ ...p, selected: false })))
  const invertSelection = () => setPages(prev => prev.map(p => ({ ...p, selected: !p.selected })))

  // Quick rotate buttons
  const rotate90CW = () => rotateSelected(90)
  const rotate90CCW = () => rotateSelected(-90)
  const rotate180 = () => rotateSelected(180)

  async function savePdf() {
    if (!file || pages.length === 0) return

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    setProgress(0)

    try {
      setProgress(20)
      const bytes = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(bytes)

      setProgress(40)
      const outPdf = await PDFDocument.create()
      const pageIndices = pages.map((_, i) => i)

      setProgress(60)
      const copiedPages = await outPdf.copyPages(srcPdf, pageIndices)

      setProgress(80)
      copiedPages.forEach((p, i) => {
        const currentRotation = p.getRotation().angle
        const newRotation = (currentRotation + pages[i].rotation) % 360
        p.setRotation(degrees(newRotation))
        outPdf.addPage(p)
      })

      setProgress(95)
      const outBytes = await outPdf.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'pdf')
      a.click()

      setDownloadUrl(url)
      setSuccessMsg('PDF rotated successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to save PDF: ' + err.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const resetFile = () => {
    setFile(null)
    setPages([])
    setSelectedCount(0)
    setOutputFileName('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate PDF pages by 90, 180, or 270 degrees"
    >
      <div className="max-w-6xl mx-auto" onMouseUp={handleMouseUp} onMouseLeave={() => setIsSelecting(false)}>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-2 mb-6"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        {/* Success State */}
        {successMsg && downloadUrl && (
          <ResultPage
            title="PDF Rotated Successfully!"
            description="Your rotated PDF is ready to download."
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: file?.name || 'rotated.pdf',
              size: file?.size || 0,
              type: 'application/pdf'
            }}
            toolId="rotate"
            onReset={resetFile}
          />
        )}

        {/* Upload Zone */}
        {!file && (
          <FileDropZone
            onFiles={loadFile}
            accept="application/pdf"
            disabled={busy}
            hint="Upload PDF to rotate pages"
          />
        )}

        {/* Editor */}
        {file && pages.length > 0 && !successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{file.name}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-sm text-muted-foreground">{pages.length} pages</span>
                {selectedCount > 0 && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-sm text-primary font-medium">{selectedCount} selected</span>
                  </>
                )}
              </div>
              <button
                onClick={resetFile}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
              >
                Change File
              </button>
            </div>

            {/* Progress Bar */}
            {busy && (
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              {/* Selection */}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={selectAll} className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-muted text-foreground rounded-lg transition-colors">
                  Select All
                </button>
                <button onClick={selectNone} className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-muted text-foreground rounded-lg transition-colors">
                  Select None
                </button>
                <button onClick={invertSelection} className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-muted text-foreground rounded-lg transition-colors">
                  Invert
                </button>
              </div>

              {/* Rotation Actions */}
              {selectedCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground mr-2">Rotate:</span>
                  <button
                    onClick={rotate90CCW}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Rotate -90°"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={rotate90CW}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={rotate180}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Rotate 180°"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Pages Grid */}
            <div className="bg-secondary/30 rounded-2xl border border-border p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                <AnimatePresence>
                  {pages.map((page, i) => (
                    <motion.div
                      key={page.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onMouseDown={(e) => handleMouseDown(i, e)}
                      onMouseEnter={() => handleMouseEnter(i)}
                      className={`
                        aspect-[3/4] relative rounded-xl border-2 transition-all cursor-pointer group
                        ${page.selected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/40'
                        }
                      `}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        {page.selected ? (
                          <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-md bg-card/80" />
                        )}
                      </div>

                      {/* Page Number */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className="text-xs font-bold px-1.5 py-0.5 bg-black/60 text-white rounded">
                          {i + 1}
                        </span>
                      </div>

                      {/* Rotation Badge */}
                      {page.rotation !== 0 && (
                        <div className="absolute top-8 right-2 z-10">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary text-white rounded">
                            {page.rotation}°
                          </span>
                        </div>
                      )}

                      {/* Thumbnail */}
                      <div
                        className="absolute inset-2 flex items-center justify-center"
                        style={{ transform: `rotate(${page.rotation}deg)`, transition: 'transform 0.3s' }}
                      >
                        <div className="w-full h-full bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden shadow-sm">
                          {page.thumb ? (
                            <img src={page.thumb} alt={`Page ${i + 1}`} className="w-full h-full object-contain" draggable={false} />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="page-actions absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); rotatePage(i, 90); }}
                          className="p-1.5 bg-card/90 rounded-lg shadow-sm hover:bg-secondary text-muted-foreground hover:text-foreground"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilenameInput
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  disabled={busy}
                  placeholder="rotated"
                  label="Output Filename"
                />

                <div className="flex items-end">
                  <button
                    onClick={resetFile}
                    disabled={busy}
                    className="w-full px-5 py-2.5 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl border border-border transition-colors disabled:opacity-50"
                  >
                    Choose Different File
                  </button>
                </div>
              </div>

              <button
                onClick={savePdf}
                disabled={busy || pages.length === 0}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving... {progress}%
                  </>
                ) : (
                  <>
                    <RotateCw className="w-5 h-5" />
                    Save Rotated PDF ({pages.length} pages)
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}