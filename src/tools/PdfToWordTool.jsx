import React, { useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { FileText, Laptop, Cloud, AlertCircle, CheckCircle, Settings, Lock, FileOutput, Zap, Shield, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * Advanced PDF to Word conversion with multiple engine options
 */
async function advancedPdfToWord(file, onProgress) {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise.catch(e => {
    if (e.name === 'PasswordException') throw new Error('PDF is password protected. Unlock it first.')
    throw new Error('Corrupted or invalid PDF file.')
  })

  const paragraphs = []
  const numPages = pdf.numPages

  // Process pages concurrently in batches
  const BATCH_SIZE = 10
  for (let start = 1; start <= numPages; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, numPages)
    const pagePromises = []

    for (let i = start; i <= end; i++) {
      pagePromises.push(
        pdf.getPage(i).then(async page => {
          const txtContent = await page.getTextContent()
          return { pageNum: i, txtContent }
        }).catch(e => {
          console.warn(`Skipping page ${i}`, e)
          return { pageNum: i, txtContent: { items: [] } }
        })
      )
    }

    const pagesData = await Promise.all(pagePromises)
    pagesData.sort((a, b) => a.pageNum - b.pageNum)

    for (const { pageNum, txtContent } of pagesData) {
      const lineMap = new Map()
      let allFontHeights = []

      txtContent.items.forEach(item => {
        if (!item.str || !item.str.trim()) return
        const fontHeight = Math.abs(item.transform[3]) || item.height || 12
        allFontHeights.push(fontHeight)

        const tolerance = Math.max(2, fontHeight * 0.2)
        const y = Math.round(item.transform[5] / tolerance) * tolerance

        if (!lineMap.has(y)) lineMap.set(y, [])
        lineMap.get(y).push({
          text: item.str,
          x: item.transform[4],
          width: item.width || 0,
          fontHeight,
          fontName: item.fontName || ''
        })
      })

      const avgFontHeight = allFontHeights.length > 0
        ? allFontHeights.reduce((a, b) => a + b, 0) / allFontHeights.length
        : 12

      const sortedYPositions = Array.from(lineMap.keys()).sort((a, b) => b - a)
      let currentLineItems = []
      let prevY = null
      let prevFontHeight = 12

      for (const y of sortedYPositions) {
        const items = lineMap.get(y).sort((a, b) => a.x - b.x)
        const lineFontHeight = items[0]?.fontHeight || 12

        if (prevY !== null) {
          const gap = prevY - y
          if (gap > prevFontHeight * 1.3) {
            if (currentLineItems.length > 0) {
              paragraphs.push(formatParagraph(currentLineItems, avgFontHeight))
              currentLineItems = []
            }
          }
        }

        let lineText = ''
        let lastX = null
        for (const item of items) {
          if (lastX !== null && item.x > lastX + (item.fontHeight * 0.25)) {
            lineText += ' '
          }
          lineText += item.text
          lastX = item.x + item.width
        }

        if (lineText.trim()) {
          currentLineItems.push({
            text: lineText.trim(),
            fontHeight: lineFontHeight,
            fontName: items[0]?.fontName || ''
          })
          prevFontHeight = lineFontHeight
        }
        prevY = y
      }

      if (currentLineItems.length > 0) {
        paragraphs.push(formatParagraph(currentLineItems, avgFontHeight))
      }

      if (pageNum < numPages && paragraphs.length > 0) {
        paragraphs.push(new Paragraph({ text: '', pageBreakBefore: true }))
      }

      if (onProgress) {
        onProgress(Math.min(90, (end / numPages) * 100))
      }
    }
  }

  if (paragraphs.length === 0) {
    throw new Error('No text could be extracted. The PDF might be scanned/image-only.')
  }

  if (onProgress) onProgress(95)

  const doc = new Document({ sections: [{ children: paragraphs }] })
  const blob = await Packer.toBlob(doc)
  if (onProgress) onProgress(100)

  return blob
}

function formatParagraph(lineItems, avgFontHeight) {
  const combinedText = lineItems.map(l => l.text).join(' ').trim()
  const maxFontInPara = Math.max(...lineItems.map(l => l.fontHeight))
  const isBold = lineItems.some(l =>
    l.fontName.toLowerCase().includes('bold') ||
    l.fontName.toLowerCase().includes('heavy')
  )

  const docxFontSize = Math.max(16, Math.round(maxFontInPara * 2))

  if (maxFontInPara > avgFontHeight * 1.4) {
    return new Paragraph({
      children: [new TextRun({ text: combinedText, bold: true, size: docxFontSize })],
      heading: HeadingLevel.HEADING_1
    })
  } else if (maxFontInPara > avgFontHeight * 1.2) {
    return new Paragraph({
      children: [new TextRun({ text: combinedText, bold: true, size: docxFontSize })],
      heading: HeadingLevel.HEADING_2
    })
  } else if (isBold) {
    return new Paragraph({
      children: [new TextRun({ text: combinedText, bold: true, size: docxFontSize })]
    })
  } else {
    return new Paragraph({
      children: [new TextRun({ text: combinedText, size: docxFontSize })]
    })
  }
}

/**
 * PdfToWordTool - Convert PDF to editable Word documents
 * Supports both local extraction and cloud-based layout preservation
 */
export default function PdfToWordTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [conversionMode, setConversionMode] = useState('text') // 'text' or 'layout'
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [pageCount, setPageCount] = useState(0)

  // Load saved API key
  useEffect(() => {
    const saved = localStorage.getItem('convertApiSecret') || ''
    setApiKey(saved)
  }, [])

  // Save API key when changed
  useEffect(() => {
    if (apiKey) localStorage.setItem('convertApiSecret', apiKey)
  }, [apiKey])

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
    setOutputFileName(getDefaultFilename(f))

    // Generate thumbnail and get page count
    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      setPageCount(pdf.numPages)

      // Generate first page thumbnail
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.5 })
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

    // CLOUD MODE - Layout Preserving
    if (conversionMode === 'layout') {
      try {
        if (!apiKey) {
          setProgress(10)
          // Simulate connection
          await new Promise(r => setTimeout(r, 1000))
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('format', 'docx')
        if (apiKey) formData.append('apiKey', apiKey)

        setProgress(30)
        const res = await fetch('/api/convert', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          const err = await res.json()
          if (res.status === 401) {
            setShowKeyInput(true)
            throw new Error('Server limit reached. Please use your own Free Key.')
          }
          throw new Error(err.error || res.statusText)
        }

        setProgress(80)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)

        setProgress(100)
        setDownloadUrl(url)

        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, 'docx')
        a.click()

        triggerConfetti()
        setSuccessMsg('PDF converted successfully!')
      } catch (error) {
        console.error(error)
        setErrorMsg(error.message)
        if (error.message.includes('Limit') || error.message.includes('Key')) {
          setShowKeyInput(true)
        }
      } finally {
        setBusy(false)
        setProgress(0)
      }
      return
    }

    // LOCAL MODE - Text Extraction
    try {
      setProgress(10)
      const blob = await advancedPdfToWord(file, (percent) => {
        setProgress(Math.round(percent))
      })

      setProgress(95)
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setDownloadUrl(url)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'docx')
      a.click()

      triggerConfetti()
      setSuccessMsg('PDF converted successfully!')
    } catch (err) {
      console.error(err)
      const msg = err.message || 'Unknown error'
      if (msg.includes('scanned')) {
        setErrorMsg('This appears to be a scanned PDF (image). Use OCR Tool instead.')
      } else if (msg.includes('password')) {
        setErrorMsg('🔒 ' + msg)
      } else {
        setErrorMsg('Conversion failed: ' + msg)
      }
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const processBatchFile = async (file, index, onProgress) => {
    try {
      return await advancedPdfToWord(file, onProgress)
    } catch (error) {
      console.error(`Error converting ${file.name}:`, error)
      throw error
    }
  }

  const resetFile = () => {
    setFile(null)
    setThumbnail(null)
    setPageCount(0)
    setOutputFileName('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  // Conversion mode options
  const modes = [
    {
      id: 'text',
      icon: Laptop,
      title: 'Local Extraction',
      description: 'Extract text paragraphs. Fast & private, runs entirely in your browser.',
      badges: [
        { label: '⚡ Fast', class: 'bg-green-100 text-green-700' },
        { label: '🔒 Private', class: 'bg-secondary text-muted-foreground' }
      ]
    },
    {
      id: 'layout',
      icon: Cloud,
      title: 'Pro Layout (Cloud)',
      description: 'Preserves exact layout, images, and tables using ConvertAPI.',
      badges: [
        { label: '🎯 Best Quality', class: 'bg-purple-100 text-purple-700' },
        { label: '☁️ Cloud', class: 'bg-blue-100 text-blue-700' }
      ]
    }
  ]

  return (
    <ToolLayout
      title="PDF to Word"
      description="Convert PDF documents to editable Microsoft Word files"
    >
      {/* Mode Toggle */}
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
          toolName="PDF to Word"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".docx"
          maxFiles={100}
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
              <div>
                <span className="font-semibold">{errorMsg}</span>
                {errorMsg.includes('scanned') && (
                  <a href="/ocr" className="block mt-2 text-sm font-medium text-primary hover:underline">
                    → Go to OCR Tool
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {successMsg && downloadUrl && (
            <ResultPage
              title="PDF Converted Successfully!"
              description="Your Word document is ready to download."
              downloadUrl={downloadUrl}
              downloadFilename={getOutputFilename(outputFileName, 'docx')}
              sourceFile={{
                name: file?.name || 'document.docx',
                size: file?.size || 0,
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              }}
              toolId="pdf2word"
              onReset={resetFile}
            />
          )}

          {/* Upload Zone */}
          {!file && (
            <FileDropZone
              onFiles={handleFileChange}
              accept="application/pdf"
              disabled={busy}
              hint="Upload PDF to convert to Word (DOCX)"
            />
          )}

          {/* File Editor */}
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
                      <FileText className="w-8 h-8 text-muted-foreground" />
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

                {/* Conversion Mode Selection */}
                <div className="bg-secondary/50 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4 text-foreground font-semibold">
                    <Settings className="w-5 h-5" />
                    Conversion Engine
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modes.map((mode) => (
                      <div
                        key={mode.id}
                        onClick={() => !busy && setConversionMode(mode.id)}
                        className={`
                          cursor-pointer p-4 rounded-xl border-2 transition-all relative
                          ${conversionMode === mode.id
                            ? 'border-primary bg-card shadow-md'
                            : 'border-border bg-card/50 opacity-70 hover:opacity-100 hover:border-primary/30'
                          }
                          ${busy ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <mode.icon className={`w-5 h-5 ${conversionMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-semibold text-foreground">{mode.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          {mode.badges.map((badge, i) => (
                            <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.class}`}>
                              {badge.label}
                            </span>
                          ))}
                        </div>
                        {conversionMode === mode.id && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* API Key Input (for cloud mode) */}
                  {conversionMode === 'layout' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <label className="block text-sm font-medium text-foreground mb-1">
                        ConvertAPI Secret Key
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Using your own key gives you higher limits. Get free 1500 seconds at convertapi.com
                      </p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Paste your ConvertAPI Secret here..."
                            className="w-full pl-10 pr-3 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          />
                        </div>
                        <a
                          href="https://www.convertapi.com/a"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 whitespace-nowrap"
                        >
                          Get Free Key
                        </a>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FilenameInput
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    disabled={busy}
                    placeholder="output"
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
                      Converting... {progress}%
                    </>
                  ) : (
                    <>
                      <FileOutput className="w-5 h-5" />
                      Convert to DOCX
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