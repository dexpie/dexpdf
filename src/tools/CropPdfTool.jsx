'use client'
import React, { useState, useRef, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { PDFDocument, rgb } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Download, Scissors, RefreshCw, X } from 'lucide-react'
import { configurePdfWorker } from '../utils/pdfWorker'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'

configurePdfWorker()

export default function CropPdfTool() {
    const [file, setFile] = useState(null)
    const [pageIndex, setPageIndex] = useState(1)
    const [numPages, setNumPages] = useState(0)
    const [imgSrc, setImgSrc] = useState('')
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const [isProcessing, setIsProcessing] = useState(false)
    const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 })

    // Scale factor between the original PDF page and the displayed image
    // We need this to map the crop coordinates back to the PDF
    const [displayScale, setDisplayScale] = useState(1)

    const imgRef = useRef(null)

    const handleFileChange = async (files) => {
        const f = files[0]
        if (!f) return
        setFile(f)
        setPageIndex(1)
        await renderPage(f, 1)
    }

    const renderPage = async (inputFile, pageNum) => {
        setIsProcessing(true)
        try {
            const arrayBuffer = await inputFile.arrayBuffer()
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
            setNumPages(pdf.numPages)
            const page = await pdf.getPage(pageNum)

            // Get original dimensions
            const viewport = page.getViewport({ scale: 2.0 }) // High res render

            // For crop logic, we need the UN-SCALED PDF dimensions (72 DPI usually)
            // But Page Viewport at scale 1.0 gives points.
            const originalViewport = page.getViewport({ scale: 1.0 })
            setPdfDimensions({ width: originalViewport.width, height: originalViewport.height })

            const canvas = document.createElement('canvas')
            canvas.width = viewport.width
            canvas.height = viewport.height

            const ctx = canvas.getContext('2d')
            await page.render({ canvasContext: ctx, viewport }).promise

            setImgSrc(canvas.toDataURL('image/jpeg'))
            setCrop(undefined)
            setCompletedCrop(undefined)
        } catch (err) {
            console.error(err)
            alert("Error rendering PDF")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleImageLoad = (e) => {
        const { width, height, naturalWidth } = e.currentTarget
        // naturalWidth is the canvas width (scale 2.0)
        // width is the displayed width
        // But we want to map to PDF Point dimensions.

        // Strategy:
        // 1. Get Crop % (x, y, w, h in percent) -> easiest for resolution independence
        // 2. Map % to PDF Points (pdfDimensions.width, pdfDimensions.height)

        // ReactCrop gives pixel or percent. 
        // If we use percent crop, we can just multiply by pdfDimensions.width/height
        // But we need to be careful about aspect ratio.

        // For UI, we just let ReactCrop handle it.
        // We calculate 'displayScale' just in case, but percent is safer.
    }

    const handleCrop = async () => {
        if (!file || !completedCrop) return
        setIsProcessing(true)

        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)
            const page = pdfDoc.getPages()[pageIndex - 1]

            const { width: pageWidth, height: pageHeight } = page.getSize()

            // Rendered Image (imgRef) might be scaled via CSS.
            // completedCrop can be in pixels (relative to displayed image) or percent.
            // Let's assume we use Percent for robust scaling.

            let cropX, cropY, cropW, cropH

            if (completedCrop.unit === '%') {
                cropX = (completedCrop.x / 100) * pageWidth
                cropY = (completedCrop.y / 100) * pageHeight
                cropW = (completedCrop.width / 100) * pageWidth
                cropH = (completedCrop.height / 100) * pageHeight
            } else {
                // Pixels relative to the displayed image
                if (!imgRef.current) return
                const image = imgRef.current
                const scaleX = pageWidth / image.width
                const scaleY = pageHeight / image.height

                cropX = completedCrop.x * scaleX
                cropY = completedCrop.y * scaleY
                cropW = completedCrop.width * scaleX
                cropH = completedCrop.height * scaleY
            }

            // PDF Coordinates: Origin is Bottom-Left.
            // ReactCrop/Canvas Origin is Top-Left.
            // So Y needs inversion.
            // CropBox Y = pageHeight - (cropY + cropH)

            // Ensure bounds
            if (cropW <= 0 || cropH <= 0) throw new Error("Invalid selection")

            const pdfCropY = pageHeight - (cropY + cropH)

            page.setCropBox(cropX, pdfCropY, cropW, cropH)
            page.setMediaBox(cropX, pdfCropY, cropW, cropH)

            const pdfBytes = await pdfDoc.save()

            // Download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(file, '_cropped')
            a.click()

            triggerConfetti()

        } catch (err) {
            console.error(err)
            alert("Crop failed: " + err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <ToolLayout title="Crop PDF" description="Trim margins and select content area.">
            <div className="max-w-4xl mx-auto">
                {!file ? (
                    <FileDropZone onFiles={handleFileChange} accept="application/pdf" />
                ) : (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="flex bg-white p-4 rounded-2xl shadow-sm border border-slate-100 justify-between items-center sticky top-4 z-40">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="text-sm font-bold text-slate-700">
                                    Page {pageIndex} of {numPages}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => pageIndex > 1 && renderPage(file, pageIndex - 1) && setPageIndex(p => p - 1)}
                                        disabled={pageIndex <= 1 || isProcessing}
                                        className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold disabled:opacity-50"
                                    >Prev</button>
                                    <button
                                        onClick={() => pageIndex < numPages && renderPage(file, pageIndex + 1) && setPageIndex(p => p + 1)}
                                        disabled={pageIndex >= numPages || isProcessing}
                                        className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold disabled:opacity-50"
                                    >Next</button>
                                </div>
                            </div>

                            <button
                                onClick={handleCrop}
                                disabled={!completedCrop?.width || isProcessing}
                                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
                            >
                                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                                Crop & Download
                            </button>
                        </div>

                        {/* Editor Canvas */}
                        <div className="bg-slate-100 p-8 rounded-3xl min-h-[500px] flex justify-center items-start overflow-auto border border-slate-200">
                            {imgSrc && (
                                <div className="shadow-2xl">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                    >
                                        <img
                                            ref={imgRef}
                                            src={imgSrc}
                                            onLoad={handleImageLoad}
                                            alt="PDF Page"
                                            className="max-w-full h-auto"
                                            style={{ maxHeight: '80vh' }}
                                        />
                                    </ReactCrop>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
