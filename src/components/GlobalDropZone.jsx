'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Image as ImageIcon, Upload } from 'lucide-react'

export default function GlobalDropZone() {
    const router = useRouter()
    const [isDragging, setIsDragging] = useState(false)
    const [dragType, setDragType] = useState(null)

    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault()
            e.stopPropagation()

            const items = e.dataTransfer.items
            if (items && items.length > 0) {
                const type = items[0].type
                if (type === 'application/pdf') setDragType('pdf')
                else if (type.startsWith('image/')) setDragType('image')
                else setDragType('other')
            }

            setIsDragging(true)
        }

        const handleDragLeave = (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.clientX === 0 && e.clientY === 0) {
                setIsDragging(false)
                setDragType(null)
            }
        }

        const handleDrop = (e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            setDragType(null)

            // Auto-route based on file type
            const files = e.dataTransfer.files
            if (files && files.length > 0) {
                const file = files[0]
                if (file.type === 'application/pdf') {
                    if (files.length > 1) {
                        router.push('/merge')
                    } else {
                        router.push('/compress')
                    }
                } else if (file.type.startsWith('image/')) {
                    router.push('/imgs2pdf')
                }
            }
        }

        window.addEventListener('dragover', handleDragOver)
        window.addEventListener('dragleave', handleDragLeave)
        window.addEventListener('drop', handleDrop)

        return () => {
            window.removeEventListener('dragover', handleDragOver)
            window.removeEventListener('dragleave', handleDragLeave)
            window.removeEventListener('drop', handleDrop)
        }
    }, [router])

    if (!isDragging) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-12 text-center shadow-2xl border-2 border-dashed border-red-300 max-w-md mx-4">
                <div className="w-16 h-16 bg-red-50 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    {dragType === 'pdf' ? (
                        <FileText className="w-8 h-8 text-red-500" />
                    ) : dragType === 'image' ? (
                        <ImageIcon className="w-8 h-8 text-blue-500" />
                    ) : (
                        <Upload className="w-8 h-8 text-slate-400" />
                    )}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                    {dragType === 'pdf' ? 'Drop your PDF here' :
                     dragType === 'image' ? 'Drop image to convert' :
                     'Drop your file here'}
                </h2>
                <p className="text-sm text-slate-400">
                    {dragType === 'pdf' ? 'We\'ll open the best tool for your file' :
                     dragType === 'image' ? 'Convert to PDF instantly' :
                     'Release to process your file'}
                </p>
            </div>
        </div>
    )
}
