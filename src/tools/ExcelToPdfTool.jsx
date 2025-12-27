'use client'
import React, { useState } from 'react'
import readXlsxFile from 'read-excel-file'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { FileSpreadsheet, FileOutput, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'

export default function ExcelToPdfTool() {
    const { t } = useTranslation()
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('')
    const [rows, setRows] = useState([])

    async function handleFileChange(files) {
        setErrorMsg(''); setSuccessMsg(''); setRows([])
        const f = files[0]
        if (!f) return
        const ext = f.name.toLowerCase().split('.').pop()
        if (!['xlsx'].includes(ext)) {
            setErrorMsg('Only .xlsx files are supported currently.')
            return
        }
        setFile(f)
        setOutputFileName(getDefaultFilename(f, '_converted'))

        try {
            const data = await readXlsxFile(f)
            setRows(data.slice(0, 10)) // Preview 10 rows
        } catch (err) {
            console.error(err)
            setErrorMsg('Failed to read Excel file. Ensure it is a valid .xlsx')
        }
    }

    async function convert() {
        if (!file) { setErrorMsg('Select an Excel file first.'); return; }
        setBusy(true); setErrorMsg(''); setSuccessMsg('')

        try {
            const data = await readXlsxFile(file)

            // Render Full HTML Table off-screen
            const wrapper = document.createElement('div')
            wrapper.style.padding = '20px'
            wrapper.style.width = '1000px' // Fixed width for consistent PDF scale
            wrapper.style.background = 'white'

            const table = document.createElement('table')
            table.style.width = '100%'
            table.style.borderCollapse = 'collapse'
            table.style.fontFamily = 'Arial, sans-serif'
            table.style.fontSize = '12px'

            data.forEach((row, rI) => {
                const tr = document.createElement('tr')
                row.forEach((cell, cI) => {
                    const td = document.createElement(rI === 0 ? 'th' : 'td')
                    td.style.border = '1px solid #ddd'
                    td.style.padding = '8px'
                    td.style.textAlign = 'left'
                    if (rI === 0) td.style.background = '#f1f5f9'
                    td.innerText = cell !== null ? String(cell) : ''
                    tr.appendChild(td)
                })
                table.appendChild(tr)
            })

            wrapper.appendChild(table)
            document.body.appendChild(wrapper) // Append to body to render

            // Convert with html2canvas (Standard Strategy)
            const canvas = await html2canvas(wrapper, { scale: 2 })
            const imgData = canvas.toDataURL('image/png')

            const { jsPDF } = await import('jspdf')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 210
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(getOutputFilename(outputFileName, 'document'))

            document.body.removeChild(wrapper)

            setSuccessMsg('Excel successfully converted to PDF!')
            triggerConfetti()

        } catch (err) {
            console.error(err)
            setErrorMsg('Conversion failed: ' + (err.message || err))
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Excel to PDF" description="Convert XLS/XLSX spreadsheets to PDF documents.">
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
                    <FileDropZone onFiles={handleFileChange} accept=".xlsx" hint="Upload Excel (.xlsx)" disabled={busy} />
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-2">
                                <FileSpreadsheet className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="font-bold text-xl text-slate-800 mb-2">{file.name}</h3>
                                <p className="text-slate-500">{(file.size / 1024).toFixed(1)} KB • {rows.length > 0 ? 'Preview Loaded' : 'Ready'}</p>
                            </div>

                            {rows.length > 0 && (
                                <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-xs text-slate-600">
                                    <table className="w-full">
                                        <tbody>
                                            {rows.map((r, i) => (
                                                <tr key={i} className={i === 0 ? "bg-slate-100 font-bold" : ""}>
                                                    {r.map((c, j) => (
                                                        <td key={j} className="p-2 border-b border-r border-slate-200 last:border-r-0 truncate max-w-[100px]">{c}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-2 text-center text-slate-400 italic">Preview (First 10 rows)</div>
                                </div>
                            )}

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
