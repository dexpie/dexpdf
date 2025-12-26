'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, FileType } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void
    accept?: Record<string, string[]>
    maxSize?: number // in bytes
}

export function FileUpload({ onFilesSelected, accept = { 'application/pdf': ['.pdf'] }, maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([])
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        if (fileRejections.length > 0) {
            setError(`File must be PDF and under ${maxSize / 1024 / 1024}MB.`)
            return
        }
        setError(null)
        setFiles(prev => [...prev, ...acceptedFiles])
        onFilesSelected(acceptedFiles)
    }, [onFilesSelected, maxSize])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
    })

    const removeFile = (name: string) => {
        setFiles(files.filter(f => f.name !== name))
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-in-out",
                    isDragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center transition-colors",
                        isDragActive ? "bg-primary text-white" : "bg-white text-primary shadow-sm"
                    )}>
                        <Upload className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-800">
                            {isDragActive ? "Drop PDF here" : "Select PDF files"}
                        </h3>
                        <p className="text-slate-500 text-lg">
                            or drag and drop them here
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center font-medium"
                >
                    {error}
                </motion.div>
            )}

            {/* File List */}
            <div className="mt-8 space-y-3">
                <AnimatePresence>
                    {files.map((file) => (
                        <motion.div
                            key={file.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                    <FileType className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

        </div>
    )
}
