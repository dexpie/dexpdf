'use client'

import React, { useState } from 'react'
import { FileUpload } from '@/components/file-upload'
import { Button } from '@/components/ui/button'
import { mergePdfs } from '@/lib/pdf-utils'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function MergePage() {
    const [files, setFiles] = useState<File[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isDone, setIsDone] = useState(false)

    const handleProcess = async () => {
        if (files.length < 2) return
        setIsProcessing(true)

        try {
            const mergedBytes = await mergePdfs(files)
            const blob = new Blob([mergedBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)

            // Auto download
            const a = document.createElement('a')
            a.href = url
            a.download = `merged-dexpdf-${Date.now()}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            setIsDone(true)
        } catch (e) {
            console.error(e)
            alert('Failed to merge PDFs')
        } finally {
            setIsProcessing(false)
        }
    }

    if (isDone) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">PDFs Merged Successfully!</h1>
                    <p className="text-slate-500">Your download should have started automatically.</p>
                    <Button variant="outline" onClick={() => { setIsDone(false); setFiles([]); }}>
                        Merge More Files
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-50">
            <div className="container mx-auto max-w-4xl text-center space-y-8">

                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-900">Merge PDF Files</h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Combine PDFs in the order you want with the easiest PDF merger available.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <FileUpload
                        onFilesSelected={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
                    />

                    <div className="mt-8 flex justify-center py-4 border-t border-slate-100">
                        <Button
                            size="xl"
                            disabled={files.length < 2 || isProcessing}
                            onClick={handleProcess}
                            className={cn(
                                "transition-all duration-300 w-full md:w-auto min-w-[200px]",
                                isProcessing ? "opacity-80" : "hover:scale-105"
                            )}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Merge {files.length > 0 ? `${files.length} Files` : "PDFs"}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}
