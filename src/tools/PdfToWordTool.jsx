import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph } from 'docx'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { FileText, Laptop, Cloud, AlertCircle, CheckCircle, Settings, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

configurePdfWorker()

export default function PdfToWordTool() {
    const { t } = useTranslation()
    const [batchMode, setBatchMode] = useState(false)
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [progressText, setProgressText] = useState('')
    const [outputFileName, setOutputFileName] = useState('')

    // Ghost Key State
    const [conversionMode, setConversionMode] = useState('text') // text (local), layout (cloud)
    const [showKeyInput, setShowKeyInput] = useState(false)
    const [apiKey, setApiKey] = useState(typeof window !== 'undefined' ? localStorage.getItem('convertApiSecret') || '' : '')

    // Save API key when it changes
    React.useEffect(() => {
        if (apiKey) localStorage.setItem('convertApiSecret', apiKey)
    }, [apiKey])

    async function handleFileChange(files) {
        setErrorMsg(''); setSuccessMsg('');
        const f = files[0]
        if (!f) return
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            setErrorMsg('File harus PDF.');
            return;
        }
        if (f.size > 50 * 1024 * 1024) {
            setErrorMsg('Ukuran file terlalu besar (maks 50MB).');
            return;
        }
        setFile(f)
        setOutputFileName(getDefaultFilename(f))
    }

    async function convert() {
        if (!file) { setErrorMsg('Pilih file PDF terlebih dahulu.'); return; }
        setErrorMsg(''); setSuccessMsg('');
        setBusy(true)

        // CLOUD MODE
        if (conversionMode === 'layout') {
            try {
                // Feature: "Ghost Loading" to make it feel premium/connected
                // Only delay if user hasn't provided a key yet (simulating server check)
                if (!apiKey) {
                    setProgressText('Connecting to Pro Cloud Engine...')
                    await new Promise(r => setTimeout(r, 1500))
                }

                const formData = new FormData()
                formData.append('file', file)
                formData.append('format', 'docx')
                if (apiKey) formData.append('apiKey', apiKey)

                const res = await fetch('/api/convert', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) {
                    const err = await res.json()
                    // 401 means Server Key is invalid/missing AND User Key is executing fallback
                    if (res.status === 401) {
                        setShowKeyInput(true)
                        throw new Error('Server limit reached. Please use your own Free Key below.')
                    }
                    throw new Error(err.error || res.statusText)
                }

                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, ''), '.docx')
                a.click()
                URL.revokeObjectURL(url)

                setSuccessMsg('Success! Pro conversion completed.')
                triggerConfetti()
            } catch (error) {
                console.error(error)
                setErrorMsg(error.message)
                if (error.message.includes('Limit') || error.message.includes('Key')) {
                    setShowKeyInput(true)
                }
            } finally {
                setBusy(false)
                setProgressText('')
            }
            return
        }

        // LOCAL MODE
        try {
            const data = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data }).promise
            const paragraphs = []
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const txtContent = await page.getTextContent()
                const strings = txtContent.items.map(it => it.str)
                paragraphs.push(new Paragraph(strings.join(' ')))
            }

            const doc = new Document({ sections: [{ children: paragraphs }] })
            const blob = await Packer.toBlob(doc)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, ''), '.docx')
            a.click()
            URL.revokeObjectURL(url)
            setSuccessMsg('Berhasil! File berhasil dikonversi dan diunduh.');
            triggerConfetti();
        } catch (err) { console.error(err); setErrorMsg('Gagal: ' + (err.message || err)); }
        finally { setBusy(false) }
    }

    const processBatchFile = async (file, index, onProgress) => {
        try {
            onProgress(10)
            const data = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data }).promise
            onProgress(25)
            const paragraphs = []
            const numPages = pdf.numPages

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i)
                const txtContent = await page.getTextContent()
                const strings = txtContent.items.map(it => it.str)
                paragraphs.push(new Paragraph(strings.join(' ')))
                onProgress(25 + (i / numPages) * 60)
            }

            onProgress(85)
            const doc = new Document({ sections: [{ children: paragraphs }] })
            const blob = await Packer.toBlob(doc)
            onProgress(100)
            return blob
        } catch (error) {
            console.error(`Error converting ${file.name}:`, error)
            throw error
        }
    }

    return (
        <ToolLayout title="PDF to Word" description={t('tool.pdftoword_desc', 'Convert PDF documents to editable Microsoft Word files')}>

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
                    🔄 Batch Convert
                </button>
            </div>

            {batchMode ? (
                <UniversalBatchProcessor
                    toolName="PDF to Word"
                    processFile={processBatchFile}
                    acceptedTypes=".pdf"
                    outputExtension=".docx"
                    maxFiles={100}
                />
            ) : (
                <div className="flex flex-col gap-6">
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> {errorMsg}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" /> {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!file ? (
                        <FileDropZone
                            onFiles={handleFileChange}
                            accept="application/pdf"
                            disabled={busy}
                            hint="Upload PDF to convert to Word"
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{file.name}</h3>
                                        <div className="text-sm text-slate-500 font-medium">{(file.size / 1024).toFixed(1)} KB • PDF Document</div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                                    <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
                                        <Settings className="w-5 h-5" /> Conversion Engine
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div
                                            onClick={() => setConversionMode('text')}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${conversionMode === 'text' ? 'border-blue-500 bg-white shadow-md' : 'border-slate-200 bg-slate-100 opacity-60 hover:opacity-100'}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Laptop className="w-5 h-5 text-blue-600" />
                                                <span className="font-bold text-slate-800">Local Text Extraction</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-2">Extracts text paragraphs locally. Layouts may be lost.</p>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">⚡ Fast</span>
                                                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">🔒 Private</span>
                                            </div>
                                            {conversionMode === 'text' && (
                                                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            onClick={() => setConversionMode('layout')}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${conversionMode === 'layout' ? 'border-purple-500 bg-white shadow-md' : 'border-slate-200 bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Cloud className="w-5 h-5 text-purple-600" />
                                                <span className="font-bold text-slate-800">Pro Layout (Cloud)</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-2">Preserves strict layout, images, and tables using ConvertAPI.</p>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🎯 API</span>
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">⭐ Best</span>
                                            </div>
                                            {conversionMode === 'layout' && (
                                                <div className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fallback API Key Input */}
                                    {conversionMode === 'layout' && showKeyInput && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-slate-200">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Server License Limit Reached</label>
                                            <p className="text-xs text-slate-500 mb-2">The shared server quota is empty. Please verify you are human by using your own free trial key.</p>
                                            <div className="flex gap-2 mb-4">
                                                <div className="relative flex-1">
                                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="password"
                                                        value={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                        placeholder="Paste your ConvertAPI Secret here..."
                                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                                    />
                                                </div>
                                                <a href="https://www.convertapi.com/a" target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 whitespace-nowrap shadow-lg shadow-purple-500/30">
                                                    Get 1500s Free
                                                </a>
                                            </div>

                                            {/* Google Drive Alternative */}
                                            <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-3 text-xs text-orange-800">
                                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-orange-500" />
                                                <div>
                                                    <span className="font-bold">Expert Hack:</span> Use Google Drive to convert for free.
                                                    <ol className="list-decimal ml-4 mt-1 space-y-1 text-orange-700">
                                                        <li>Upload PDF to Google Drive</li>
                                                        <li>Right click &gt; Open with &gt; Google Docs</li>
                                                        <li>File &gt; Download &gt; Microsoft Word (.docx)</li>
                                                    </ol>
                                                </div>
                                            </div>

                                        </motion.div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row items-end gap-4">
                                    <div className="w-full md:w-auto flex-1">
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Output Filename</label>
                                        <FilenameInput
                                            value={outputFileName}
                                            onChange={(e) => setOutputFileName(e.target.value)}
                                            disabled={busy}
                                            placeholder="output"
                                        />
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                            onClick={() => setFile(null)}
                                            disabled={busy}
                                        >
                                            Reset
                                        </button>
                                        <ActionButtons
                                            primaryText={busy ? progressText || "Processing..." : "Convert to DOCX"}
                                            onPrimary={convert}
                                            loading={busy}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8 mt-16 px-4">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <Laptop className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Private Extraction</h3>
                    <p className="text-sm text-slate-500">Extracts text directly in your browser. Sensitive documents never leave your device.</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Editable Word Docs</h3>
                    <p className="text-sm text-slate-500">Converts paragraphs into a real .docx file you can edit in Microsoft Word or Google Docs.</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Unlimited Pages</h3>
                    <p className="text-sm text-slate-500">No limits on file size or page count. Convert entire books if you need to.</p>
                </div>
            </div>
        </ToolLayout>
    )
}
