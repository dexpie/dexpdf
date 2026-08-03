'use client'
import React, { useState } from 'react'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename, downloadBlob } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import CloudConversionOption from '../components/common/CloudConversionOption'
import { convertWithCloud } from '../utils/cloudConversion'
import { canvasToPdfBlob } from '../utils/canvasPdf'
import { useTranslation } from 'react-i18next'
import { FileText, FileOutput, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WordToPdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('')
    const [conversionMode, setConversionMode] = useState('local')

    async function handleFileChange(files) {
        setErrorMsg(''); setSuccessMsg('')
        const f = files[0]
        if (!f) return

        if (!f.name.toLowerCase().endsWith('.docx')) {
            setErrorMsg('Please select a .docx file.')
            return
        }

        if (f.size > 20 * 1024 * 1024) {
            setErrorMsg('File too large (max 20MB).')
            return
        }

        setFile(f)
        setOutputFileName(getDefaultFilename(f, '_converted'))
    }

    async function convert() {
        if (!file) {
            setErrorMsg('Please select a Word document first.')
            return
        }

        setErrorMsg('')
        setSuccessMsg('')
        setBusy(true)

        if (conversionMode === 'cloud') {
            try {
                const blob = await convertWithCloud(file, { sourceFormat: 'docx', targetFormat: 'pdf' })
                downloadBlob(blob, getOutputFilename(outputFileName, 'document'))
                setSuccessMsg('DOCX converted with high-fidelity cloud rendering.')
                triggerConfetti()
            } catch (err) {
                console.error(err)
                setErrorMsg(err.status === 401
                    ? 'Cloud conversion is not configured. Add a valid CONVERT_API_SECRET, then try again or switch to Local.'
                    : 'Cloud conversion failed: ' + (err.message || err))
            } finally {
                setBusy(false)
            }
            return
        }

        let wrapper = null
        try {
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.convertToHtml({ arrayBuffer })
            const html = result.value

            // Create styled wrapper for accurate rendering
            wrapper = document.createElement('div')
            wrapper.innerHTML = `
                <style>
                    * { font-family: 'Segoe UI', Arial, sans-serif; }
                    p { margin: 0 0 12px 0; line-height: 1.5; }
                    h1, h2, h3 { margin: 16px 0 8px 0; }
                    table { border-collapse: collapse; width: 100%; }
                    td, th { border: 1px solid #ccc; padding: 8px; }
                    img { max-width: 100%; height: auto; }
                </style>
                ${html}
            `
            wrapper.style.padding = '40px'
            wrapper.style.position = 'absolute'
            wrapper.style.left = '-9999px'
            wrapper.style.width = '750px' // A4-like width
            wrapper.style.background = 'white'
            wrapper.style.fontSize = '14px'
            wrapper.style.lineHeight = '1.6'
            document.body.appendChild(wrapper)

            // Wait for images to load
            const images = wrapper.querySelectorAll('img')
            await Promise.all(Array.from(images).map(img =>
                img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r })
            ))

            const canvas = await html2canvas(wrapper, {
                scale: 2.5, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })
            const renderedPdf = await canvasToPdfBlob(canvas)
            downloadBlob(renderedPdf.blob, getOutputFilename(outputFileName, 'document'))
            setSuccessMsg(`Word document converted to PDF successfully (${renderedPdf.pageCount} page${renderedPdf.pageCount === 1 ? '' : 's'}).`)
            triggerConfetti()

        } catch (err) {
            console.error(err)
            setErrorMsg('Conversion failed: ' + (err.message || err))
        } finally {
            if (wrapper?.isConnected) wrapper.remove()
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="DOCX to PDF" description={t('tool.word_to_pdf_desc', 'Render a DOCX document into PDF pages. Complex Word layouts may differ.')}>
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

                <CloudConversionOption value={conversionMode} onChange={setConversionMode} disabled={busy} />

                {!file ? (
                    <FileDropZone
                        onFiles={handleFileChange}
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        hint="Upload Word document (.docx, max 20MB)"
                        disabled={busy}
                    />
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
                                <FileText className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="font-bold text-xl text-foreground mb-2">{file.name}</h3>
                                <p className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>

                            <div className="w-full max-w-md">
                                <label className="block text-sm font-medium text-slate-600 mb-2 text-left">Output Filename</label>
                                <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="document" />
                            </div>

                            <div className="flex gap-3 w-full max-w-md">
                                <button
                                    onClick={() => setFile(null)}
                                    className="flex-1 py-3 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors"
                                    disabled={busy}
                                >
                                    Cancel
                                </button>
                                <ActionButtons
                                    primaryText="Convert to PDF"
                                    onPrimary={convert}
                                    loading={busy}
                                    className="flex-1"
                                    icon={FileOutput}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </ToolLayout>
    )
}
