import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { Layers, Image as ImageIcon, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

configurePdfWorker()

export default function FlattenPdfTool() {
    const { t } = useTranslation()
    const [batchMode, setBatchMode] = useState(false)
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('')
    const [quality, setQuality] = useState('high') // high, medium

    async function handleFileChange(files) {
        setErrorMsg(''); setSuccessMsg('');
        const f = files[0]
        if (!f) return
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            setErrorMsg('File harus PDF.');
            return;
        }
        setFile(f)
        setOutputFileName(getDefaultFilename(f, '_flattened'))
    }

    async function convert() {
        if (!file) { setErrorMsg('Pilih file PDF terlebih dahulu.'); return; }
        setErrorMsg(''); setSuccessMsg('');
        setBusy(true)

        try {
            const data = await file.arrayBuffer()
            const srcPdf = await pdfjsLib.getDocument({ data }).promise
            const numPages = srcPdf.numPages

            // Create new PDF
            const outPdf = await PDFDocument.create()

            for (let i = 1; i <= numPages; i++) {
                const page = await srcPdf.getPage(i)

                // Scale: High = 2.0 (good for print), Medium = 1.5 (good for screen)
                const scale = quality === 'high' ? 2.0 : 1.5
                const viewport = page.getViewport({ scale })

                const canvas = document.createElement('canvas')
                canvas.width = viewport.width
                canvas.height = viewport.height
                const ctx = canvas.getContext('2d')

                await page.render({ canvasContext: ctx, viewport }).promise
                const imgData = canvas.toDataURL('image/jpeg', quality === 'high' ? 0.8 : 0.7)

                const img = await outPdf.embedJpg(imgData)
                const newPage = outPdf.addPage([viewport.width / scale, viewport.height / scale]) // Default 72DPI size
                newPage.drawImage(img, {
                    x: 0,
                    y: 0,
                    width: newPage.getWidth(),
                    height: newPage.getHeight()
                })
            }

            const outBytes = await outPdf.save()
            const blob = new Blob([outBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, ''), '_flattened.pdf')
            a.click()
            URL.revokeObjectURL(url)

            setSuccessMsg('Berhasil! PDF berhasil di-flatten (dijadikan gambar).')
            triggerConfetti()
        } catch (err) {
            console.error(err)
            setErrorMsg('Gagal: ' + (err.message || err))
        } finally {
            setBusy(false)
        }
    }

    const processBatchFile = async (file, index, onProgress) => {
        try {
            onProgress(10)
            const data = await file.arrayBuffer()
            const srcPdf = await pdfjsLib.getDocument({ data }).promise
            const outPdf = await PDFDocument.create()
            const numPages = srcPdf.numPages
            onProgress(20)

            for (let i = 1; i <= numPages; i++) {
                const page = await srcPdf.getPage(i)
                const scale = 1.5
                const viewport = page.getViewport({ scale })
                const canvas = document.createElement('canvas')
                canvas.width = viewport.width
                canvas.height = viewport.height
                const ctx = canvas.getContext('2d')
                await page.render({ canvasContext: ctx, viewport }).promise
                const imgData = canvas.toDataURL('image/jpeg', 0.7)

                const img = await outPdf.embedJpg(imgData)
                const newPage = outPdf.addPage([viewport.width / scale, viewport.height / scale])
                newPage.drawImage(img, {
                    x: 0, y: 0, width: newPage.getWidth(), height: newPage.getHeight()
                })

                onProgress(20 + (i / numPages) * 70)
            }

            const outBytes = await outPdf.save()
            onProgress(100)
            return new Blob([outBytes], { type: 'application/pdf' })
        } catch (error) {
            throw error
        }
    }

    return (
        <ToolLayout title="Flatten PDF" description="Merge all layers and convert pages to non-editable images">

            {/* Mode Switcher */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    onClick={() => setBatchMode(false)}
                >
                    📄 Single File
                </button>
                <button
                    className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    onClick={() => setBatchMode(true)}
                >
                    🔄 Batch Process
                </button>
            </div>

            {batchMode ? (
                <UniversalBatchProcessor
                    toolName="Flatten PDF"
                    processFile={processBatchFile}
                    acceptedTypes=".pdf"
                    outputExtension="_flattened.pdf" // Suffix logic handled by processor usually
                    outputFilenameSuffix="_flattened"
                    maxFiles={50}
                />
            ) : (
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                                <AlertCircle className="w-5 h-5" /> {errorMsg}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
                                <CheckCircle className="w-5 h-5" /> {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!file ? (
                        <FileDropZone
                            onFiles={handleFileChange}
                            accept="application/pdf"
                            disabled={busy}
                            hint="Upload PDF to flatten"
                        />
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-6">

                                <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-2">
                                    <Layers className="w-10 h-10" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">{file.name}</h3>
                                    <p className="text-slate-500">Ready to flatten (rasterize pages)</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl w-full max-w-md border border-slate-100 text-left">
                                    <h4 className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" /> Security Mode
                                    </h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setQuality('high')}
                                            className={`flex-1 p-2 rounded-lg text-sm transition-all border ${quality === 'high' ? 'bg-white border-blue-500 text-blue-600 shadow-sm font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            High Definition
                                        </button>
                                        <button
                                            onClick={() => setQuality('medium')}
                                            className={`flex-1 p-2 rounded-lg text-sm transition-all border ${quality === 'medium' ? 'bg-white border-blue-500 text-blue-600 shadow-sm font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            Standard Web
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {quality === 'high' ? 'Best for printing and reading. Larger file size.' : 'Best for sharing online. Smaller file size.'}
                                    </p>
                                </div>

                                <div className="w-full max-w-md">
                                    <label className="block text-sm font-medium text-slate-600 mb-2 text-left">Output Filename</label>
                                    <FilenameInput
                                        value={outputFileName}
                                        onChange={e => setOutputFileName(e.target.value)}
                                        placeholder="flattened"
                                    />
                                </div>

                                <div className="flex gap-3 w-full max-w-md">
                                    <button
                                        onClick={() => setFile(null)}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                        disabled={busy}
                                    >
                                        Cancel
                                    </button>
                                    <ActionButtons
                                        primaryText="Flatten PDF"
                                        onPrimary={convert}
                                        loading={busy}
                                        className="flex-1"
                                        icon={Layers}
                                    />
                                </div>

                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </ToolLayout>
    )
}
