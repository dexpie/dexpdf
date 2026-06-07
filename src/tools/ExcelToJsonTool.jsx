import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { FileJson, Download, FileSpreadsheet } from 'lucide-react'
import readXlsxFile from 'read-excel-file'
import { triggerConfetti } from '../utils/confetti'

export default function ExcelToJsonTool() {
    const [file, setFile] = useState(null)
    const [json, setJson] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const processFile = async (files) => {
        const f = files[0]
        if (!f) return
        setFile(f)
        setIsProcessing(true)

        try {
            const rows = await readXlsxFile(f)
            // Assuming first row is header
            const headers = rows[0]
            const data = rows.slice(1).map(row => {
                let obj = {}
                headers.forEach((header, index) => {
                    obj[header] = row[index]
                })
                return obj
            })

            setJson(JSON.stringify(data, null, 2))
            triggerConfetti()
        } catch (e) {
            console.error(e)
            alert('Failed to parse Excel file.')
        } finally {
            setIsProcessing(false)
        }
    }

    const download = () => {
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${file.name.split('.')[0]}.json`
        a.click()
    }

    return (
        <ToolLayout title="Excel to JSON" description="Convert Spreadsheet data to JSON.">
            <div className="max-w-4xl mx-auto">
                {!json ? (
                    <FileDropZone
                        onFiles={processFile}
                        accept=".xlsx, .xls"
                        title={isProcessing ? "Processing..." : "Drop Excel file here"}
                    />
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">{file.name}</h3>
                                    <p className="text-sm text-muted-foreground">Converted successfully</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setJson(null)} className="px-4 py-2 text-muted-foreground font-bold hover:text-red-500">Reset</button>
                                <button onClick={download} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg">
                                    <Download className="w-4 h-4" /> Download JSON
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-800">
                            <pre className="text-green-400 font-mono text-sm overflow-auto max-h-[500px]">
                                {json}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
