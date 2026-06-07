import React, { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { Scissors, RefreshCcw, Check, Square, X, RotateCw, File, FileOutput, Layers, Download, ArrowLeftRight, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'
import JSZip from 'jszip'

configurePdfWorker()

/**
 * SplitTool - Extract pages from PDF
 * Features: Visual page grid, rotation, extract to ZIP, batch operations
 */
export default function SplitTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [rotations, setRotations] = useState([])
  const [thumbnails, setThumbnails] = useState([])
  const [rangeInput, setRangeInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractMode, setExtractMode] = useState('selected') // 'selected', 'single', 'range', 'even', 'odd'
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [isDragSelecting, setIsDragSelecting] = useState(false)

  async function handleFileChange(files) {
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
    setOutputFileName(getDefaultFilename(f, '_extracted'))

    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const count = pdf.getPageCount()

      setPages(new Array(count).fill(false))
      setRotations(new Array(count).fill(0))

      // Select first page by default
      setPages(prev => {
        const newPages = [...prev]
        if (newPages.length > 0) newPages[0] = true
        return newPages
      })

      // Start thumbnail generation
      generateThumbnails(f, count)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF file.')
    }
  }

  const generateThumbnails = async (file, totalPages) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
      const thumbs = []

      // Generate thumbnails with progress
      for (let i = 1; i <= totalPages; i++) {
        try {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 0.4 })
          const canvas = document.createElement('canvas')
          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)
          const ctx = canvas.getContext('2d')
          await page.render({ canvasContext: ctx, viewport }).promise
          thumbs.push(canvas.toDataURL('image/jpeg', 0.7))
        } catch (e) {
          thumbs.push(null)
        }
      }
      setThumbnails(thumbs)
    } catch (error) {
      console.error("Thumbnail generation error:", error)
    }
  }

  // Toggle single page
  function toggle(i) {
    setPages(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  // Toggle range of pages (drag select)
  const handleMouseDown = (i) => {
    setIsDragSelecting(true)
    toggle(i)
  }

  const handleMouseEnter = (i) => {
    if (isDragSelecting) toggle(i)
  }

  const handleMouseUp = () => {
    setIsDragSelecting(false)
  }

  // Rotate single page
  function rotate(i) {
    setRotations(prev => prev.map((r, idx) => idx === i ? (r + 90) % 360 : r))
  }

  // Range input handler
  function handleRangeSelect() {
    if (!rangeInput || !pages.length) return

    const newPages = new Array(pages.length).fill(false)
    const parts = rangeInput.split(',')

    parts.forEach(part => {
      const p = part.trim()
      if (p.includes('-')) {
        const [start, end] = p.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= pages.length) newPages[i - 1] = true
          }
        }
      } else {
        const num = Number(p)
        if (!isNaN(num) && num > 0 && num <= pages.length) {
          newPages[num - 1] = true
        }
      }
    })
    setPages(newPages)
    setRangeInput('')
  }

  // Quick selection buttons
  const selectAll = () => setPages(new Array(pages.length).fill(true))
  const deselectAll = () => setPages(new Array(pages.length).fill(false))
  const invertSelection = () => setPages(prev => prev.map(p => !p))
  const selectEven = () => setPages(prev => prev.map((_, i) => i % 2 === 0))
  const selectOdd = () => setPages(prev => prev.map((_, i) => i % 2 === 1))

  // Get selected indices
  const selectedIndices = pages.flatMap((v, i) => v ? [i] : [])

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Export selected pages as PDF
  async function exportSelected() {
    if (!file || selectedIndices.length === 0) return
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgress(0)

    try {
      setProgress(20)
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)

      setProgress(40)
      const out = await PDFDocument.create()
      const copied = await out.copyPages(src, selectedIndices)

      setProgress(60)
      copied.forEach((p, idx) => {
        out.addPage(p)
        const originalIndex = selectedIndices[idx]
        const deg = rotations[originalIndex] || 0
        if (deg) p.setRotation(deg)
      })

      setProgress(80)
      const outBytes = await out.save()

      setProgress(95)
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName || 'extracted', 'pdf')
      a.click()

      setDownloadUrl(url)
      triggerConfetti()
      setSuccessMsg('Pages Extracted Successfully!')
    } catch (err) {
      console.error(err)
      setErrorMsg('Export failed: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  // Export each page as separate PDF files in ZIP
  async function exportAsZip() {
    if (!file || selectedIndices.length === 0) return
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgress(0)

    try {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const zip = new JSZip()

      setProgress(20)
      const total = selectedIndices.length

      for (let i = 0; i < total; i++) {
        const pageIndex = selectedIndices[i]
        const newPdf = await PDFDocument.create()
        const [page] = await newPdf.copyPages(src, [pageIndex])

        // Apply rotation
        const deg = rotations[pageIndex] || 0
        if (deg) page.setRotation(deg)

        newPdf.addPage(page)
        const pdfBytes = await newPdf.save()

        zip.file(`page_${pageIndex + 1}.pdf`, pdfBytes)

        setProgress(20 + Math.round((i / total) * 70))
      }

      setProgress(95)
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)

      setProgress(100)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName || 'pages', 'zip')
      a.click()

      setDownloadUrl(url)
      triggerConfetti()
      setSuccessMsg('Pages Exported as ZIP!')
    } catch (err) {
      console.error(err)
      setErrorMsg('Export failed: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  // Extract every page as individual PDF
  async function extractAllPages() {
    if (!file || !pages.length) return
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgress(0)

    try {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const zip = new JSZip()

      setProgress(20)
      const total = pages.length

      for (let i = 0; i < total; i++) {
        const newPdf = await PDFDocument.create()
        const [page] = await newPdf.copyPages(src, [i])

        const deg = rotations[i] || 0
        if (deg) page.setRotation(deg)

        newPdf.addPage(page)
        const pdfBytes = await newPdf.save()

        zip.file(`page_${i + 1}.pdf`, pdfBytes)

        setProgress(20 + Math.round((i / total) * 70))
      }

      setProgress(95)
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)

      setProgress(100)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(file.name.replace('.pdf', ''), 'zip')
      a.click()

      setDownloadUrl(url)
      triggerConfetti()
      setSuccessMsg('All Pages Extracted as ZIP!')
    } catch (err) {
      console.error(err)
      setErrorMsg('Export failed: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  const resetFile = () => {
    setFile(null)
    setPages([])
    setRotations([])
    setThumbnails([])
    setOutputFileName('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract pages from your PDF documents"
    >
      <div className="flex flex-col gap-6" onMouseUp={handleMouseUp}>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-2">
            <X className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Success State */}
        {successMsg ? (
          <ResultPage
            title="Pages Extracted Successfully!"
            description="Your extracted pages are ready to download."
            downloadUrl={downloadUrl}
            downloadFilename={outputFileName + (extractMode === 'zip' ? '.zip' : '.pdf')}
            sourceFile={{
              name: file?.name || 'extracted.pdf',
              size: file?.size || 0,
              type: 'application/pdf'
            }}
            toolId="split"
            onReset={resetFile}
          />
        ) : (
          <>
            {/* Upload Zone */}
            {!file && (
              <FileDropZone
                onFiles={handleFileChange}
                accept="application/pdf"
                disabled={busy}
                hint="Upload a PDF to extract pages"
              />
            )}

            {/* Main Editor */}
            {file && pages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {/* File Header */}
                <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap justify-between items-center gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <File className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground truncate max-w-[200px] md:max-w-none">
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{pages.length} pages</span>
                      </div>
                    </div>
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

                {/* Selection Controls */}
                <div className="bg-card rounded-2xl border border-border p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                  {/* Range Input */}
                  <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">Range:</span>
                    <input
                      type="text"
                      placeholder="e.g. 1-5, 8, 11-13"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-sm w-32 md:w-48 bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <button
                      onClick={handleRangeSelect}
                      className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Quick Selection */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <button onClick={selectAll} className="text-xs font-medium px-3 py-1.5 bg-secondary rounded-lg hover:bg-muted text-foreground transition-colors">
                      All
                    </button>
                    <button onClick={selectOdd} className="text-xs font-medium px-3 py-1.5 bg-secondary rounded-lg hover:bg-muted text-foreground transition-colors">
                      Odd
                    </button>
                    <button onClick={selectEven} className="text-xs font-medium px-3 py-1.5 bg-secondary rounded-lg hover:bg-muted text-foreground transition-colors">
                      Even
                    </button>
                    <button onClick={invertSelection} className="text-xs font-medium px-3 py-1.5 bg-secondary rounded-lg hover:bg-muted text-foreground transition-colors">
                      Invert
                    </button>
                    <button onClick={deselectAll} className="text-xs font-medium px-3 py-1.5 bg-secondary rounded-lg hover:bg-muted text-foreground transition-colors">
                      None
                    </button>
                  </div>
                </div>

                {/* Selection Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{selectedIndices.length}</span> of {pages.length} pages selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RotateCw className="w-4 h-4" />
                    <span>Click pages to select, drag to select multiple</span>
                  </div>
                </div>

                {/* Pages Grid */}
                <div
                  className="bg-secondary/30 rounded-2xl border border-border p-4 max-h-[500px] overflow-y-auto"
                  onMouseLeave={() => setIsDragSelecting(false)}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {pages.map((selected, i) => (
                      <motion.div
                        key={i}
                        layout
                        onMouseDown={() => !busy && handleMouseDown(i)}
                        onMouseEnter={() => !busy && handleMouseEnter(i)}
                        className={`
                          aspect-[3/4] relative cursor-pointer rounded-xl border-2 transition-all group overflow-hidden
                          ${selected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border bg-card hover:border-primary/40'
                          }
                          ${isDragSelecting ? 'cursor-crosshair' : ''}
                        `}
                      >
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                            selected
                              ? 'bg-primary border-primary'
                              : 'bg-card/90 border-muted-foreground/30'
                          }`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        {/* Page Number Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            selected ? 'bg-primary text-white' : 'bg-black/50 text-white'
                          }`}>
                            {i + 1}
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div
                          className="absolute inset-0 flex items-center justify-center p-2"
                          style={{ transform: `rotate(${rotations[i]}deg)`, transition: 'transform 0.3s' }}
                        >
                          <div className="w-full h-full bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden shadow-sm">
                            {thumbnails[i] ? (
                              <img
                                src={thumbnails[i]}
                                alt={`Page ${i + 1}`}
                                className="w-full h-full object-contain"
                                draggable={false}
                              />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">
                                P{i + 1}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rotate Button */}
                        <button
                          className="absolute bottom-2 right-2 p-1.5 bg-card/90 backdrop-blur rounded-lg shadow-sm hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors z-20 opacity-0 group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); rotate(i); }}
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col gap-4 sticky bottom-4 z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FilenameInput
                        value={outputFileName}
                        onChange={e => setOutputFileName(e.target.value)}
                        placeholder="extracted_pages"
                        label="Output Filename"
                      />
                    </div>

                    {/* Extract Mode Tabs */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted-foreground">Extract Mode</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExtractMode('selected')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            extractMode === 'selected'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          Selected ({selectedIndices.length})
                        </button>
                        <button
                          onClick={extractAllPages}
                          disabled={busy}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                            'bg-secondary text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          All as ZIP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={exportAsZip}
                      disabled={busy || selectedIndices.length === 0}
                      className="flex-1 sm:flex-none px-5 py-2.5 border border-border text-foreground font-medium rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FileOutput className="w-4 h-4" />
                      Export as ZIP ({selectedIndices.length} files)
                    </button>
                    <button
                      onClick={exportSelected}
                      disabled={busy || selectedIndices.length === 0}
                      className="flex-1 sm:flex-none px-8 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {busy ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Processing... {progress}%
                        </>
                      ) : (
                        <>
                          <Scissors className="w-4 h-4" />
                          Extract {selectedIndices.length} Pages
                        </>
                      )}
                    </button>
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