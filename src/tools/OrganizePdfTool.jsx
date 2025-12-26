import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, degrees } from 'pdf-lib'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import FilenameInput from '../components/FilenameInput'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, RotateCcw, RotateCw, Trash2, Save, X, AlertCircle } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

export default function OrganizePdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [pages, setPages] = useState([]) // { originalIndex, rotation, thumb, deleted }
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [downloadUrl, setDownloadUrl] = useState(null)
    const [outputFileName, setOutputFileName] = useState('')

    // Drag and Drop state
    const [draggedIndex, setDraggedIndex] = useState(null)

    async function handleFiles(files) {
        const f = files[0]
        if (!f) return
        if (!f.type.includes('pdf')) { setErrorMsg(t('common.error_pdf_only', 'Please select a PDF file.')); return }

        setBusy(true)
        setErrorMsg('')
        setSuccessMsg('')
        setFile(f)
        setOutputFileName(getDefaultFilename(f, '_organized'))
        setPages([])

        try {
            const data = await f.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data }).promise
            const loadedPages = []

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const viewport = page.getViewport({ scale: 0.3 }) // Low res thumb
                const canvas = document.createElement('canvas')
                canvas.width = viewport.width
                canvas.height = viewport.height
                const ctx = canvas.getContext('2d')
                await page.render({ canvasContext: ctx, viewport }).promise

                loadedPages.push({
                    id: `page-${i}-${Date.now()}`,
                    originalIndex: i - 1,
                    thumb: canvas.toDataURL('image/jpeg', 0.8),
                    rotation: 0,
                    deleted: false
                })
            }
            setPages(loadedPages)
        } catch (err) {
            console.error(err)
            setErrorMsg(t('common.error_load', 'Failed to load PDF'))
            setFile(null)
        } finally {
            setBusy(false)
        }
    }

    function rotatePage(index, direction) {
        setPages(prev => {
            const copy = [...prev]
            const current = copy[index].rotation
            // direction: 1 = CW (90), -1 = CCW (-90)
            copy[index] = { ...copy[index], rotation: (current + (direction * 90)) % 360 }
            return copy
        })
    }

    function deletePage(index) {
        setPages(prev => {
            const copy = [...prev]
            copy.splice(index, 1) // Actually remove from array for organizing
            return copy
        })
    }

    function onDragStart(e, index) {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        // Transparent drag image or just generic
    }

    function onDragOver(e, index) {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        // Reorder locally for visual feedback
        const newPages = [...pages]
        const item = newPages.splice(draggedIndex, 1)[0]
        newPages.splice(index, 0, item)
        setPages(newPages)
        setDraggedIndex(index)
    }

    function onDragEnd() {
        setDraggedIndex(null)
    }

    async function savePdf() {
        if (!file || pages.length === 0) return
        setBusy(true)
        setErrorMsg('')
        setSuccessMsg('')

        try {
            const bytes = await file.arrayBuffer()
            const srcPdf = await PDFDocument.load(bytes)
            const outPdf = await PDFDocument.create()

            // The pages array reflects the current visual order
            // We need to copy pages based on originalIndex, then apply rotation
            const pageIndices = pages.map(p => p.originalIndex)
            const copiedPages = await outPdf.copyPages(srcPdf, pageIndices)

            copiedPages.forEach((p, i) => {
                const rotationToAdd = pages[i].rotation
                const existingRotation = p.getRotation().angle
                p.setRotation(degrees(existingRotation + rotationToAdd))
                outPdf.addPage(p)
            })

            const outBytes = await outPdf.save()
            const blob = new Blob([outBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_organized')
            a.click()
            // URL.revokeObjectURL(url) // Kept for ResultPage
            setDownloadUrl(url)
            setSuccessMsg(t('common.success_download', 'PDF saved successfully!'))
            triggerConfetti()
        } catch (err) {
            console.error(err)
            setErrorMsg(t('common.error_process', 'Failed to save PDF'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Organize PDF" description={t('tool.organize_desc', 'Sort, rotate, and delete PDF pages')}>
            <div className="max-w-7xl mx-auto">
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5" /> {errorMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {successMsg ? (
                    <ResultPage
                        title="PDF Organized Successfully!"
                        description="Your pages have been reordered and saved."
                        downloadUrl={downloadUrl}
                        downloadFilename={getOutputFilename(outputFileName, 'organized')}
                        onReset={() => {
                            setFile(null);
                            setPages([]);
                            setSuccessMsg('');
                            setDownloadUrl(null);
                        }}
                    />
                ) : !file ? (
                    <FileDropZone
                        onFiles={handleFiles}
                        accept="application/pdf"
                        hint="Upload PDF to organize"
                        disabled={busy}
                    />
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 justify-between items-center sticky top-20 z-10 glass-effect backdrop-blur-md bg-white/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{file.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{pages.length} pages remaining</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setPages([]) || setFile(null)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors text-sm font-semibold" disabled={busy}>Cancel</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-24">
                            {pages.map((p, i) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={p.id}
                                    draggable={!busy}
                                    onDragStart={(e) => onDragStart(e, i)}
                                    onDragOver={(e) => onDragOver(e, i)}
                                    onDragEnd={onDragEnd}
                                    className={`group bg-white p-2 rounded-xl border-2 transition-all cursor-move hover:shadow-lg ${draggedIndex === i ? 'border-blue-500 opacity-50 scale-95' : 'border-slate-200 hover:border-blue-400'}`}
                                >
                                    <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative rounded-lg border border-slate-100 mb-2">
                                        <img
                                            src={p.thumb}
                                            className="w-full h-full object-contain transition-transform duration-300"
                                            style={{ transform: `rotate(${p.rotation}deg)` }}
                                            alt={`Page ${p.originalIndex + 1}`}
                                        />

                                        {/* Hover Controls */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <span className="text-white text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full">Page {p.originalIndex + 1}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    title="Rotate Left"
                                                    onClick={() => rotatePage(i, -1)}
                                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-blue-600 transition-all flex items-center justify-center"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Rotate Right"
                                                    onClick={() => rotatePage(i, 1)}
                                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-blue-600 transition-all flex items-center justify-center"
                                                >
                                                    <RotateCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button
                                                title="Delete Page"
                                                onClick={() => deletePage(i)}
                                                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 shadow-md hover:scale-105 transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-center text-xs font-bold text-slate-400">{i + 1}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="fixed bottom-0 left-0 w-full p-4 pointer-events-none flex justify-center z-20">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xl pointer-events-auto flex flex-col md:flex-row gap-4 items-center max-w-2xl w-full">
                                <div className="w-full">
                                    <FilenameInput value={outputFileName} onChange={(e) => setOutputFileName(e.target.value)} placeholder="organized" />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <ActionButtons
                                        primaryText="Save PDF"
                                        onPrimary={savePdf}
                                        loading={busy}
                                        secondaryText="Reset"
                                        onSecondary={() => handleFiles([file])}
                                        icon={Save}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </ToolLayout>
    )
}
