import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, RefreshCcw, FileText, Scissors, Layers, TrendingDown, Eye, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useFileHistory } from '@/hooks/useFileHistory'
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
  downloadUrl,
  downloadFilename,
  onReset,
  sourceFile,
  toolId,
  resultBlob,
  stats = []
}) {
  const { addToHistory } = useFileHistory()
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [pageCount, setPageCount] = useState(0)
  const [resultSize, setResultSize] = useState(null)

  // Add to history on mount
  useEffect(() => {
    if (sourceFile && toolId) {
      addToHistory({
        name: sourceFile.name,
        size: sourceFile.size,
        type: sourceFile.type,
        tool: toolId,
        status: 'completed'
      })
    }
  }, [])

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

        if (!blob.type.includes('pdf') && !downloadFilename?.toLowerCase()?.endsWith('.pdf')) {
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
      } catch (err) {
        console.warn('Could not generate preview:', err)
      } finally {
        setLoadingPreview(false)
      }
    }

    generatePreview()
  }, [downloadUrl])

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const sizeSaved = sourceFile && resultSize ? sourceFile.size - resultSize : null
  const savingsPercent = sizeSaved && sourceFile.size > 0 ? ((sizeSaved / sourceFile.size) * 100).toFixed(1) : null

  // Suggested tools
  const suggestions = [
    { label: "Compress", icon: TrendingDown, href: "/compress", color: "text-green-600", bg: "bg-green-50" },
    { label: "Merge", icon: Layers, href: "/merge", color: "text-red-600", bg: "bg-red-50" },
    { label: "Split", icon: Scissors, href: "/split", color: "text-blue-600", bg: "bg-blue-50" },
  ]

  return (
    <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-200 dark:border-green-800"
      >
        <CheckCircle className="w-8 h-8" />
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>

      {/* Custom Stats (if provided) */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary rounded-xl border border-border p-4 max-w-sm mx-auto mb-6"
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
          className="bg-secondary rounded-xl border border-border p-4 max-w-sm mx-auto mb-6"
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
          className="bg-card rounded-2xl border border-border shadow-lg p-6 max-w-md mx-auto mb-8"
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
                <span className="text-sm">Preview not available</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        {downloadUrl && (
          <a href={downloadUrl} download={downloadFilename} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download File
            </button>
          </a>
        )}
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
      <div className="bg-secondary/50 rounded-2xl p-8 border border-border max-w-3xl mx-auto">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          Continue with other tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map((tool) => (
            <Link href={tool.href} key={tool.label}>
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group cursor-pointer">
                <div className={`p-2 rounded-lg ${tool.bg} ${tool.color}`}>
                  <tool.icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {tool.label} PDF
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}