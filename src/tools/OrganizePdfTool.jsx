import React, { useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, degrees } from 'pdf-lib'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import FilenameInput from '../components/FilenameInput'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, RotateCcw, RotateCw, Trash2, Save, X, AlertCircle, GripVertical, Copy, ArrowUp, ArrowDown, CheckSquare, Square, FileText, CheckCircle } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * OrganizePdfTool - Visual page editor for PDF
 * Features: Drag-drop reorder, rotate, delete, duplicate pages
 */
export default function OrganizePdfTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [selectedPages, setSelectedPages] = useState(new Set())
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)

  async function handleFiles(files) {
    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_organized'))
    setPages([])
    setSelectedPages(new Set())

    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const loadedPages = []

      // Generate thumbnails with progress
      for (let i = 1; i <= pdf.numPages; i++) {
        const progressPercent = Math.round((i / pdf.numPages) * 80)
        setProgress(progressPercent)

        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.35 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise

        loadedPages.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1,
          thumb: canvas.toDataURL('image/jpeg', 0.7),
          rotation: 0,
          pageNumber: i
        })
      }
      setPages(loadedPages)
      setProgress(100)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF file.')
      setFile(null)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  // Selection handlers
  const handlePageClick = useCallback((index, e) => {
    if (e.shiftKey) {
      // Range selection
      const lastSelected = Array.from(selectedPages).pop() ?? 0
      const start = Math.min(lastSelected, index)
      const end = Math.max(lastSelected, index)
      const newSelection = new Set(selectedPages)
      for (let i = start; i <= end; i++) {
        newSelection.add(i)
      }
      setSelectedPages(newSelection)
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const newSelection = new Set(selectedPages)
      if (newSelection.has(index)) {
        newSelection.delete(index)
      } else {
        newSelection.add(index)
      }
      setSelectedPages(newSelection)
    } else {
      // Single select
      setSelectedPages(new Set([index]))
    }
  }, [selectedPages])

  const handleMouseDown = (index, e) => {
    if (e.target.closest('.page-actions')) return
    setIsSelecting(true)
    handlePageClick(index, e)
  }

  const handleMouseEnter = (index) => {
    if (isSelecting) {
      const newSelection = new Set(selectedPages)
      newSelection.add(index)
      setSelectedPages(newSelection)
    }
  }

  const handleMouseUp = () => {
    setIsSelecting(false)
  }

  // Select all/none
  const selectAll = () => new Set(pages.map((_, i) => i))
  const deselectAll = () => new Set()
  const invertSelection = () => {
    const all = selectAll()
    const newSelection = new Set()
    all.forEach(i => {
      if (!selectedPages.has(i)) newSelection.add(i)
    })
    return newSelection
  }

  // Rotate pages
  const rotateSelected = (degrees) => {
    setPages(prev => prev.map((p, i) => {
      if (selectedPages.has(i)) {
        return { ...p, rotation: (p.rotation + degrees + 360) % 360 }
      }
      return p
    }))
  }

  const rotatePage = (index, degrees) => {
    setPages(prev => {
      const copy = [...prev]
      copy[index] = {
        ...copy[index],
        rotation: (copy[index].rotation + degrees + 360) % 360
      }
      return copy
    })
  }

  // Delete selected pages
  const deleteSelected = () => {
    const selectedArray = Array.from(selectedPages).sort((a, b) => b - a)
    setPages(prev => {
      const copy = [...prev]
      selectedArray.forEach(i => copy.splice(i, 1))
      return copy
    })
    setSelectedPages(new Set())
  }

  const deletePage = (index) => {
    setPages(prev => {
      const copy = [...prev]
      copy.splice(index, 1)
      return copy
    })
    // Adjust selections
    const newSelection = new Set()
    selectedPages.forEach(i => {
      if (i < index) newSelection.add(i)
      else if (i > index) newSelection.add(i - 1)
    })
    setSelectedPages(newSelection)
  }

  // Duplicate pages
  const duplicateSelected = () => {
    const selectedArray = Array.from(selectedPages).sort((a, b) => a - b)
    setPages(prev => {
      const copy = [...prev]
      let offset = 0
      selectedArray.forEach(i => {
        const pageToDuplicate = copy[i + offset]
        copy.splice(i + offset + 1, 0, {
          ...pageToDuplicate,
          id: `page-${Date.now()}-${Math.random()}`
        })
        offset++
      })
      return copy
    })
  }

  // Drag and drop reorder
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    setPages(prev => {
      const copy = [...prev]
      const item = copy.splice(draggedIndex, 1)[0]
      copy.splice(index, 0, item)
      return copy
    })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Move selected pages
  const moveSelectedUp = () => {
    const selected = Array.from(selectedPages).sort((a, b) => a - b)
    if (selected[0] === 0) return

    setPages(prev => {
      const copy = [...prev]
      selected.forEach(i => {
        if (i > 0) {
          const temp = copy[i]
          copy[i] = copy[i - 1]
          copy[i - 1] = temp
        }
      })
      return copy
    })
    // Update selection
    const newSelection = new Set(selectedPages)
    newSelection.forEach((_, i) => {
      newSelection.delete(selected[i])
      newSelection.add(selected[i] - 1)
    })
    setSelectedPages(newSelection)
  }

  const moveSelectedDown = () => {
    const selected = Array.from(selectedPages).sort((a, b) => b - a)
    if (selected[0] === pages.length - 1) return

    setPages(prev => {
      const copy = [...prev]
      selected.forEach(i => {
        if (i < pages.length - 1) {
          const temp = copy[i]
          copy[i] = copy[i + 1]
          copy[i + 1] = temp
        }
      })
      return copy
    })
  }

  // Save PDF
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

      const pageIndices = pages.map(p => p.originalIndex)
      setProgress(60)

      const copiedPages = await outPdf.copyPages(srcPdf, pageIndices)
      setProgress(80)

      copiedPages.forEach((p, i) => {
        const rotationToAdd = pages[i].rotation
        const existingRotation = p.getRotation().angle
        p.setRotation(degrees(existingRotation + rotationToAdd))
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
      triggerConfetti()
      setSuccessMsg('PDF organized successfully!')
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
    setSelectedPages(new Set())
    setOutputFileName('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  const selectedCount = selectedPages.size

  return (
    <ToolLayout
      title="Organize PDF"
      description="Sort, rotate, and delete PDF pages visually"
    >
      <div
        className="max-w-7xl mx-auto"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsSelecting(false)}
      >
        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Success State */}
        {successMsg && downloadUrl && (
          <ResultPage
            title="PDF Organized Successfully!"
            description="Your organized PDF is ready to download."
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: file?.name || 'organized.pdf',
              size: file?.size || 0,
              type: 'application/pdf'
            }}
            toolId="organize"
            onReset={resetFile}
          />
        )}

        {/* Upload Zone */}
        {!file && (
          <FileDropZone
            onFiles={handleFiles}
            accept="application/pdf"
            disabled={busy}
            hint="Upload PDF to organize pages"
          />
        )}

        {/* Page Editor */}
        {file && pages.length > 0 && !successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header Stats */}
            <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{file.name}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-sm text-muted-foreground">
                  {pages.length} pages
                </span>
                {selectedCount > 0 && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-sm text-primary font-medium">
                      {selectedCount} selected
                    </span>
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
              {/* Selection Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedPages(selectAll())}
                  className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-muted text-foreground rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPages(deselectAll())}
                  className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-muted text-foreground rounded-lg transition-colors"
                >
                  Select None
                </button>
                <button
                  onClick={() => setSelectedPages(invertSelection())}
                  className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-muted text-foreground rounded-lg transition-colors"
                >
                  Invert
                </button>
              </div>

              {/* Page Actions */}
              {selectedCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={moveSelectedUp}
                    disabled={selectedPages.has(0)}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={moveSelectedDown}
                    disabled={selectedPages.has(pages.length - 1)}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <div className="h-5 w-px bg-border" />
                  <button
                    onClick={() => rotateSelected(90)}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rotateSelected(-90)}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Rotate Counter-Clockwise"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={duplicateSelected}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Duplicate Pages"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <div className="h-5 w-px bg-border" />
                  <button
                    onClick={deleteSelected}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                    title="Delete Selected"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Pages Grid */}
            <div className="bg-secondary/30 rounded-2xl border border-border p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                  {pages.map((page, i) => (
                    <motion.div
                      key={page.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      draggable={!busy}
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      onMouseDown={(e) => handleMouseDown(i, e)}
                      onMouseEnter={() => handleMouseEnter(i)}
                      className={`
                        aspect-[3/4] relative rounded-xl border-2 transition-all cursor-pointer group
                        ${selectedPages.has(i)
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/40'
                        }
                        ${draggedIndex === i ? 'opacity-50 scale-95' : ''}
                      `}
                    >
                      {/* Page Number Badge */}
                      <div className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        selectedPages.has(i)
                          ? 'bg-primary text-white'
                          : 'bg-black/60 text-white'
                      }`}>
                        {i + 1}
                      </div>

                      {/* Selection Indicator */}
                      <div className="absolute top-2 right-2 z-10">
                        {selectedPages.has(i) ? (
                          <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-md bg-card/80" />
                        )}
                      </div>

                      {/* Drag Handle */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>

                      {/* Thumbnail */}
                      <div
                        className="absolute inset-2 flex items-center justify-center"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      >
                        <div className="w-full h-full bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden shadow-sm">
                          {page.thumb ? (
                            <img
                              src={page.thumb}
                              alt={`Page ${i + 1}`}
                              className="w-full h-full object-contain"
                              draggable={false}
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">
                              {i + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Page Actions */}
                      <div className="page-actions absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); rotatePage(i, 90); }}
                          className="p-1.5 bg-card/90 rounded-lg shadow-sm hover:bg-secondary text-muted-foreground hover:text-foreground"
                          title="Rotate"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePage(i); }}
                          className="p-1.5 bg-card/90 rounded-lg shadow-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Action Footer */}
            <div className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilenameInput
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  disabled={busy}
                  placeholder="organized"
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
                    <Save className="w-5 h-5" />
                    Save Organized PDF ({pages.length} pages)
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