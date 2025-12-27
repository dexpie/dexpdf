'use client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Wand2, Download, RefreshCw, CheckCircle, ArrowRight, Tag } from 'lucide-react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { analyzePdf } from '../utils/smartPdfAI'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export default function SmartOrganizeTool() {
    const { t } = useTranslation()
    const [files, setFiles] = useState([])
    const [analyzedFiles, setAnalyzedFiles] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isDone, setIsDone] = useState(false)

    const handleFiles = async (uploadedFiles) => {
        setFiles(uploadedFiles)
        setAnalyzedFiles([])
        setIsDone(false)
        await processFiles(uploadedFiles)
    }

    const processFiles = async (fileList) => {
        setIsProcessing(true)
        const results = []

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            // Analyze each file
            const analysis = await analyzePdf(file)
            results.push({
                file,
                ...analysis,
                id: i
            })
            // Update state incrementally for visual feedback
            setAnalyzedFiles([...results])
        }

        setIsProcessing(false)
        setIsDone(true)
    }

    const downloadAll = async () => {
        if (analyzedFiles.length === 1) {
            const item = analyzedFiles[0]
            saveAs(item.file, item.suggestedName)
        } else {
            const zip = new JSZip()
            // Group by Category folders
            analyzedFiles.forEach(item => {
                const folder = zip.folder(item.category)
                folder.file(item.suggestedName, item.file)
            })
            const content = await zip.generateAsync({ type: 'blob' })
            saveAs(content, 'Smart_Organized_Files.zip')
        }
    }

    return (
        <ToolLayout title="Smart Organizer (AI)" description="Automatically rename and sort your PDFs based on their content.">

            {!files.length ? (
                <FileDropZone
                    onFiles={handleFiles}
                    accept="application/pdf"
                    multiple={true}
                    hint="Drop multiple PDFs here to magic sort them"
                />
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Wand2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">AI Analysis</h3>
                                <p className="text-xs text-slate-500">{isProcessing ? 'Analyzing content...' : `${analyzedFiles.length} files processed`}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFiles([])}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                            >
                                Reset
                            </button>
                            {isDone && (
                                <button
                                    onClick={downloadAll}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2 animate-pulse"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Organized
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-4">Original File</div>
                            <div className="col-span-1"></div>
                            <div className="col-span-4">Smart Suggestion</div>
                            <div className="col-span-3">Category</div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {analyzedFiles.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors"
                                >
                                    {/* Original */}
                                    <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                                        <FileText className="w-8 h-8 text-slate-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate" title={item.originalName}>{item.originalName}</p>
                                            <p className="text-xs text-slate-400">{(item.file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="col-span-1 flex justify-center">
                                        <ArrowRight className="w-4 h-4 text-slate-300" />
                                    </div>

                                    {/* Smart Suggestion */}
                                    <div className="col-span-4">
                                        <div className="flex items-center gap-2">
                                            <Wand2 className="w-3 h-3 text-indigo-500" />
                                            <p className="text-sm font-bold text-indigo-700 truncate" title={item.suggestedName}>
                                                {item.suggestedName}
                                            </p>
                                        </div>
                                        {item.date && (
                                            <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 mt-1 inline-block">
                                                Detected: {item.date}
                                            </span>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="col-span-3">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${item.category === 'Finance' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                item.category === 'Legal' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    item.category === 'Personal' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            <Tag className="w-3 h-3" />
                                            {item.category}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {files.length > analyzedFiles.length && (
                            <div className="p-8 flex justify-center text-slate-400">
                                <RefreshCw className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ToolLayout>
    )
}
