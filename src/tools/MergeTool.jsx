import React, { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { FileText, X, ArrowUp, ArrowDown, File, GripVertical, Layers, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'
import JSZip from 'jszip'

configurePdfWorker()

/**
 * MergeTool - Merge multiple PDF files into one
 * Features: Visual thumbnails, drag-drop reorder, progress tracking
 */
export default function MergeTool() {
  const { t } = useTranslation()
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('merged')
  const [draggedIndex, setDraggedIndex] = useState(null)

  /**
   * Handle new file uploads with thumbnail generation
   */
  async function handleFiles(newFiles) {
    setErrorMsg('')
    const list = Array.from(newFiles)
    const loaded = []

    for (const f of list) {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('All files must be PDF format.')
        continue
      }
      if (f.size > 50 * 1024 * 1024) {
        setErrorMsg('File is too large (max 50MB per file).')
        continue
      }

      // Get page count and thumbnail
      const info = await getPdfInfo(f)
      loaded.push({
        file: f,
        thumb: info.thumbnail,
        pageCount: info.pageCount
      })
    }

    setFiles(prev => prev.concat(loaded))
  }

  /**
   * Extract PDF info: page count and first page thumbnail
   */
  async function getPdfInfo(file) {
    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const pageCount = pdf.numPages

      // Generate thumbnail from first page
      let thumbnail = null
      try {
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 0.5 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        thumbnail = canvas.toDataURL('image/jpeg', 0.7)
      } catch (e) {
        console.warn('Could not generate thumbnail', e)
      }

      return { pageCount, thumbnail }
    } catch (err) {
      return { pageCount: 0, thumbnail: null }
    }
  }

  /**
   * Merge all PDFs into one
   */
  async function merge() {
    if (!files.length) return
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgress(0)

    try {
      const merged = await PDFDocument.create()
      let skippedCount = 0
      const total = files.length

      for (let i = 0; i < files.length; i++) {
        const entry = files[i]
        try {
          setProgress(Math.round(((i + 0.5) / total) * 50)) // First 50% for loading

          const f = entry.file
          const bytes = await f.arrayBuffer()
          const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })

          setProgress(Math.round(((i + 1) / total) * 50)) // 50% after load

          const copied = await merged.copyPages(pdf, pdf.getPageIndices())
          copied.forEach(p => merged.addPage(p))
        } catch (fileErr) {
          console.warn(`Skipped file "${entry.file.name}":`, fileErr)
          skippedCount++
        }
      }

      if (merged.getPageCount() === 0) {
        throw new Error('No pages could be extracted from the uploaded files.')
      }

      setProgress(75) // 75% when saving

      const out = await merged.save({ useObjectStreams: true })
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'pdf')
      a.click()

      setDownloadUrl(url)
      triggerConfetti()

      const skippedNote = skippedCount > 0 ? ` (${skippedCount} file(s) skipped due to errors)` : ''
      setSuccessMsg('PDF Merged Successfully!' + skippedNote)
    } catch (err) {
      console.error(err)
      setErrorMsg('Merge failed: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  function remove(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  function moveUp(i) {
    if (i <= 0) return
    setFiles(prev => {
      const copy = [...prev]
      const temp = copy[i - 1]
      copy[i - 1] = copy[i]
      copy[i] = temp
      return copy
    })
  }

  function moveDown(i) {
    if (i >= files.length - 1) return
    setFiles(prev => {
      const copy = [...prev]
      const temp = copy[i + 1]
      copy[i + 1] = copy[i]
      copy[i] = temp
      return copy
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    setFiles(prev => {
      const copy = [...prev]
      const draggedItem = copy[draggedIndex]
      copy.splice(draggedIndex, 1)
      copy.splice(index, 0, draggedItem)
      return copy
    })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Calculate totals
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0)
  const totalPages = files.reduce((acc, f) => acc + (f.pageCount || 0), 0)

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDFs into a single file"
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
            title={t('tool.merge_success', 'PDFs Merged Successfully!')}
            description={t('tool.merge_download_desc', 'Your merged PDF is ready. Download it below or continue with other tools.')}
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: `${files.length} files merged`,
              size: totalSize,
              type: 'application/pdf'
            }}
            toolId="merge"
            onReset={() => {
              setFiles([])
              setSuccessMsg('')
              setDownloadUrl(null)
            }}
          />
        ) : (
          <>
            {/* Upload Zone */}
            <FileDropZone
              onFiles={handleFiles}
              accept="application/pdf"
              multiple
              disabled={busy}
              hint="Upload multiple PDFs to merge (max 50MB each)"
            />

            {/* Files List */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                {/* Header with stats */}
                <div className="p-4 bg-secondary/50 border-b border-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">
                        {files.length} {files.length === 1 ? 'File' : 'Files'}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-sm text-muted-foreground">
                      {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                    </span>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-sm text-muted-foreground">
                      {(totalSize / 1024 / 1024).toFixed(1)} MB
                    </span>
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

                {/* File Items */}
                <div className="p-4 space-y-2">
                  <AnimatePresence>
                    {files.map((entry, i) => (
                      <motion.div
                        key={entry.file.name + i}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        draggable={!busy}
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragEnd={handleDragEnd}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border transition-all
                          ${draggedIndex === i
                            ? 'border-primary bg-primary/5 opacity-50'
                            : 'border-border bg-background hover:border-primary/30'
                          }
                        `}
                      >
                        {/* Drag Handle */}
                        <div className={`cursor-grab ${busy ? 'opacity-50' : ''}`}>
                          <GripVertical className="w-5 h-5 text-muted-foreground" />
                        </div>

                        {/* Thumbnail */}
                        <div className="w-12 h-16 bg-secondary rounded-lg border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {entry.thumb ? (
                            <img src={entry.thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {entry.file.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{(entry.file.size / 1024).toFixed(1)} KB</span>
                            {entry.pageCount > 0 && (
                              <>
                                <span>·</span>
                                <span>{entry.pageCount} {entry.pageCount === 1 ? 'page' : 'pages'}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Page Count Badge */}
                        {entry.pageCount > 0 && (
                          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-secondary rounded-lg text-xs text-muted-foreground">
                            <File className="w-3 h-3" />
                            {entry.pageCount}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveUp(i)}
                            disabled={i === 0 || busy}
                            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveDown(i)}
                            disabled={i === files.length - 1 || busy}
                            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(i)}
                            disabled={busy}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border bg-secondary/30 flex flex-col sm:flex-row items-end gap-4">
                  <div className="w-full sm:w-auto flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Output Filename
                    </label>
                    <FilenameInput
                      value={outputFileName}
                      onChange={e => setOutputFileName(e.target.value)}
                      placeholder="merged"
                    />
                  </div>
                  <div className="w-full sm:w-auto flex gap-3">
                    <button
                      onClick={() => setFiles([])}
                      disabled={busy}
                      className="px-5 py-2.5 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors disabled:opacity-50"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={merge}
                      disabled={busy || files.length < 2}
                      className="flex-1 sm:flex-none px-8 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {busy ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Merging... {progress}%
                        </>
                      ) : (
                        <>
                          <Layers className="w-4 h-4" />
                          Merge PDF
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