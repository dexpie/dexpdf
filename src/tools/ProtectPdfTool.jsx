import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import FilenameInput from '../components/FilenameInput'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, File as FileIcon, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'

configurePdfWorker()

export default function ProtectPdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('')

    async function handleFiles(files) {
        const f = files[0]
        if (!f) return
        if (!f.type.includes('pdf')) { setErrorMsg(t('common.error_pdf_only', 'Please select a PDF file.')); return }

        setFile(f)
        setOutputFileName(getDefaultFilename(f, '_protected'))
        setErrorMsg('')
        setSuccessMsg('')
        setPassword('')
        setConfirmPassword('')
    }

    async function protectPdf() {
        if (!file) return
        if (password.length < 1) { setErrorMsg('Password cannot be empty'); return }
        if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return }

        setBusy(true)
        setErrorMsg('')
        setSuccessMsg('')

        try {
            const array = await file.arrayBuffer()
            const srcPdf = await PDFDocument.load(array)

            const pdf = await PDFDocument.create()
            const copied = await pdf.copyPages(srcPdf, srcPdf.getPageIndices())
            copied.forEach(page => pdf.addPage(page))

            pdf.encrypt({
                userPassword: password,
                ownerPassword: password, // Simple robust default
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    documentAssembly: false,
                }
            })

            const outBytes = await pdf.save()
            const blob = new Blob([outBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_protected')
            a.click()
            URL.revokeObjectURL(url)
            setSuccessMsg(t('protect.success', 'PDF encrypted successfully!'))
            triggerConfetti()
        } catch (err) {
            console.error(err)
            setErrorMsg(t('common.error_process', 'Failed to protect PDF'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Protect PDF" description={t('tool.protect_desc', 'Encrypt your PDF with a password')}>
            <div className="max-w-4xl mx-auto">
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5" /> {errorMsg}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
                            <ShieldCheck className="w-5 h-5" /> {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!file ? (
                    <FileDropZone
                        onFiles={handleFiles}
                        accept="application/pdf"
                        hint="Upload PDF to encrypt"
                        disabled={busy}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg max-w-lg mx-auto"
                    >
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 text-center mb-1">{file.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-sm">
                                <FileIcon className="w-3 h-3" /> {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>

                        <div className="space-y-5 mb-8">
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Set Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Enter strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Output Filename</label>
                            <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="protected" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <ActionButtons
                                primaryText="Encrypt PDF"
                                onPrimary={protectPdf}
                                loading={busy}
                                icon={Lock}
                            />
                            <button
                                onClick={() => setFile(null)}
                                className="w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                disabled={busy}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </ToolLayout>
    )
}
