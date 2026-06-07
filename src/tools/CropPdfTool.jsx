'use client'
import React, { useState, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import FilenameInput from '../components/FilenameInput'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion } from 'framer-motion'
import {
  Scissors, RefreshCw, X, ChevronLeft, ChevronRight,
  FileText, CheckCircle, AlertTriangle, Crop
} from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * CropPdfTool - Visual crop editor for PDF pages
 * Features: Visual crop area selection, page navigation, progress tracking
 */
export default function CropPdfTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [pageIndex, setPageIndex] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 })
  const [thumbnail, setThumbnail] = useState(null)

  const imgRef = useRef(null)

  /**
   * Handle file selection
   */
  async function handleFileChange(files) {
    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large (max 50MB).')
      return
    }

    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_cropped'))
    setPageIndex(1)
    setErrorMsg('')
    setSuccessMsg('')
    setDownloadUrl(null)

    // Generate thumbnail for file info
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

    await renderPage(f, 1)
  }

  /**
   * Render PDF page to canvas for cropping
   */
  async function renderPage(inputFile, pageNum) {
    setBusy(true)
    try {
      const arrayBuffer = await inputFile.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument(arrayBuffer).promise
      setNumPages(pdf.numPages)

      const page = await pdf.getPage(pageNum)

      // Get original dimensions (72 DPI points)
      const originalViewport = page.getViewport({ scale: 1.0 })
      setPdfDimensions({ width: originalViewport.width, height: originalViewport.height })

      // Render at high resolution for crop quality
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise

      setImgSrc(canvas.toDataURL('image/jpeg'))
      setCrop(undefined)
      setCompletedCrop(undefined)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to render PDF: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  /**
   * Navigate to previous page
   */
  const goToPrevPage = useCallback(() => {
    if (pageIndex > 1) {
      setPageIndex(p => p - 1)
      renderPage(file, pageIndex - 1)
    }
  }, [pageIndex, file])

  /**
   * Navigate to next page
   */
  const goToNextPage = useCallback(() => {
    if (pageIndex < numPages) {
      setPageIndex(p => p + 1)
      renderPage(file, pageIndex + 1)
    }
  }, [pageIndex, numPages, file])

  /**
   * Handle image load - calculate display scale
   */
  const handleImageLoad = (e) => {
    // Image loaded - crop handles pixels relative to displayed image
  }

  /**
   * Apply crop to PDF
   */
  async function applyCrop() {
    if (!file || !completedCrop) return

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    setProgress(0)

    try {
      setProgress(20)
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      setProgress(40)
      const page = pdfDoc.getPages()[pageIndex - 1]
      const { width: pageWidth, height: pageHeight } = page.getSize()

      setProgress(60)
      // Calculate crop coordinates
      // ReactCrop uses pixels relative to displayed image
      // Map to PDF point coordinates

      let cropX, cropY, cropW, cropH

      if (completedCrop.unit === '%') {
        // Percent-based crop
        cropX = (completedCrop.x / 100) * pageWidth
        cropY = (completedCrop.y / 100) * pageHeight
        cropW = (completedCrop.width / 100) * pageWidth
        cropH = (completedCrop.height / 100) * pageHeight
      } else {
        // Pixel-based crop (relative to displayed image)
        if (!imgRef.current) return
        const image = imgRef.current
        const scaleX = pageWidth / image.width
        const scaleY = pageHeight / image.height
        cropX = completedCrop.x * scaleX
        cropY = completedCrop.y * scaleY
        cropW = completedCrop.width * scaleX
        cropH = completedCrop.height * scaleY
      }

      // Validate crop area
      if (cropW <= 0 || cropH <= 0) {
        throw new Error('Invalid crop selection')
      }

      setProgress(70)
      // PDF coordinates: Origin is Bottom-Left
      // ReactCrop/Canvas: Origin is Top-Left
      // Need to invert Y coordinate
      const pdfCropY = pageHeight - (cropY + cropH)

      // Apply crop boxes
      page.setCropBox(cropX, pdfCropY, cropW, cropH)
      page.setMediaBox(cropX, pdfCropY, cropW, cropH)

      setProgress(90)
      const pdfBytes = await pdfDoc.save()

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)

      // Trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'pdf')
      a.click()

      setDownloadUrl(url)
      setSuccessMsg('PDF cropped successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to crop PDF: ' + err.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  /**
   * Reset and choose different file
   */
  const resetFile = () => {
    setFile(null)
    setThumbnail(null)
    setPageIndex(1)
    setNumPages(0)
    setImgSrc('')
    setCrop(undefined)
    setCompletedCrop(undefined)
    setOutputFileName('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  /**
   * Format file size
   */
  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <ToolLayout
      title="Crop PDF"
      description="Trim margins and select content area visually"
    >
      <div className="max-w-5xl mx-auto">
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
            title="PDF Cropped Successfully!"
            description="Your cropped PDF is ready to download."
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: file?.name || 'cropped.pdf',
              size: file?.size || 0,
              type: 'application/pdf'
            }}
            toolId="crop"
            onReset={resetFile}
          />
        )}

        {/* Upload Zone */}
        {!file && (
          <FileDropZone
            onFiles={handleFileChange}
            accept="application/pdf"
            disabled={busy}
            hint="Upload PDF to crop pages"
          />
        )}

        {/* Editor */}
        {file && !successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* File Info Header */}
            <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-12 h-14 bg-secondary rounded-lg border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {thumbnail ? (
                    <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-foreground truncate max-w-[200px]">{file.name}</div>
                  <div className="text-sm text-muted-foreground">{formatBytes(file.size)}</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFile}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Page Navigation */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{pageIndex}</span> of {numPages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageIndex <= 1 || busy}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={pageIndex >= numPages || busy}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
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

            {/* Crop Canvas Area */}
            <div className="bg-secondary/30 rounded-2xl border border-border p-6 min-h-[500px] flex justify-center items-start overflow-auto">
              {imgSrc && (
                <div className="shadow-xl rounded-lg overflow-hidden">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img
                      ref={imgRef}
                      src={imgSrc}
                      onLoad={handleImageLoad}
                      alt="PDF Page"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '70vh' }}
                    />
                  </ReactCrop>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilenameInput
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  disabled={busy}
                  placeholder="cropped"
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
                onClick={applyCrop}
                disabled={!completedCrop?.width || busy}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing... {progress}%
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5" />
                    Crop & Download
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