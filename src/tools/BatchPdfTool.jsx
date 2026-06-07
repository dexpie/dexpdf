import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOutput, Archive, Files, FileText, Download, Trash2, X, CheckCircle, AlertTriangle, Zap } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

/**
 * BatchPdfTool - Normalize, merge, or extract pages from multiple PDFs
 */
export default function BatchPdfTool() {
  const { t } = useTranslation()
  const [files, setFiles] = useState([])
  const [operation, setOperation] = useState('compress') // normalize, merge, extract
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrls, setDownloadUrls] = useState([])
  const [outputFileName, setOutputFileName] = useState('')

  const operations = [
    { id: 'compress', label: 'Normalize', icon: Archive, desc: 'Rebuild PDF structure' },
    { id: 'merge', label: 'Merge', icon: Files, desc: 'Combine all PDFs' },
    { id: 'extract', label: 'Extract Pages', icon: FileText, desc: 'Get first page of each' },
  ]

  async function handleFileChange(newFiles) {
    setErrorMsg('')
    const validFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'))
    setFiles(prev => [...prev, ...validFiles])
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function processBatch() {
    if (files.length === 0) {
      setErrorMsg('Please add at least one PDF file.')
      return
    }

    setBusy(true)
    setProgress(0)
    setErrorMsg('')
    setDownloadUrls([])

    const results = []

    try {
      if (operation === 'merge') {
        // Merge all PDFs
        setProgress(10)
        const mergedPdf = await PDFDocument.create()

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await PDFDocument.load(arrayBuffer)
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
          pages.forEach(page => mergedPdf.addPage(page))
          setProgress(10 + (i / files.length) * 70)
        }

        setProgress(90)
        const mergedBytes = await mergedPdf.save()
        const blob = new Blob([mergedBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        results.push({ name: 'merged.pdf', url })
        setProgress(100)
      }
      else if (operation === 'compress') {
        // Compress each PDF
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)

          // Normalize the PDF structure and enable object streams.
          const compressedBytes = await pdfDoc.save({ useObjectStreams: true })
          const blob = new Blob([compressedBytes], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)

          const originalSize = file.size
          const newSize = compressedBytes.length
          const savedPercent = Math.round((1 - newSize / originalSize) * 100)

          results.push({
            name: file.name.replace('.pdf', '_compressed.pdf'),
            url,
            saved: savedPercent > 0 ? `${savedPercent}% smaller` : 'No change'
          })

          setProgress(((i + 1) / files.length) * 100)
        }
      }
      else if (operation === 'extract') {
        // Extract first page from each PDF
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          const newPdf = await PDFDocument.create()

          if (pdfDoc.getPageCount() > 0) {
            const [firstPage] = await newPdf.copyPages(pdfDoc, [0])
            newPdf.addPage(firstPage)

            const extractedBytes = await newPdf.save()
            const blob = new Blob([extractedBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)

            results.push({
              name: file.name.replace('.pdf', '_page1.pdf'),
              url
            })
          }

          setProgress(((i + 1) / files.length) * 100)
        }
      }

      setDownloadUrls(results)
      setSuccessMsg(`Processed ${results.length} file(s) successfully!`)

    } catch (e) {
      console.error('Error processing batch:', e)
      setErrorMsg('Error processing files. Please try again.')
    }

    setBusy(false)
  }

  function handleReset() {
    setFiles([])
    setDownloadUrls([])
    setErrorMsg('')
    setSuccessMsg('')
    setProgress(0)
  }

  if (downloadUrls.length > 0) {
    return (
      <ResultPage
        title="Batch Processing Complete!"
        message={successMsg}
        downloadUrl={downloadUrls[0].url}
        outputFilename={downloadUrls[0].name}
        onReset={handleReset}
        multipleDownloads={downloadUrls}
      />
    )
  }

  return (
    <ToolLayout title="Batch PDF" description="Normalize, merge, or extract the first page from multiple PDFs">
      <div className="max-w-4xl mx-auto">
        {/* Operation Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {operations.map(op => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id)}
              className={`p-4 rounded-xl border transition-all ${
                operation === op.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-foreground hover:bg-secondary'
              }`}
            >
              <op.icon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">{op.label}</div>
              <div className={`text-xs ${operation === op.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {op.desc}
              </div>
            </button>
          ))}
        </div>

        {/* File Upload */}
        {!files.length && (
          <FileDropZone
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            icon={<FolderOutput className="w-12 h-12 text-primary" />}
            title="Upload Multiple PDFs"
            subtitle={`Select ${operation === 'merge' ? '2 or more' : 'multiple'} PDF files`}
          />
        )}

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{files.length} File(s) Added</h3>
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate max-w-xs">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add More Files */}
            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <Zap className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add more files</span>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(Array.from(e.target.files))}
                />
              </label>
            </div>

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

            {/* Action */}
            <button
              onClick={processBatch}
              disabled={busy || files.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  {operation === 'merge' ? 'Merge All PDFs' : `Process ${files.length} File(s)`}
                </>
              )}
            </button>

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
                <p className="text-sm text-muted-foreground mt-1 text-center">{Math.round(progress)}%</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
