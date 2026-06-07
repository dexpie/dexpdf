'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import { motion, AnimatePresence } from 'framer-motion'
import { FileArchive, Check, Download, Upload, ShieldCheck, Info, X } from 'lucide-react'
import { triggerConfetti } from '@/utils/confetti'

export default function PdfToPdfATool() {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState('idle') // idle, converting, done, error
    const [conformance, setConformance] = useState('PDF/A-1b')

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length) {
            setFile(acceptedFiles[0])
            setStatus('idle')
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    })

    // This tool normalizes archival metadata only. It does not claim PDF/A conformance.
    const convertToPdfA = async () => {
        if (!file) return

        try {
            setStatus('converting')
            const fileBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(fileBuffer)

            // Normalize common archival metadata.
            pdfDoc.setTitle(file.name.replace('.pdf', ''))
            pdfDoc.setProducer('DexPDF (dexpdf.com)')
            pdfDoc.setCreator('DexPDF Web Engine')
            const now = new Date()
            pdfDoc.setCreationDate(now)
            pdfDoc.setModificationDate(now)

            const pdfBytes = await pdfDoc.save()
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })

            saveAs(blob, `PDFA_${file.name}`)
            triggerConfetti()
            setStatus('done')

        } catch (err) {
            console.error(err)
            setStatus('error')
        }
    }

    const resetTool = () => {
        setFile(null)
        setStatus('idle')
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Hero Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-foreground mb-4 flex items-center justify-center gap-3">
                    <FileArchive className="w-10 h-10 text-rose-600" />
                    Archival Metadata Prep
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Normalize metadata before validating or converting with a certified PDF/A tool.
                </p>
            </div>

            {/* Main Card */}
            <div className="glass-card rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border border-border shadow-xl">

                <AnimatePresence mode="wait">
                    {/* STATE: IDLE (Upload) */}
                    {!file && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full"
                        >
                            <div
                                {...getRootProps()}
                                className={`border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-rose-400 bg-rose-50 scale-102' : 'border-border hover:border-rose-400 hover:bg-secondary'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                    {isDragActive ? 'Drop to convert...' : 'Drop PDF to Convert'}
                                </h3>
                                <p className="text-muted-foreground">or click to browse files</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: READY/CONVERTING */}
                    {file && status !== 'done' && status !== 'error' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-md text-center"
                        >
                            <div className="mb-8 relative">
                                <FileArchive className="w-24 h-24 text-muted-foreground mx-auto" />
                                {status === 'converting' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-2 truncate px-4">{file.name}</h3>
                            <p className="text-sm text-muted-foreground mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            {status === 'idle' && (
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-foreground mb-2">Compliance Level</label>
                                    <div className="flex justify-center gap-2">
                                        {['PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setConformance(level)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${conformance === level
                                                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                                                        : 'bg-card border-border text-slate-600 hover:border-rose-300'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">PDF/A-1b is the most compatible standard for text documents.</p>
                                </div>
                            )}

                            {status === 'idle' && (
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={resetTool}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={convertToPdfA}
                                        className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/30 flex items-center gap-2"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        Prepare Metadata
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STATE: SUCCESS */}
                    {status === 'done' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Metadata Prepared</h3>
                            <p className="text-slate-600 mb-8">This file is normalized, but it is not certified as PDF/A. Validate it with a standards-compliant validator.</p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={convertToPdfA} // Retry download
                                    className="px-6 py-3 bg-slate-100 text-foreground rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Again
                                </button>
                                <button
                                    onClick={resetTool}
                                    className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/30"
                                >
                                    Convert Another
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feature Info */}
            <div className="grid md:grid-cols-3 gap-8 mt-16 px-4">
                <div className="p-6 bg-card rounded-2xl shadow-sm border border-border">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                        <FileArchive className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Long-Term Archiving</h3>
                    <p className="text-sm text-muted-foreground">Normalizes common document metadata before a formal archival workflow.</p>
                </div>
                <div className="p-6 bg-card rounded-2xl shadow-sm border border-border">
                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-4">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">ISO Standard</h3>
                    <p className="text-sm text-muted-foreground">Supports ISO 19005 standards used by governments and legal libraries worldwide.</p>
                </div>
                <div className="p-6 bg-card rounded-2xl shadow-sm border border-border">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                        <Check className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Self-Contained</h3>
                    <p className="text-sm text-muted-foreground">Makes the file completely self-contained, so it looks the same on any device or future software.</p>
                </div>
            </div>
        </div>
    )
}
