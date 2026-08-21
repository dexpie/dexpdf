'use client'
import React, { useState } from 'react'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { canvasToPdfBlob } from '../utils/canvasPdf'
import { downloadBlob } from '../utils/fileHelpers'
import { useTranslation } from 'react-i18next'
import { FileCode, FileOutput, AlertCircle, CheckCircle, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'

export default function HtmlToPdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [urlInput, setUrlInput] = useState('')
    const [mode, setMode] = useState('file') // 'file' or 'url' (URL difficult client side due to CORS, but can try prompt info)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('')

    async function handleFileChange(files) {
        setErrorMsg(''); setSuccessMsg('')
        const f = files[0]
        if (!f) return
        const ext = f.name.toLowerCase().split('.').pop()
        if (!['html', 'htm'].includes(ext)) {
            setErrorMsg('Only .html or .htm files are supported.')
            return
        }
        setFile(f)
        setOutputFileName(getDefaultFilename(f, '_converted'))
    }

    async function convert() {
        if (mode === 'file' && !file) { setErrorMsg('Select an HTML file first.'); return; }
        // URL conversion client-side is mostly impossible due to CORS unless using a proxy. 
        // We will stick to File conversion for "Privacy" suite.

        setBusy(true); setErrorMsg(''); setSuccessMsg('')

        let wrapper = null
        try {
            let htmlContent = ''
            if (mode === 'file') {
                htmlContent = await file.text()
            }

            // Render HTML off-screen
            wrapper = document.createElement('div')
            wrapper.style.position = 'absolute'
            wrapper.style.left = '-9999px'
            wrapper.style.width = '1000px' // Desktop-ish width
            wrapper.style.background = 'white'
            wrapper.innerHTML = htmlContent
            wrapper.querySelectorAll('script, iframe, object, embed').forEach(node => node.remove())

            document.body.appendChild(wrapper)

            const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true })
            const result = await canvasToPdfBlob(canvas)
            downloadBlob(result.blob, getOutputFilename(outputFileName, 'webpage'))
            setSuccessMsg(`HTML converted to PDF successfully (${result.pageCount} page${result.pageCount === 1 ? '' : 's'}).`)
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
        <ToolLayout title="HTML to PDF" description="Convert HTML files to PDF.">
            <div className="max-w-4xl mx-auto">
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-destructive/10 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5" /> {errorMsg}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-500/10 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
                            <CheckCircle className="w-5 h-5" /> {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!file ? (
                    <FileDropZone onFiles={handleFileChange} accept=".html,.htm" hint="Upload HTML file" disabled={busy} />
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-2">
                                <FileCode className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="font-bold text-xl text-foreground mb-2">{file.name}</h3>
                                <p className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>

                            <div className="w-full max-w-md">
                                <label className="block text-sm font-medium text-muted-foreground mb-2 text-left">Output Filename</label>
                                <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="webpage" />
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
                                    primaryIcon={FileOutput}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </ToolLayout>
    )
}
