import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowRight, RefreshCcw, FileText, Scissors, Layers, Clock, Eye, CheckCircle, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useFileHistory } from '@/hooks/useFileHistory'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '@/utils/pdfWorker'

configurePdfWorker()

export default function ResultPage({
    title = "Files Processed Successfully!",
    description = "Your document is ready to download.",
    downloadUrl,
    downloadFilename,
    onReset,
    secondaryActions = [],
    // History props
    sourceFile,
    toolId,
    // New: file size comparison
    resultBlob,
}) {
    const { addToHistory } = useFileHistory()
    const [previewUrl, setPreviewUrl] = useState(null)
    const [loadingPreview, setLoadingPreview] = useState(true)
    const [pageCount, setPageCount] = useState(0)
    const [resultSize, setResultSize] = useState(null)

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run once on mount

    // Calculate result file size from downloadUrl
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

    // Generate PDF preview thumbnail
    useEffect(() => {
        if (!downloadUrl) return

        const generatePreview = async () => {
            try {
                setLoadingPreview(true)
                const response = await fetch(downloadUrl)
                const blob = await response.blob()

                // Only try PDF preview for PDF files
                if (!blob.type.includes('pdf') && !downloadFilename?.toLowerCase()?.endsWith('.pdf')) {
                    setLoadingPreview(false)
                    return
                }

                const arrayBuffer = await blob.arrayBuffer()
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
                setPageCount(pdf.numPages)

                const page = await pdf.getPage(1)
                const scale = 1.5
                const viewport = page.getViewport({ scale })

                const canvas = document.createElement('canvas')
                canvas.width = viewport.width
                canvas.height = viewport.height
                const ctx = canvas.getContext('2d')

                await page.render({ canvasContext: ctx, viewport }).promise
                setPreviewUrl(canvas.toDataURL('image/png'))
                canvas.width = 0
                canvas.height = 0
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

    // Suggested next tools
    const suggestions = [
        { label: "Compress PDF", icon: TrendingDown, href: "/compress", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/30" },
        { label: "Merge PDF", icon: Layers, href: "/merge", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30" },
        { label: "Split PDF", icon: Scissors, href: "/split", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
    ]

    const sizeSaved = sourceFile && resultSize ? sourceFile.size - resultSize : null
    const savingsPercent = sizeSaved && sourceFile.size > 0 ? ((sizeSaved / sourceFile.size) * 100).toFixed(1) : null

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

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{description}</p>

            {/* File Size Comparison */}
            {sourceFile && resultSize && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 p-4 max-w-sm mx-auto mb-6"
                >
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500 dark:text-slate-400">Original</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatBytes(sourceFile.size)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500 dark:text-slate-400">Result</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatBytes(resultSize)}</span>
                    </div>
                    {sizeSaved !== null && sizeSaved > 0 && (
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-600">
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

            {/* PDF Preview Thumbnail */}
            {downloadUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 max-w-md mx-auto mb-8"
                >
                    <div className="flex items-center gap-2 mb-4 text-slate-600 dark:text-slate-400">
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold">Preview</span>
                        {pageCount > 0 && (
                            <span className="ml-auto text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                            </span>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-center min-h-[200px]">
                        {loadingPreview ? (
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                                <span className="text-sm">Generating preview...</span>
                            </div>
                        ) : previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="PDF Preview"
                                className="max-h-[250px] rounded-lg shadow-md border border-slate-300 dark:border-slate-600"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <FileText className="w-12 h-12" />
                                <span className="text-sm">Preview not available</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                {downloadUrl && (
                    <a href={downloadUrl} download={downloadFilename} className="w-full sm:w-auto">
                        <Button size="xl" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                            <Download className="w-6 h-6 mr-2" />
                            Download File
                        </Button>
                    </a>
                )}
                {onReset && (
                    <Button variant="outline" size="xl" onClick={onReset} className="w-full sm:w-auto h-14 px-8 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        Process Another
                    </Button>
                )}
            </div>

            {/* Cross-Sell: Continue with other tools */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 max-w-3xl mx-auto">
                <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6">Continue with other tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {suggestions.map((tool) => (
                        <Link href={tool.href} key={tool.label}>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group cursor-pointer">
                                <div className={`p-2 rounded-lg ${tool.bg} ${tool.color}`}>
                                    <tool.icon className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
