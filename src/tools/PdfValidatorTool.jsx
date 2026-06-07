import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, FileCheck, FileX, FileText, Settings, RefreshCcw } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

/**
 * Runs basic readability and structure checks, then optionally normalizes a PDF.
 */
export default function PdfValidatorTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [fixMode, setFixMode] = useState(false)

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setValidationResult(null)

    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_validated'))

    try {
      const arrayBuffer = await f.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      setPdfDoc(pdfDoc)

      // Get page count and thumbnail
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
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
      console.error('Error loading PDF:', e)
      setErrorMsg('Could not load PDF. Make sure it\'s a valid PDF file.')
    }
  }

  async function validatePdf() {
    if (!pdfDoc) return

    setBusy(true)
    setProgress(0)
    setErrorMsg('')
    setValidationResult(null)

    const issues = []
    const warnings = []
    const info = []

    try {
      setProgress(10)

      // Check basic structure
      try {
        const pageCount = pdfDoc.getPageCount()
        info.push({ type: 'success', message: `PDF has ${pageCount} page(s)` })
      } catch (e) {
        issues.push({ type: 'error', message: 'Could not read page count' })
      }

      setProgress(30)

      // Check encryption
      try {
        const isEncrypted = pdfDoc.isEncrypted
        if (isEncrypted) {
          warnings.push({ type: 'warning', message: 'PDF is encrypted' })
        } else {
          info.push({ type: 'success', message: 'PDF is not encrypted' })
        }
      } catch (e) {
        warnings.push({ type: 'warning', message: 'Could not check encryption status' })
      }

      setProgress(50)

      // Check form fields
      try {
        const form = pdfDoc.getForm()
        const fields = form.getFields()
        if (fields.length > 0) {
          info.push({ type: 'info', message: `PDF has ${fields.length} form field(s)` })
        }
      } catch (e) {
        // No form fields is fine
      }

      setProgress(70)

      // Check metadata
      try {
        const title = pdfDoc.getTitle()
        const author = pdfDoc.getAuthor()
        if (title || author) {
          info.push({ type: 'info', message: 'PDF has metadata' })
        } else {
          info.push({ type: 'info', message: 'PDF has no metadata' })
        }
      } catch (e) {
        // No metadata is fine
      }

      setProgress(90)

      // Check page sizes
      try {
        const pages = pdfDoc.getPages()
        const sizes = new Set()
        pages.forEach(page => {
          const { width, height } = page.getSize()
          sizes.add(`${Math.round(width)}x${Math.round(height)}`)
        })
        if (sizes.size > 1) {
          warnings.push({ type: 'warning', message: `PDF has ${sizes.size} different page sizes` })
        }
      } catch (e) {
        // Ignore
      }

      setProgress(100)

      const isValid = issues.length === 0
      setValidationResult({
        isValid,
        issues,
        warnings,
        info,
        validCount: info.filter(i => i.type === 'success').length,
        totalChecks: info.length + warnings.length + issues.length
      })

      if (isValid) {
      setSuccessMsg('Basic checks passed. This is not a standards-compliance validation.')
        triggerConfetti()
      }

    } catch (e) {
      console.error('Error validating PDF:', e)
      setErrorMsg('Error validating PDF. The file may be corrupted.')
      setValidationResult({
        isValid: false,
        issues: [{ type: 'error', message: 'Could not validate PDF structure' }],
        warnings: [],
        info: [],
        validCount: 0,
        totalChecks: 1
      })
    }

    setBusy(false)
  }

  async function handleFixPdf() {
    if (!pdfDoc) return

    setBusy(true)
    setProgress(0)
    setErrorMsg('')

    try {
      setProgress(30)

      // Re-save the readable document to normalize its structure.
      const fixedPdfBytes = await pdfDoc.save()
      setProgress(70)

      await PDFDocument.load(fixedPdfBytes)
      setProgress(90)

      const blob = new Blob([fixedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      setProgress(100)
      setSuccessMsg('PDF structure was normalized and the result is readable.')
      triggerConfetti()

    } catch (e) {
      console.error('Error fixing PDF:', e)
      setErrorMsg('Could not fix the PDF. It may be too corrupted.')
    }

    setBusy(false)
  }

  function handleReset() {
    setFile(null)
    setValidationResult(null)
    setDownloadUrl(null)
    setErrorMsg('')
    setSuccessMsg('')
    setThumbnail(null)
    setPageCount(0)
    setPdfDoc(null)
  }

  if (downloadUrl) {
    return (
      <ResultPage
        title="PDF Normalized"
        message={successMsg}
        downloadUrl={downloadUrl}
        outputFilename={getOutputFilename(outputFileName || 'normalized', 'pdf')}
        onReset={handleReset}
        thumbnail={thumbnail}
      />
    )
  }

  return (
    <ToolLayout title="Basic PDF Check" description="Run basic structural checks and normalize readable PDFs">
      <div className="max-w-4xl mx-auto">
        {/* File Upload */}
        {!file && (
          <FileDropZone
            accept=".pdf"
            onChange={handleFileChange}
            icon={<FileCheck className="w-12 h-12 text-primary" />}
            title="Upload PDF to Check"
            subtitle="Run basic readability and structure checks"
          />
        )}

        {/* File Loaded - Show Options */}
        {file && !validationResult && !busy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">PDF Loaded</h3>
                <p className="text-sm text-muted-foreground">{file.name}</p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Remove file
              </button>
            </div>

            {/* Thumbnail */}
            {thumbnail && (
              <div className="mb-6 flex justify-center">
                <img src={thumbnail} alt="PDF Preview" className="max-h-40 rounded-lg border border-border" />
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={validatePdf}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Settings className="w-5 h-5" />
                Run Basic Checks
              </button>
              <button
                onClick={handleFixPdf}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground py-3 px-6 rounded-xl font-medium hover:bg-muted transition-colors"
              >
                <RefreshCcw className="w-5 h-5" />
                Normalize PDF
              </button>
            </div>
          </motion.div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            {/* Status Banner */}
            <div className={`rounded-xl p-4 mb-6 ${validationResult.isValid ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900'}`}>
              <div className="flex items-center gap-3">
                {validationResult.isValid ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className={`font-semibold ${validationResult.isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {validationResult.isValid ? 'Basic Checks Passed' : 'PDF has Readability Issues'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {validationResult.validCount}/{validationResult.totalChecks} checks passed
                  </p>
                </div>
              </div>
            </div>

            {/* Issues */}
            {validationResult.issues.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Issues ({validationResult.issues.length})
                </h4>
                <div className="space-y-2">
                  {validationResult.issues.map((issue, idx) => (
                    <div key={idx} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm text-red-700 dark:text-red-300">
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Warnings ({validationResult.warnings.length})
                </h4>
                <div className="space-y-2">
                  {validationResult.warnings.map((warning, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                      {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            {validationResult.info.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Info ({validationResult.info.length})
                </h4>
                <div className="space-y-2">
                  {validationResult.info.map((info, idx) => (
                    <div key={idx} className="p-3 bg-secondary rounded-lg text-sm text-foreground flex items-center gap-2">
                      {info.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <FileText className="w-4 h-4" />}
                      {info.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={validatePdf}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <RefreshCcw className="w-5 h-5" />
                Re-validate
              </button>
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground py-3 px-6 rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Try Another File
              </button>
            </div>

            {/* Progress */}
            {busy && (
              <div className="mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
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
