import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import Papa from 'papaparse'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { Table, FileSpreadsheet, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

configurePdfWorker()

export default function PdfToExcelTool() {
    const { t } = useTranslation()
    const [batchMode, setBatchMode] = useState(false)
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('')

    async function handleFileChange(files) {
        setErrorMsg(''); setSuccessMsg('');
        const f = files[0]
        if (!f) return
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            setErrorMsg('File harus PDF.');
            return;
        }
        setFile(f)
        setOutputFileName(getDefaultFilename(f, '', '.csv'))
    }

    // Basic "Table" extraction heuristic
    // Group text items by roughly same Y coordinate -> Rows
    // Sort items in Row by X coordinate -> Columns
    async function extractTableFromPage(page) {
        const textContent = await page.getTextContent()
        const items = textContent.items

        // Group by Y (allow small variance for alignment jitter)
        const rows = {}
        const Y_TOLERANCE = 5

        items.forEach(item => {
            // PDF Grid: (0,0) is bottom-left. y increases upwards.
            // We want rows from top to bottom.
            // transform[5] is y coordinate.
            const y = item.transform[5]
            const x = item.transform[4]
            const str = item.str.trim()
            if (!str) return

            // Find existing row within tolerance
            let matchedY = Object.keys(rows).find(key => Math.abs(key - y) < Y_TOLERANCE)

            if (!matchedY) {
                matchedY = y
                rows[matchedY] = []
            }
            rows[matchedY].push({ x, str })
        })

        // Sort rows by Y descending (Top to Bottom)
        const sortedY = Object.keys(rows).sort((a, b) => parseFloat(b) - parseFloat(a))

        const csvRows = sortedY.map(y => {
            // Sort items in row by X ascending (Left to Right)
            const rowItems = rows[y].sort((a, b) => a.x - b.x)
            return rowItems.map(item => item.str)
        })

        return csvRows
    }

    async function convert() {
        if (!file) { setErrorMsg('Pilih file PDF terlebih dahulu.'); return; }
        setErrorMsg(''); setSuccessMsg('');
        setBusy(true)

        try {
            const data = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data }).promise
            const numPages = pdf.numPages
            let allRows = []

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i)
                const pageRows = await extractTableFromPage(page)
                allRows = [...allRows, ...pageRows, []] // Add empty row between pages
            }

            const csv = Papa.unparse(allRows)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, ''), '.csv')
            a.click()
            URL.revokeObjectURL(url)

            setSuccessMsg('Berhasil! Data berhasil diekstrak ke CSV.')
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
            const pdf = await pdfjsLib.getDocument({ data }).promise
            let allRows = []
            const numPages = pdf.numPages

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i)
                const pageRows = await extractTableFromPage(page)
                allRows = [...allRows, ...pageRows, []]
                onProgress(10 + (i / numPages) * 80)
            }

            const csv = Papa.unparse(allRows)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            onProgress(100)
            return blob
        } catch (error) {
            throw error
        }
    }

    return (
        <ToolLayout title="PDF to Excel" description="Extract tables and data from PDF into CSV format compatible with Excel">

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
                    🔄 Batch Convert
                </button>
            </div>

            {batchMode ? (
                <UniversalBatchProcessor
                    toolName="PDF to Excel"
                    processFile={processBatchFile}
                    acceptedTypes=".pdf"
                    outputExtension=".csv"
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
                            hint="Upload PDF table to extract"
                        />
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-6">

                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
                                    <FileSpreadsheet className="w-10 h-10" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">{file.name}</h3>
                                    <p className="text-slate-500">Ready to convert to Excel/CSV</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl w-full max-w-md border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-500 mt-1" />
                                        <div className="text-left">
                                            <h4 className="font-semibold text-slate-700 text-sm">How it works</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                We detect text alignment to reconstruct rows and columns. Complex formats may require some manual cleanup in Excel.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full max-w-md">
                                    <label className="block text-sm font-medium text-slate-600 mb-2 text-left">Output Filename</label>
                                    <FilenameInput
                                        value={outputFileName}
                                        onChange={e => setOutputFileName(e.target.value)}
                                        placeholder="spreadsheet"
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
                                        primaryText="Download CSV"
                                        onPrimary={convert}
                                        loading={busy}
                                        className="flex-1"
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
