'use client'
import React, { useState, useRef, useCallback } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import Webcam from 'react-webcam'
import { PDFDocument } from 'pdf-lib'
import { Camera, Download, Trash2, RefreshCw, X, Plus } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'
import { getOutputFilename } from '../utils/fileHelpers'

export default function ScanTool() {
    const webcamRef = useRef(null)
    const [images, setImages] = useState([])
    const [isBusy, setIsBusy] = useState(false)
    const [facingMode, setFacingMode] = useState('environment') // Default to back camera on mobile

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
            setImages(prev => [...prev, imageSrc])
        }
    }, [webcamRef])

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const generatePdf = async () => {
        if (images.length === 0) return
        setIsBusy(true)
        try {
            const pdfDoc = await PDFDocument.create()

            for (const imgDataUrl of images) {
                const img = await pdfDoc.embedJpg(imgDataUrl)
                // A4 dimensions at 72 PPI: 595 x 842
                // We want to fit the image to page.
                const page = pdfDoc.addPage([595, 842])

                const { width, height } = img.scale(1)

                // Fit logic (Contain)
                const pageWidth = 595
                const pageHeight = 842

                const scaleX = pageWidth / width
                const scaleY = pageHeight / height
                const scale = Math.min(scaleX, scaleY)

                const displayWidth = width * scale
                const displayHeight = height * scale

                const x = (pageWidth - displayWidth) / 2
                const y = (pageHeight - displayHeight) / 2

                page.drawImage(img, {
                    x,
                    y,
                    width: displayWidth,
                    height: displayHeight,
                })
            }

            const pdfBytes = await pdfDoc.save()
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(null, '_scan', 'scanned_doc')
            a.click()
            triggerConfetti()

        } catch (err) {
            console.error(err)
            alert("Failed to generate PDF")
        } finally {
            setIsBusy(false)
        }
    }

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: facingMode
    }

    return (
        <ToolLayout title="Scan to PDF" description="Use your camera to scan documents into a unified PDF.">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Camera Section */}
                <div className="flex-1 bg-black rounded-3xl overflow-hidden relative shadow-2xl">
                    <div className="relative aspect-[3/4] md:aspect-video bg-slate-900 flex items-center justify-center">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay Controls */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-10">
                            <button
                                onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
                                className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
                                title="Switch Camera"
                            >
                                <RefreshCw className="w-6 h-6" />
                            </button>

                            <button
                                onClick={capture}
                                className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 shadow-xl active:scale-95 transition-all flex items-center justify-center"
                            >
                                <div className="w-12 h-12 bg-red-500 rounded-full" />
                            </button>

                            <div className="w-12" /> {/* Spacer */}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Gallery */}
                <div className="w-full md:w-80 flex flex-col gap-4">
                    <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">Scanned Pages ({images.length})</h3>
                            {images.length > 0 && (
                                <button onClick={() => setImages([])} className="text-red-500 text-xs hover:underline">Clear All</button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[600px] pr-2">
                            {images.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic">
                                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                                    No pages scanned yet.
                                </div>
                            ) : (
                                images.map((img, idx) => (
                                    <div key={idx} className="relative group bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={img} alt={`Page ${idx + 1}`} className="w-full h-auto object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="p-1.5 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                            Page {idx + 1}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 mt-auto border-t border-slate-100">
                            <button
                                onClick={generatePdf}
                                disabled={images.length === 0 || isBusy}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isBusy ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
