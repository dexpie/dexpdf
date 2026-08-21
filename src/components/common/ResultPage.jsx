import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, RefreshCcw, FileText, TrendingDown, Eye, CheckCircle, ArrowRight, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { useFileHistory } from '@/hooks/useFileHistory'
import { TOOLS } from '@/config/tools'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '@/utils/pdfWorker'

configurePdfWorker()

/**
 * ResultPage - Success state component for tool pages
 * Displays download option, preview, stats, and suggestions
 */
export default function ResultPage({
  title = "Files Processed Successfully!",
  description = "Your document is ready to download.",
  message,
  downloadUrl,
  downloadFilename,
  outputFilename,
  onReset,
  sourceFile,
  toolId,
  resultBlob,
  stats = [],
  multipleDownloads = []
}) {
  const resolvedDescription = message || description
  const resolvedFilename = downloadFilename || outputFilename || 'download'
  const { addToHistory } = useFileHistory()
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [pageCount, setPageCount] = useState(0)
  const [resultSize, setResultSize] = useState(null)
  const [previewNote, setPreviewNote] = useState('Preview not available')
  const recordedHistoryKey = useRef(null)
  const downloadUrlsRef = useRef({ primary: null, extras: [] })

  // Add to history on mount
  useEffect(() => {
    if (sourceFile && toolId) {
      if (downloadUrl && resultSize == null) return
      const historyKey = `${toolId}:${sourceFile.name}:${sourceFile.size}:${resolvedFilename}:${resultSize || 0}`
      if (recordedHistoryKey.current === historyKey) return
      recordedHistoryKey.current = historyKey
      addToHistory({
        name: sourceFile.name,
        size: sourceFile.size,
        type: sourceFile.type,
        outputName: resolvedFilename,
        outputSize: resultSize || null,
        tool: toolId,
        status: 'completed'
      })
    }
  }, [addToHistory, downloadUrl, resolvedFilename, resultSize, sourceFile, toolId])

  // Get result size
  useEffect(() => {
    if (!downloadUrl) return

    const getSize = async () => {
      try {
        const response = await fetch(downloadUrl)
        const blob = await response.blob()
        setResultSize(blob.size)
      } catch (e) {
        // Ignore
      }
    }

    if (resultBlob) {
      setResultSize(resultBlob.size)
    } else {
      getSize()
    }
  }, [downloadUrl, resultBlob])

  // Generate PDF preview
  useEffect(() => {
    if (!downloadUrl) return

    const generatePreview = async () => {
      try {
        setLoadingPreview(true)
        const response = await fetch(downloadUrl)
        const blob = await response.blob()

        if (!blob.type.includes('pdf') && !resolvedFilename.toLowerCase().endsWith('.pdf')) {
          setPreviewNote('Preview available after download')
          setLoadingPreview(false)
          return
        }

        const arrayBuffer = await blob.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        setPageCount(pdf.numPages)

        const page = await pdf.getPage(1)
        const scale = 1.2
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')

        await page.render({ canvasContext: ctx, viewport }).promise
        setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8))
        await pdf.destroy()
      } catch (err) {
        setPreviewNote('Preview could not be generated')
        console.warn('Could not generate preview:', err)
      } finally {
        setLoadingPreview(false)
      }
    }

    generatePreview()
  }, [downloadUrl, resolvedFilename])

  useEffect(() => {
    downloadUrlsRef.current = {
      primary: downloadUrl,
      extras: multipleDownloads.map(item => item?.url).filter(Boolean),
    }
  }, [downloadUrl, multipleDownloads])

  useEffect(() => () => {
    const { primary, extras } = downloadUrlsRef.current
    const urls = new Set([primary, ...extras].filter(url => url?.startsWith('blob:')))
    urls.forEach(url => URL.revokeObjectURL(url))
  }, [])

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const sizeSaved = sourceFile && resultSize ? sourceFile.size - resultSize : null
  const savingsPercent = sizeSaved && sourceFile.size > 0 ? ((sizeSaved / sourceFile.size) * 100).toFixed(1) : null
  const downloadLabel = resolvedFilename && resolvedFilename !== 'download' ? `Download ${resolvedFilename}` : 'Download File'

  const nextToolIds = {
    merge: ['compress', 'pagenums', 'protect'],
    split: ['merge', 'compress', 'pdf2text'],
    compress: ['protect', 'signature', 'pdf2word'],
    edit: ['flatten', 'compress', 'protect'],
    redact: ['scrub', 'flatten', 'protect'],
    scrub: ['protect', 'signature', 'compress'],
    protect: ['signature', 'compress', 'unlock'],
    unlock: ['edit', 'compress', 'protect'],
    pdf2word: ['word2pdf', 'compress', 'protect'],
    word2pdf: ['compress', 'merge', 'protect'],
    pdf2imgs: ['imgs2pdf', 'compress', 'ocr'],
    imgs2pdf: ['compress', 'ocr', 'protect'],
    ocr: ['pdf2word', 'pdf2text', 'translate-pdf'],
    signature: ['flatten', 'protect', 'compress'],
    'qr-code': ['qr-reader', 'imgs2pdf', 'invoice-generator'],
    'qr-reader': ['qr-code', 'pdf2text', 'scan-pdf'],
    'pdf2excel': ['excel2pdf', 'compress', 'protect'],
    'invoice-generator': ['signature', 'compress', 'protect'],
  }
  const suggestionIds = nextToolIds[toolId] || ['compress', 'merge', 'protect']
  const suggestions = suggestionIds
    .map(id => TOOLS.find(tool => tool.id === id))
    .filter(Boolean)

  return (
    <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30"
      >
        <CheckCircle className="w-8 h-8" />
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{resolvedDescription}</p>

      {/* Custom Stats (if provided) */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-4 max-w-sm mx-auto mb-6"
        >
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`text-lg font-bold ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Size Comparison (legacy) */}
      {sourceFile && resultSize && stats.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-4 max-w-sm mx-auto mb-6"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Original</span>
            <span className="font-bold text-foreground">{formatBytes(sourceFile.size)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Result</span>
            <span className="font-bold text-foreground">{formatBytes(resultSize)}</span>
          </div>
          {sizeSaved !== null && sizeSaved > 0 && (
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Saved
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatBytes(sizeSaved)} ({savingsPercent}%)
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* PDF Preview */}
      {downloadUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-6 max-w-md mx-auto mb-8"
        >
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Eye className="w-5 h-5" />
            <span className="font-semibold">Preview</span>
            {pageCount > 0 && (
              <span className="ml-auto text-sm bg-secondary px-2 py-1 rounded-full">
                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>

          <div className="bg-secondary rounded-xl border border-border p-4 flex items-center justify-center min-h-[200px]">
            {loadingPreview ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-muted-foreground/30 border-primary rounded-full animate-spin" />
                <span className="text-sm">Generating preview...</span>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="PDF Preview"
                className="max-h-[250px] rounded-lg shadow-md border border-border"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="w-12 h-12" />
                <span className="text-sm">{previewNote}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={resolvedFilename}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 sm:w-auto"
          >
            <Download className="h-5 w-5" />
            <span className="max-w-[15rem] truncate">{downloadLabel}</span>
          </a>
        )}
        {multipleDownloads.slice(1).map((item, index) => (
          <a
            key={`${item.name}-${index}`}
            href={item.url}
            download={item.name}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-border px-6 font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto"
          >
            <Download className="h-5 w-5" />
            {item.name}
          </a>
        ))}
        {onReset && (
          <button
            onClick={onReset}
            className="w-full sm:w-auto h-14 px-8 border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Process Another
          </button>
        )}
      </div>

      {/* Suggestions */}
      <div className="rounded-lg border border-[rgba(243,239,228,0.12)] p-6 sm:p-8 max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row sm:text-left">
          <div>
            <h3 className="boundary-label mb-2">Recommended next steps</h3>
            <p className="text-sm text-muted-foreground">Keep the workflow moving with tools that usually come next.</p>
          </div>
          <Link href="/my-documents" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary">
            <Clock3 className="h-4 w-4" />
            View history
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map((tool) => (
            <Link href={tool.href || `/${tool.id}`} key={tool.id}>
              <div className="paper-card group flex h-full items-center gap-3 p-4 text-left transition-all hover:-translate-y-0.5">
                <div className="rounded-lg bg-[#1B2027]/5 p-2 text-[#1B2027]/70">
                  <tool.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1B2027] transition-colors group-hover:text-[#1B2027]/70">{tool.title}</p>
                  <p className="mt-0.5 truncate font-serif text-xs text-[#1B2027]/60">{tool.description}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[#1B2027]/40 transition group-hover:translate-x-0.5 group-hover:text-[#1B2027]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
