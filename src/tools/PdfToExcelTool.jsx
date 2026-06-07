import React, { useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import Papa from 'papaparse'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { Table, FileSpreadsheet, AlertCircle, CheckCircle, Info, FileOutput, Download, Eye, Settings, Zap, Layout, Columns } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * Advanced table extraction from PDF
 * Uses column alignment detection and cell merging
 */
async function extractTableFromPage(page) {
  const textContent = await page.getTextContent()
  const items = textContent.items

  if (items.length === 0) return []

  // Collect all unique X positions (column boundaries)
  const xPositions = new Set()
  const Y_TOLERANCE = 4 // Tolerance for row detection
  const X_TOLERANCE = 3 // Tolerance for column detection

  items.forEach(item => {
    if (item.str.trim()) {
      xPositions.add(item.transform[4]) // Left edge
      xPositions.add(item.transform[4] + (item.width || 0)) // Right edge
    }
  })

  // Cluster X positions into columns
  const sortedX = Array.from(xPositions).sort((a, b) => a - b)
  const columns = []

  if (sortedX.length > 0) {
    let currentColumn = [sortedX[0]]
    for (let i = 1; i < sortedX.length; i++) {
      if (sortedX[i] - currentColumn[currentColumn.length - 1] < X_TOLERANCE * 3) {
        currentColumn.push(sortedX[i])
      } else {
        // Average position for column
        columns.push(currentColumn.reduce((a, b) => a + b, 0) / currentColumn.length)
        currentColumn = [sortedX[i]]
      }
    }
    if (currentColumn.length > 0) {
      columns.push(currentColumn.reduce((a, b) => a + b, 0) / currentColumn.length)
    }
  }

  // Group items by row (Y coordinate)
  const rows = {}

  items.forEach(item => {
    if (!item.str.trim()) return

    const y = item.transform[5]
    const x = item.transform[4]
    const str = item.str.trim()

    // Find matching row
    let matchedY = null
    for (const rowY of Object.keys(rows)) {
      if (Math.abs(rowY - y) < Y_TOLERANCE) {
        matchedY = rowY
        break
      }
    }

    if (matchedY === null) {
      matchedY = y
      rows[matchedY] = []
    }

    // Assign to nearest column
    let nearestCol = 0
    let minDist = Infinity

    for (let c = 0; c < columns.length; c++) {
      const dist = Math.abs(columns[c] - x)
      if (dist < minDist) {
        minDist = dist
        nearestCol = c
      }
    }

    rows[matchedY].push({ col: nearestCol, text: str })
  })

  // Build CSV rows
  const sortedY = Object.keys(rows).sort((a, b) => parseFloat(b) - parseFloat(a))

  return sortedY.map(y => {
    const rowItems = rows[y]
    const row = new Array(Math.max(columns.length, 5)).fill('')

    rowItems.forEach(item => {
      if (item.col < row.length) {
        row[item.col] = item.text
      }
    })

    return row
  }).filter(row => row.some(cell => cell.trim()))
}

/**
 * PdfToExcelTool - Extract tables and data from PDF
 * Exports heuristically detected table rows as CSV with preview.
 */
export default function PdfToExcelTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [extractedData, setExtractedData] = useState([])
  const [outputFormat, setOutputFormat] = useState('csv') // 'csv' or 'xlsx'
  const [pageCount, setPageCount] = useState(0)
  const [thumbnail, setThumbnail] = useState(null)

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')
    setExtractedData([])

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
    setOutputFileName(getDefaultFilename(f, '', '.csv'))

    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      setPageCount(pdf.numPages)

      // Generate thumbnail
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      setThumbnail(canvas.toDataURL('image/jpeg', 0.7))

      // Preview first page
      const previewRows = await extractTableFromPage(page)
      setExtractedData(previewRows.slice(0, 10)) // First 10 rows for preview

    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
    }
  }

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  async function convert() {
    if (!file) {
      setErrorMsg('Please select a PDF file first.')
      return
    }

    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgress(0)

    try {
      setProgress(10)
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const numPages = pdf.numPages
      let allRows = []

      // Extract from all pages
      const BATCH_SIZE = 5
      for (let start = 1; start <= numPages; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, numPages)
        const pagePromises = []

        for (let i = start; i <= end; i++) {
          pagePromises.push(
            pdf.getPage(i).then(async page => {
              const pageRows = await extractTableFromPage(page)
              return { pageNum: i, pageRows }
            })
          )
        }

        const pagesData = await Promise.all(pagePromises)
        pagesData.sort((a, b) => a.pageNum - b.pageNum)

        for (const { pageRows } of pagesData) {
          allRows = [...allRows, ...pageRows, []] // Empty row between pages
        }

        setProgress(10 + Math.round((end / numPages) * 70))
      }

      setProgress(85)

      // Generate CSV
      const csv = Papa.unparse(allRows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

      setProgress(95)

      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      setProgress(100)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'csv')
      a.click()

      triggerConfetti()
      setSuccessMsg('Data extracted successfully!')
    } catch (err) {
      console.error(err)
      setErrorMsg('Conversion failed: ' + err.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      let allRows = []
      const numPages = pdf.numPages

      const BATCH_SIZE = 5
      for (let start = 1; start <= numPages; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, numPages)
        const pagePromises = []

        for (let i = start; i <= end; i++) {
          pagePromises.push(
            pdf.getPage(i).then(async page => {
              const pageRows = await extractTableFromPage(page)
              return { pageNum: i, pageRows }
            })
          )
        }

        const pagesData = await Promise.all(pagePromises)
        pagesData.sort((a, b) => a.pageNum - b.pageNum)

        for (const { pageRows } of pagesData) {
          allRows = [...allRows, ...pageRows, []]
        }

        onProgress(10 + (end / numPages) * 80)
      }

      const csv = Papa.unparse(allRows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      onProgress(100)
      return blob
    } catch (error) {
      throw error
    }
  }

  const resetFile = () => {
    setFile(null)
    setThumbnail(null)
    setPageCount(0)
    setOutputFileName('')
    setExtractedData([])
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  return (
    <ToolLayout
      title="PDF Table to CSV"
      description="Heuristically extract aligned table text from PDF into CSV"
    >
      {/* Mode Switcher */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setBatchMode(false)}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            !batchMode
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-muted-foreground hover:bg-muted'
          }`}
        >
          📄 Single File
        </button>
        <button
          onClick={() => setBatchMode(true)}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            batchMode
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-muted-foreground hover:bg-muted'
          }`}
        >
          🔄 Batch Convert
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          toolName="PDF Table to CSV"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".csv"
          maxFiles={50}
        />
      ) : (
        <div className="flex flex-col gap-6">

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {errorMsg}
            </motion.div>
          )}

          {/* Success State */}
          {successMsg && downloadUrl && (
            <ResultPage
              title="Data Extracted Successfully!"
              description="Your table data is ready to open in Excel."
              downloadUrl={downloadUrl}
              downloadFilename={getOutputFilename(outputFileName, 'csv')}
              sourceFile={{
                name: file?.name || 'data.csv',
                size: file?.size || 0,
                type: 'text/csv'
              }}
              toolId="pdf2excel"
              onReset={resetFile}
            />
          )}

          {/* Upload Zone */}
          {!file && (
            <FileDropZone
              onFiles={handleFileChange}
              accept="application/pdf"
              disabled={busy}
              hint="Upload PDF with tables to extract data"
            />
          )}

          {/* Editor */}
          {file && !successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* File Info */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  {/* Thumbnail */}
                  <div className="w-20 h-28 bg-secondary rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{file.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
                    </div>
                  </div>
                  <button
                    onClick={resetFile}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* Progress Bar */}
                {busy && (
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Info */}
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-foreground font-medium mb-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span>How it works</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our algorithm detects table columns and rows automatically. For best results,
                    use PDFs with clearly formatted tables. Scanned PDFs will need OCR first.
                  </p>
                </div>
              </div>

              {/* Data Preview */}
              {extractedData.length > 0 && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Eye className="w-4 h-4 text-primary" />
                      <span>Preview (first 10 rows)</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {extractedData[0]?.length || 0} columns detected
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          {extractedData[0]?.map((_, i) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-foreground border-b border-border">
                              Column {String.fromCharCode(65 + i)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {extractedData.map((row, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-muted-foreground truncate max-w-[200px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Footer */}
              <div className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FilenameInput
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    disabled={busy}
                    placeholder="data"
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
                  onClick={convert}
                  disabled={busy}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Extracting... {progress}%
                    </>
                  ) : (
                    <>
                      <FileOutput className="w-5 h-5" />
                      Extract to CSV
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
