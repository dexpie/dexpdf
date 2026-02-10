'use client'
import React, { useState } from 'react'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
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

        try {
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.convertToHtml({ arrayBuffer })
            const html = result.value

            // Create styled wrapper for accurate rendering
            const wrapper = document.createElement('div')
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

            // High quality canvas rendering
            const canvas = await html2canvas(wrapper, {
                scale: 2.5, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })
            const imgData = canvas.toDataURL('image/png')

            const { jsPDF } = await import('jspdf')

            // A4 dimensions in mm
            const A4_WIDTH = 210
            const A4_HEIGHT = 297
            const MARGIN = 10
            const CONTENT_HEIGHT = A4_HEIGHT - MARGIN * 2

            const imgProps = { width: canvas.width, height: canvas.height }
            const pdfWidth = A4_WIDTH - MARGIN * 2
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            // Multi-page splitting for long documents
            if (pdfHeight > CONTENT_HEIGHT) {
                const pdf = new jsPDF('p', 'mm', 'a4')

                // Calculate how many pages we need
                const totalPages = Math.ceil(pdfHeight / CONTENT_HEIGHT)
                const sliceHeight = Math.floor(imgProps.height / totalPages)

                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) pdf.addPage()

                    // Create a canvas for this page slice
                    const pageCanvas = document.createElement('canvas')
                    pageCanvas.width = imgProps.width
                    pageCanvas.height = sliceHeight
                    const ctx = pageCanvas.getContext('2d')

                    // Draw the slice from the full canvas
                    ctx.drawImage(
                        canvas,
                        0, i * sliceHeight, // Source position
                        imgProps.width, sliceHeight, // Source dimensions
                        0, 0, // Destination position
                        imgProps.width, sliceHeight // Destination dimensions
                    )

                    const pageImgData = pageCanvas.toDataURL('image/png')
                    const pageHeight = (sliceHeight * pdfWidth) / imgProps.width
                    pdf.addImage(pageImgData, 'PNG', MARGIN, MARGIN, pdfWidth, pageHeight)
                }

                pdf.save(getOutputFilename(outputFileName, 'document'))
            } else {
                const pdf = new jsPDF('p', 'mm', 'a4')
                pdf.addImage(imgData, 'PNG', MARGIN, MARGIN, pdfWidth, pdfHeight)
                pdf.save(getOutputFilename(outputFileName, 'document'))
            }

            document.body.removeChild(wrapper)
            setSuccessMsg('Word document converted to PDF successfully!')
            triggerConfetti()

        } catch (err) {
            console.error(err)
            setErrorMsg('Conversion failed: ' + (err.message || err))
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Word to PDF" description={t('tool.word_to_pdf_desc', 'Convert Microsoft Word documents to PDF format.')}>
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
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        hint="Upload Word document (.docx, max 20MB)"
                        disabled={busy}
                    />
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
                                <FileText className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="font-bold text-xl text-slate-800 mb-2">{file.name}</h3>
                                <p className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>

                            <div className="w-full max-w-md">
                                <label className="block text-sm font-medium text-slate-600 mb-2 text-left">Output Filename</label>
                                <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="document" />
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
