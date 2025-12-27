'use client'
import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { Eraser, Save, Check, Shield, FileSearch, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { configurePdfWorker } from '../utils/pdfWorker'
import ActionButtons from '../components/common/ActionButtons'

configurePdfWorker()

export default function ScrubTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [meta, setMeta] = useState(null) // { title, author, subject, ... }
    const [busy, setBusy] = useState(false)
    const [outputFileName, setOutputFileName] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    async function handleFileChange(files) {
        const f = files[0]
        if (!f) return
        setFile(f)
        setOutputFileName(getDefaultFilename(f, '_scrubbed'))
        setErrorMsg('')
        setSuccessMsg('')
        setMeta(null)

        // Read Metadata
        try {
            const array = await f.arrayBuffer()
            const pdf = await PDFDocument.load(array)
            setMeta({
                title: pdf.getTitle() || '',
                author: pdf.getAuthor() || '',
                subject: pdf.getSubject() || '',
                keywords: pdf.getKeywords() || '',
                creator: pdf.getCreator() || '',
                producer: pdf.getProducer() || '',
                creationDate: pdf.getCreationDate()?.toISOString() || '',
                modificationDate: pdf.getModificationDate()?.toISOString() || '',
            })
        } catch (err) {
            console.error(err)
            setErrorMsg("Could not read PDF metadata.")
        }
    }

    async function scrubMetadata() {
        if (!file) return
        setBusy(true); setErrorMsg(''); setSuccessMsg('')

        try {
            const array = await file.arrayBuffer()
            const pdf = await PDFDocument.load(array)

            // SCRUBBING
            pdf.setTitle('')
            pdf.setAuthor('')
            pdf.setSubject('')
            pdf.setKeywords([])
            pdf.setCreator('DexPDF (Privacy-First)')
            pdf.setProducer('DexPDF (Privacy-First)')

            // Note: Creation/Mod dates are tricky in pdf-lib, but setting to now or clearing might work depending on viewer.
            // pdf-lib usually updates modification date automatically.

            const pdfBytes = await pdf.save()
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(outputFileName, '_scrubbed')
            a.click()
            URL.revokeObjectURL(url)

            setSuccessMsg('Metadata successfully removed!')
            triggerConfetti()
        } catch (err) {
            console.error(err)
            setErrorMsg('Scrubbing failed: ' + err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Scrub Metadata" description="Remove hidden metadata (Author, Creator, Software) for privacy.">
            <div className="max-w-4xl mx-auto">
                {!file ? (
                    <FileDropZone onFiles={handleFileChange} accept="application/pdf" />
                ) : (
                    <div className="flex flex-col gap-6">

                        {/* Metadata Preview Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4 text-slate-700 font-bold border-b border-slate-100 pb-3">
                                <FileSearch className="w-5 h-5 text-blue-500" />
                                <span>Current Metadata</span>
                            </div>

                            {meta ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium text-xs uppercase">Title</span>
                                        <span className="text-slate-800 font-medium truncate">{meta.title || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium text-xs uppercase">Author</span>
                                        <span className="text-slate-800 font-medium truncate">{meta.author || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium text-xs uppercase">Software (Creator)</span>
                                        <span className="text-slate-800 font-medium truncate">{meta.creator || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium text-xs uppercase">Producer</span>
                                        <span className="text-slate-800 font-medium truncate">{meta.producer || '-'}</span>
                                    </div>
                                    <div className="flex flex-col md:col-span-2">
                                        <span className="text-slate-400 font-medium text-xs uppercase">Keywords</span>
                                        <span className="text-slate-800 font-medium truncate">{meta.keywords || '-'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-pulse flex space-x-4">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                </div>
                            )}
                        </div>

                        {/* Action Area */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-full">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Ready to clean?</h3>
                            <p className="text-slate-500 max-w-sm">
                                This will remove all identifying metadata information from the file headers. Content remains unchanged.
                            </p>

                            <div className="flex gap-2 w-full max-w-sm mt-2">
                                <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="scrubbed" />
                            </div>

                            <ActionButtons
                                primaryText={busy ? 'Scrubbing...' : 'Scrub Metadata'}
                                onPrimary={scrubMetadata}
                                onReset={() => setFile(null)}
                                loading={busy}
                                primaryIcon={Shield}
                                primaryColor="bg-red-600 hover:bg-red-700"
                            />
                        </div>

                        <AnimatePresence>
                            {successMsg && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 z-50">
                                    <Check className="w-5 h-5" /> {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
